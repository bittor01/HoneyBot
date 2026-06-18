/**
 * HoneyBot - A Discord bot that bans anyone who posts in specific channels.
 * This bot helps maintain "honeypot" channels to catch and ban spammers automatically.
 *
 * LEAST PRIVILEGE MODE:
 * - No Privileged Intents required (Message Content, Members, Presences).
 * - Minimal permissions: View Channels, Send Messages, Pin Messages, Ban Members.
 * - No Read Message History permission required for ongoing monitoring.
 */

// Load environment variables from .env file to configure the bot.
require('dotenv').config();

// Import necessary classes and constants from the discord.js library.
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Events } = require('discord.js');

// Import the persistence layer to manage and track ban counts and notice IDs across sessions.
const persistence = require('./persistence');

// Retrieve the bot token from environment variables.
const TOKEN = process.env.DISCORD_TOKEN;

// Parse the MONITORED_CHANNELS environment variable.
// It expects a comma-separated list of channel IDs.
const MONITORED_CHANNELS = (process.env.MONITORED_CHANNELS || '')
  .split(',') // Split by comma.
  .map(id => id.trim()) // Remove any surrounding whitespace.
  .filter(id => id); // Remove any empty strings.

// Retrieve the log channel ID where ban events will be reported.
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;

// Retrieve the ban reason to be used in the audit log.
const BAN_REASON = process.env.BAN_REASON || 'Posted in honeypot channel.';

// Retrieve the duration of message history to delete upon ban (in hours).
// Default is 24 hours (1 day). Maximum Discord allowed is 168 hours (7 days).
const BAN_DELETE_MESSAGE_HOURS = parseInt(process.env.BAN_DELETE_MESSAGE_HOURS || '24', 10);
// Convert hours to seconds for the Discord API (max 7 days).
const DELETE_MESSAGE_SECONDS = Math.min(BAN_DELETE_MESSAGE_HOURS * 3600, 604800);

// Retrieve settings for the notice embed displayed in honeypot channels.
const NOTICE_TITLE = process.env.NOTICE_TITLE || '⚠️ WARNING: DO NOT POST HERE ⚠️';
const NOTICE_BODY = process.env.NOTICE_BODY || 'This channel is for monitoring only. Any posts here will result in an immediate and permanent ban.';

// Initialize the Discord client with minimal required standard gateway intents.
// Guilds: Required to access guild and channel information.
// GuildMessages: Required to receive message creation events in guilds.
// Note: MessageContent intent is NOT required as we do not read the text of messages.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

/**
 * Creates or updates a pinned notice embed in a specific channel.
 * Uses persistent storage to track notice message IDs to avoid requiring ReadMessageHistory.
 * @param {TextChannel} channel - The Discord channel where the notice should be managed.
 */
async function updateNotice(channel) {
  // Fetch the current ban count for this specific channel from persistence.
  const count = persistence.getCount(channel.id);

  // Construct a new EmbedBuilder instance for the warning message.
  const embed = new EmbedBuilder()
    .setColor(0xFF0000) // Red warning color.
    .setTitle(NOTICE_TITLE)
    .setDescription(NOTICE_BODY)
    .addFields({ name: 'Total Caught', value: count.toString() })
    .setTimestamp();

  try {
    // Attempt to retrieve the persisted message ID for this channel's notice.
    let noticeMessageId = persistence.getNoticeId(channel.id);
    let noticeMessage = null;

    // If we have a persisted ID, try to fetch the actual message from Discord.
    if (noticeMessageId) {
      try {
        // Fetch the message by ID from the channel.
        noticeMessage = await channel.messages.fetch(noticeMessageId);
      } catch (e) {
        // If fetching fails (e.g., message was deleted), clear the reference.
        noticeMessage = null;
      }
    }

    // If we found an existing notice message, edit it with the updated embed.
    if (noticeMessage) {
      // Update the existing notice.
      await noticeMessage.edit({ embeds: [embed] });
    } else {
      // If no notice exists (or it was deleted), send a new one to the channel.
      const newMessage = await channel.send({ embeds: [embed] });

      // Store the new message ID in our persistent storage.
      persistence.setNoticeId(channel.id, newMessage.id);

      // Check if the bot has permission to pin messages in the channel.
      // We use the granular PinMessages permission if available, or fall back to ManageMessages.
      const canPin = channel.guild.members.me.permissionsIn(channel).has(PermissionsBitField.Flags.PinMessages || PermissionsBitField.Flags.ManageMessages);

      if (canPin) {
        try {
          // Attempt to pin the newly sent message to the top of the channel.
          await newMessage.pin();
        } catch (pinError) {
          // Log if pinning fails despite having permission.
          console.error(`Failed to pin message in ${channel.id}:`, pinError);
        }
      } else {
        // Warn if the notice couldn't be pinned due to missing permissions.
        console.warn(`Missing PinMessages permission in channel ${channel.id}. Notice was sent but not pinned.`);
      }
    }
  } catch (error) {
    // Log any errors encountered during the notice update process.
    console.error(`Failed to update notice in channel ${channel.id}:`, error);
  }
}

