# HoneyBot

HoneyBot is a specialized Discord bot designed to protect your server from spam and unauthorized posts by monitoring specific "honeypot" channels. Anyone who posts in these channels is immediately and permanently banned.

## Features

- **Automated Bans:** Instant permanent ban for any user who posts in a monitored channel.
- **Message Cleanup:** Automatically deletes a configurable duration of message history upon banning.
- **Pinned Warnings:** Maintains a pinned embed at the top of each monitored channel warning users not to post.
- **Ban Counters:** Keeps track of how many users have been caught in each specific channel.
- **Logging:** Sends ban notifications to a designated log channel.
- **Least Privilege:** Operates using only **Standard Intents**. Does not require the privileged "Message Content" intent or "Read Message History" permission.
- **Self-Protection:** Internal logic prevents the bot from ever banning itself.
- **Dockerized:** Easy deployment using Docker and Docker Compose.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+) or [Docker](https://www.docker.com/)
- A Discord Bot Token with the following permissions:
  - `View Channels` (Required only for the specific honeypot channels)
  - `Send Messages`
  - `Embed Links`
  - `Pin Messages` (to pin the warning message)
  - `Ban Members` (to perform the bans)
- **Intents Required (Standard):**
  - `Guilds`
  - `GuildMessages` (Allows detecting *that* a message was sent; does not require content access)

## Setup Instructions

### 1. Discord Developer Portal
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application and add a bot.
3. Under the **Bot** tab, you can keep all "Privileged Gateway Intents" **DISABLED**.
4. Copy your bot token.

### 2. Configuration
1. Clone this repository.
2. Copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```
3. Fill in your `.env` file:
   - `DISCORD_TOKEN`: Your bot token.
   - `MONITORED_CHANNELS`: Comma-separated list of Channel IDs to watch.
   - `LOG_CHANNEL_ID`: Channel ID where ban logs should be sent.
   - `BAN_REASON`: (Optional) The reason recorded in the audit log.
   - `BAN_DELETE_MESSAGE_HOURS`: Number of hours of message history to delete on ban (default 24).
   - `NOTICE_TITLE` / `NOTICE_BODY`: Customize the warning message.

### 3. Deployment

#### Using Docker (Recommended)
1. Ensure Docker and Docker Compose are installed.
2. Run the bot:
   ```bash
   docker-compose up -d
   ```

#### Using Node.js
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the bot:
   ```bash
   npm start
   ```

## 🛡️ Critical Safety Setup (Read Carefully!)
**This bot is extremely aggressive and will ban anyone who posts in a channel it can see.** To prevent accidental bans of your community members:

1.  **Invite the bot "Blind"**: When inviting the bot to your server, do **NOT** grant it the "Administrator" permission or global "View Channels" permissions.
2.  **Targeted Channel Access**:
    *   Go to the settings of your specific **honeypot/monitored channels**.
    *   Under **Permissions**, add the HoneyBot.
    *   Explicitly grant it the `View Channel`, `Send Messages`, `Embed Links`, and `Pin Messages` permissions **only in those specific channels**.
3.  **Role Hierarchy**: Ensure the HoneyBot's role is positioned correctly. It can only ban users whose highest role is *lower* than the bot's role. It will ignore its own messages to prevent self-banning.
