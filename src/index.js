/**
 * HoneyBot - A Discord bot that bans anyone who posts in specific channels.
 * This bot helps maintain "honeypot" channels to catch and ban spammers automatically.
 */

// Load environment variables from .env file to configure the bot.
require('dotenv').config();

// Import necessary classes and constants from the discord.js library.
// Client: The main hub for interacting with the Discord API.
// GatewayIntentBits: Used to specify which events the bot should receive.
// EmbedBuilder: Helper to create rich embed messages.
// PermissionsBitField: Used to check for specific member permissions.
// Events: Contains a list of all available Discord events.
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Events } = require('discord.js');

// Import the persistence layer to manage and track ban counts across sessions.
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

// Retrieve settings for the notice embed displayed in honeypot channels.
const NOTICE_TITLE = process.env.NOTICE_TITLE || '⚠️ WARNING: DO NOT POST HERE ⚠️';
const NOTICE_BODY = process.env.NOTICE_BODY || 'This channel is for monitoring only. Any posts here will result in an immediate and permanent ban.';

// Initialize the Discord client with the required gateway intents.
// Guilds: Required to access guild and channel information.
// GuildMessages: Required to receive message creation events in guilds.
// MessageContent: Required to read the content of messages for verification.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// A local cache (Map) to store the message ID of the notice embed for each channel.
// This helps the bot avoid searching for the message every time it needs an update.
const noticeMessages = new Map();

/**
 * Creates or updates a pinned notice embed in a specific channel.
 * The notice displays a warning and the total number of users "caught" (banned).
 * @param {TextChannel} channel - The Discord channel where the notice should be managed.
 */
async function updateNotice(channel) {
  // Fetch the current ban count for this specific channel from persistence.
  const count = persistence.getCount(channel.id);

  // Construct a new EmbedBuilder instance for the warning message.
  const embed = new EmbedBuilder()
    // Set the embed color to red (hex 0xFF0000) to signify a warning.
    .setColor(0xFF0000)
    // Set the title of the embed from the configuration.
    .setTitle(NOTICE_TITLE)
    // Set the main description body from the configuration.
    .setDescription(NOTICE_BODY)
    // Add a field showing the cumulative number of bans in this channel.
    .addFields({ name: 'Total Caught', value: count.toString() })
    // Add a timestamp to show when the notice was last updated.
    .setTimestamp();

  try {
    // Attempt to retrieve a cached message ID for this channel's notice.
    let noticeMessageId = noticeMessages.get(channel.id);
    // Variable to hold the message object if found.
    let noticeMessage = null;

    // If we have a cached ID, try to fetch the actual message from Discord.
    if (noticeMessageId) {
      try {
        // Fetch the message by ID from the channel.
        noticeMessage = await channel.messages.fetch(noticeMessageId);
      } catch (e) {
        // If fetching fails (e.g., message was deleted), clear the reference.
        noticeMessage = null;
      }
    }

    // If no cached message was found or it was deleted, search the pinned messages.
    if (!noticeMessage) {
      // Fetch all pinned messages in the current channel.
      const pinnedMessages = await channel.messages.fetchPinned();
      // Look for a pinned message authored by the bot itself.
      noticeMessage = pinnedMessages.find(m => m.author.id === client.user.id);
    }

    // If we found an existing notice message, edit it with the updated embed.
    if (noticeMessage) {
      // Update the content of the message.
      await noticeMessage.edit({ embeds: [embed] });
      // Update our cache with the current message ID.
      noticeMessages.set(channel.id, noticeMessage.id);
    } else {
      // If no notice exists, send a new one to the channel.
      const newMessage = await channel.send({ embeds: [embed] });
      // Pin the newly sent message to the top of the channel.
      await newMessage.pin();
      // Store the new message ID in our cache.
      noticeMessages.set(channel.id, newMessage.id);
    }
  } catch (error) {
    // Log any errors encountered during the notice update process.
    // This could happen due to missing "Send Messages" or "Manage Messages" permissions.
    console.error(`Failed to update notice in channel ${channel.id}:`, error);
  }
}

