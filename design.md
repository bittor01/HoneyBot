# Design Document

This document serves as the blueprint for the project. It outlines the technical choices, requirements, and functional architecture.

## 1. Tech Stack

*List the primary technologies intended for this project.*

- **Language:** Node.js (JavaScript)
- **Library:** discord.js v14
- **Persistence:** JSON-based local file storage
- **Infrastructure:** Docker & Docker Compose

## 2. Requirements

### 2.1 Functional Requirements
- [x] Monitor multiple comma-separated channels.
- [x] Instant permanent ban for any user who posts in a monitored channel.
- [x] Maintain a pinned warning embed in each channel.
- [x] Track "Total Caught" count per channel in the pinned embed.
- [x] Log bans to a designated log channel.
- [x] Persistent counters across restarts.

### 2.2 Non-Functional Requirements
- **Performance**: ...
- **Security**: ...
- **Scalability**: ...

## 3. Functional Overview

*Describe how the application works and how components interact.*

### 3.1 Data Flow
1. User posts a message in a monitored channel.
2. `messageCreate` event triggers.
3. Bot increments the counter for that channel in `counts.json`.
4. Bot issues a permanent ban via Discord API with `deleteMessageSeconds` set to 7 days.
5. Bot updates the pinned notice embed with the new counter.
6. Bot sends a log entry to the `LOG_CHANNEL_ID`.

### 3.2 Component Architecture
- `src/index.js`: Main entry point, Discord event handlers, and notice management.
- `src/persistence.js`: Simple wrapper for FS operations to manage the `counts.json` file.
- `data/counts.json`: Persistent storage for ban counts.

## 4. Design Decisions
*Document why certain technologies or architectures were chosen over others.*
