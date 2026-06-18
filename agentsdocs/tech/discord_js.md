# Discord.js Best Practices

This document outlines the standards for Discord bot development using `discord.js` v14+.

## Event Handling

*   **Rule:** ALWAYS use the `Events` enum for event listeners instead of string literals.
*   **Correct:** `client.once(Events.ClientReady, ...)`
*   **Incorrect:** `client.once('ready', ...)`
*   **Reasoning:** This is the modern standard for v14+, providing better type safety and preventing issues with deprecated event names.

## Defensive API Operations

*   **Rule:** Every Discord API call (e.g., `.fetch()`, `.send()`, `.pin()`, `.ban()`) MUST be wrapped in a `try-catch` block.
*   **Reasoning:** The Discord API can fail for numerous reasons: rate limits, deleted channels, missing permissions, or network instability. Handling these prevents the bot from crashing.

## Permission Management

*   **Rule:** Before performing any administrative action (ban, kick, manage messages), explicitly check that the bot has the necessary permissions.
*   **Example:**
    ```javascript
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        console.error('Missing BanMembers permission');
        return;
    }
    ```
*   **Reasoning:** Provides clearer error logging and prevents unnecessary API requests that would result in a 403 Forbidden error.

## Persistent Storage (Local JSON)

*   **Rule:** Ensure the storage directory exists before writing.
*   **Rule:** Always wrap `JSON.parse()` in a `try-catch` when reading from a file.
*   **Reasoning:** Local files can become corrupt or may not have been initialized. Safe parsing ensures the bot can start even with problematic data.

## Configuration Sanitization

*   **Rule:** Sanitize environment variables, especially lists.
*   **Example:**
    ```javascript
    const CHANNELS = (process.env.CHANNELS || '').split(',').map(id => id.trim()).filter(id => id);
    ```
*   **Reasoning:** Users often add spaces or trailing commas in `.env` files. Sanitization prevents the bot from trying to operate on invalid IDs.