// Event listener that triggers once when the client successfully connects to Discord.
// We use Events.ClientReady instead of the deprecated 'ready' string.
client.once(Events.ClientReady, async () => {
  // Log the bot's username and discriminator to the console.
  console.log(`Logged in as ${client.user.tag}!`);
  // Log the list of channel IDs currently being monitored.
  console.log(`Monitoring channels: ${MONITORED_CHANNELS.join(', ')}`);

  // Loop through each configured monitored channel ID to initialize notices.
  for (const channelId of MONITORED_CHANNELS) {
    try {
      // Fetch the full channel object from the Discord API.
      const channel = await client.channels.fetch(channelId);
      // Check if the channel exists and is a text-based channel.
      if (channel && channel.isTextBased()) {
        // Initialize or update the warning notice in the channel.
        await updateNotice(channel);
      } else {
        // Warn if the ID points to an invalid or non-text channel.
        console.warn(`Channel ${channelId} is not a valid text channel.`);
      }
    } catch (error) {
      // Log errors if the bot cannot access a specific channel.
      console.error(`Could not fetch channel ${channelId}:`, error);
    }
  }
});

// Event listener that triggers whenever a new message is created in a guild.
client.on(Events.MessageCreate, async (message) => {
  // Stop processing if the message was sent by the bot itself.
  if (message.author.id === client.user.id) return;

  // Check if the message was posted in one of the monitored "honeypot" channels.
  if (MONITORED_CHANNELS.includes(message.channel.id)) {
    // Verify that the bot has the "Ban Members" permission in the current guild.
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      // Log an error if the bot lacks the necessary permissions to take action.
      console.error(`Missing BanMembers permission in guild ${message.guild.name}`);
      return;
    }

    try {
      // Increment the persistent ban counter for this specific channel.
      persistence.incrementCount(message.channel.id);

      // Construct a log message for the console.
      const logMessage = `Banning ${message.author.tag} (${message.author.id}) for posting in ${message.channel.name}.`;
      // Output the ban action to the console.
      console.log(logMessage);

      // Execute the ban on the user who posted in the honeypot.
      // deleteMessageSeconds: 604800 (7 days) will remove all messages from this user in the last week.
      await message.guild.members.ban(message.author, {
        reason: BAN_REASON,
        deleteMessageSeconds: 604800
      });

      // Update the pinned notice embed to reflect the incremented "Caught" count.
      await updateNotice(message.channel);

      // If a log channel ID is configured, send a detailed report there.
      if (LOG_CHANNEL_ID) {
        try {
          // Fetch the log channel object.
          const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
          // Check if the log channel is valid and text-based.
          if (logChannel && logChannel.isTextBased()) {
            // Build a log embed for the administrative staff.
            const logEmbed = new EmbedBuilder()
              // Use black color (0x000000) for log entries.
              .setColor(0x000000)
              // Set the title of the log message.
              .setTitle('Member Banned')
              // Add details about the banned user, the channel, and message content.
              .addFields(
                { name: 'User', value: `${message.author.tag} (${message.author.id})` },
                { name: 'Channel', value: `<#${message.channel.id}>` },
                { name: 'Content Preview', value: message.content.substring(0, 1024) || '*No content*' }
              )
              // Add a timestamp to the log entry.
              .setTimestamp();
            // Send the embed to the designated log channel.
            await logChannel.send({ embeds: [logEmbed] });
          }
        } catch (logError) {
          // Log any errors that occur while trying to send the log message.
          console.error('Failed to send log to log channel:', logError);
        }
      }
    } catch (error) {
      // Log any errors that occur during the banning process.
      // This could happen if the user is an owner or has higher permissions than the bot.
      console.error(`Failed to ban ${message.author.tag}:`, error);
    }
  }
});

// Authenticate and log the client into Discord using the provided token.
client.login(TOKEN);
