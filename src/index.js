/**
 * HoneyBot - A Discord bot that bans anyone who posts in specific channels.
 */

// Load environment variables from .env file.
require('dotenv').config();

// Import necessary classes from discord.js.
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');
// Import persistence layer for tracking counts.
const persistence = require('./persistence');

// Retrieve configuration from environment variables.
const TOKEN = process.env.DISCORD_TOKEN;
// Parse comma-separated list of monitored channel IDs.
const MONITORED_CHANNELS = (process.env.MONITORED_CHANNELS || '').split(',').map(id => id.trim()).filter(id => id);
// Get log channel ID.
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID;
// Get ban reason.
const BAN_REASON = process.env.BAN_REASON || null;
// Get notice embed settings.
const NOTICE_TITLE = process.env.NOTICE_TITLE || '⚠️ WARNING: DO NOT POST HERE ⚠️';
const NOTICE_BODY = process.env.NOTICE_BODY || 'This channel is for monitoring only. Any posts here will result in an immediate and permanent ban.';

// Initialize the Discord client with required intents.
// Guilds: To access channel information.
// GuildMessages: To receive message events.
// MessageContent: To read the content of messages (required to trigger the event).
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Map to store the notice message ID for each channel to avoid reposting if one already exists.
const noticeMessages = new Map();

/**
 * Creates or updates the pinned notice embed in a channel.
 * @param {TextChannel} channel - The Discord channel to update.
 */
async function updateNotice(channel) {
  // Get the current ban count for this channel.
  const count = persistence.getCount(channel.id);

  // Create the embed.
  const embed = new EmbedBuilder()
    // Set embed color to red for warning.
    .setColor(0xFF0000)
    // Set title from config.
    .setTitle(NOTICE_TITLE)
    // Set description from config.
    .setDescription(NOTICE_BODY)
    // Add the "Caught" count field.
    .addFields({ name: 'Total Caught', value: count.toString() })
    // Add a timestamp.
    .setTimestamp();

  try {
    // Check if we already have a notice message ID for this channel in our cache.
    let noticeMessageId = noticeMessages.get(channel.id);
    let noticeMessage = null;

    if (noticeMessageId) {
      try {
        // Try to fetch the cached message.
        noticeMessage = await channel.messages.fetch(noticeMessageId);
      } catch (e) {
        // If message was deleted, we'll search for a new one.
        noticeMessage = null;
      }
    }

    if (!noticeMessage) {
      // Search for existing pinned messages by the bot.
      const pinnedMessages = await channel.messages.fetchPinned();
      // Find the first pinned message from the bot.
      noticeMessage = pinnedMessages.find(m => m.author.id === client.user.id);
    }

    if (noticeMessage) {
      // Update the existing pinned message.
      await noticeMessage.edit({ embeds: [embed] });
      // Store reference in cache.
      noticeMessages.set(channel.id, noticeMessage.id);
    } else {
      // Post a new notice message if none found.
      const newMessage = await channel.send({ embeds: [embed] });
      // Pin the new message.
      await newMessage.pin();
      // Store reference.
      noticeMessages.set(channel.id, newMessage.id);
    }
  } catch (error) {
    // Log errors (e.g., missing permissions).
    console.error(`Failed to update notice in channel ${channel.id}:`, error);
  }
}

// Event: Bot is ready.
client.once('ready', async () => {
  // Log successful login.
  console.log(`Logged in as ${client.user.tag}!`);
  // Log monitored channels.
  console.log(`Monitoring channels: ${MONITORED_CHANNELS.join(', ')}`);

  // Initialize notices for each monitored channel.
  for (const channelId of MONITORED_CHANNELS) {
    try {
      // Fetch the channel object.
      const channel = await client.channels.fetch(channelId);
      // Check if it's a text-based channel.
      if (channel && channel.isTextBased()) {
        // Create/Update the notice.
        await updateNotice(channel);
      } else {
        // Log if channel is invalid or not text-based.
        console.warn(`Channel ${channelId} is not a valid text channel.`);
      }
    } catch (error) {
      // Log if fetching channel fails.
      console.error(`Could not fetch channel ${channelId}:`, error);
    }
  }
});

// Event: Message created.
client.on('messageCreate', async (message) => {
  // Ignore messages from the bot itself to prevent loops.
  if (message.author.id === client.user.id) return;

  // Check if the message is in a monitored channel.
  if (MONITORED_CHANNELS.includes(message.channel.id)) {
    // Check if the bot has permission to ban members in the guild.
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      // Log missing permissions.
      console.error(`Missing BanMembers permission in guild ${message.guild.name}`);
      return;
    }

    try {
      // Increment the "Caught" count in persistence.
      persistence.incrementCount(message.channel.id);

      // Log the event details.
      const logMessage = `Banning ${message.author.tag} (${message.author.id}) for posting in ${message.channel.name}.`;
      console.log(logMessage);

      // Ban the user.
      // deleteMessageSeconds: 604800 is 7 days (maximum allowed by Discord API).
      // This removes the spam message along with the user.
      await message.guild.members.ban(message.author, {
        reason: BAN_REASON || 'Posted in honeypot channel.',
        deleteMessageSeconds: 604800
      });

      // Update the notice embed to reflect the new count.
      await updateNotice(message.channel);

      // Send a log entry to the designated log channel if configured.
      if (LOG_CHANNEL_ID) {
        try {
          // Fetch log channel.
          const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
          // Check if log channel is valid.
          if (logChannel && logChannel.isTextBased()) {
            // Create a log embed.
            const logEmbed = new EmbedBuilder()
              .setColor(0x000000)
              .setTitle('Member Banned')
              .addFields(
                { name: 'User', value: `${message.author.tag} (${message.author.id})` },
                { name: 'Channel', value: `<#${message.channel.id}>` },
                { name: 'Content Preview', value: message.content.substring(0, 1024) || '*No content*' }
              )
              .setTimestamp();
            // Send log.
            await logChannel.send({ embeds: [logEmbed] });
          }
        } catch (logError) {
          // Log failure to send log entry.
          console.error('Failed to send log to log channel:', logError);
        }
      }
    } catch (error) {
      // Log failures to ban.
      console.error(`Failed to ban ${message.author.tag}:`, error);
    }
  }
});

// Log in to Discord.
client.login(TOKEN);