// Event listener: Client is ready.
client.once(Events.ClientReady, async () => {
  // Log successful login.
  console.log(`Logged in as ${client.user.tag}!`);
  // Log monitored channels.
  console.log(`Monitoring channels: ${MONITORED_CHANNELS.join(', ')}`);
  // Log ban settings.
  console.log(`Ban deletion window set to ${BAN_DELETE_MESSAGE_HOURS} hours.`);

  // Initialize or update notices for each monitored channel.
  for (const channelId of MONITORED_CHANNELS) {
    try {
      // Fetch the channel object.
      const channel = await client.channels.fetch(channelId);
      // Ensure the channel is text-based.
      if (channel && channel.isTextBased()) {
        // Create or update the notice.
        await updateNotice(channel);
      } else {
        // Log if the channel is invalid.
        console.warn(`Channel ${channelId} is not a valid text channel.`);
      }
    } catch (error) {
      // Log failure to access a specific channel.
      console.error(`Could not fetch channel ${channelId}:`, error);
    }
  }
});

// Event listener: New message created in a guild.
client.on(Events.MessageCreate, async (message) => {
  // CRITICAL SAFETY: Stop processing if the message was sent by the bot itself.
  if (message.author.id === client.user.id) return;

  // Check if the message was posted in one of the monitored "honeypot" channels.
  if (MONITORED_CHANNELS.includes(message.channel.id)) {
    // Verify that the bot has the "Ban Members" permission in the current guild.
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      // Log an error if the bot lacks the necessary permissions.
      console.error(`Missing BanMembers permission in guild ${message.guild.name}`);
      return;
    }

    try {
      // Increment the persistent ban counter for this specific channel.
      persistence.incrementCount(message.channel.id);

      // Log the ban action to the console.
      console.log(`Banning ${message.author.tag} (${message.author.id}) for posting in ${message.channel.name}.`);

      // Execute the ban on the user.
      await message.guild.members.ban(message.author, {
        reason: BAN_REASON,
        deleteMessageSeconds: DELETE_MESSAGE_SECONDS
      });

      // Update the pinned notice embed to reflect the new count.
      await updateNotice(message.channel);

      // If a log channel ID is configured, send a detailed report there.
      if (LOG_CHANNEL_ID) {
        try {
          // Fetch the log channel.
          const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
          // Ensure it is a text channel.
          if (logChannel && logChannel.isTextBased()) {
            // Build the log embed.
            const logEmbed = new EmbedBuilder()
              .setColor(0x000000) // Administrative black color.
              .setTitle('Member Banned')
              .addFields(
                { name: 'User', value: `${message.author.tag} (${message.author.id})` },
                { name: 'Channel', value: `<#${message.channel.id}>` }
                // Note: content preview is omitted as MessageContent intent is disabled for privacy.
              )
              .setTimestamp();
            // Send the log.
            await logChannel.send({ embeds: [logEmbed] });
          }
        } catch (logError) {
          // Log failure to report the ban.
          console.error('Failed to send log to log channel:', logError);
        }
      }
    } catch (error) {
      // Log any errors that occur during the banning process.
      console.error(`Failed to ban ${message.author.tag}:`, error);
    }
  }
});

// Authenticate and log the client into Discord.
client.login(TOKEN);
