# Development Roadmap and Guide

This document tracks the progress of the project and provides instructions for developers. For AI agents, see the unified instructions in [AGENTS.md](AGENTS.md).

## 1. Roadmap & Progress Tracker

### Milestone 1: Foundation
- [x] Project initialization
- [x] Basic project structure
- [x] Configuration management (.env, docker-compose)

### Milestone 2: Core Functionality
- [x] Implementation of persistence layer
- [x] Implementation of HoneyBot core logic (bans, notices, counters)
- [x] Support for multiple monitored channels

### Milestone 3: Testing & Polish
- [x] Dockerization
- [x] Documentation (README, design updates)

## 2. Docker Instructions

### 2.1 Local Setup
1. Copy `docker-compose.example.yml` to `docker-compose.yml`.
2. Copy `.env.example` to `.env` and fill in the required values.
3. Run `docker compose up -d` to start the services.

> **Note**: The Traefik and `.local.lan` configuration is specific to the primary developer's (Jules) homelab environment. For public or generic deployments, standard port mapping or a different reverse proxy may be used.

### 2.2 Traefik & Dial-in/Dial-out Rule
Refer to [Docker & Traefik](agentsdocs/tech/docker_traefik.md) for detailed rules on dial-in/out services and domain conventions.

## 3. Rust Getting Started

If you are new to Rust or this project is using Rust:

1.  **Install Toolchain**: See [Rust Development](agentsdocs/tech/rust.md) for toolchain and environment setup.
2.  **IDE Setup**: Use VS Code with the **rust-analyzer** extension.
3.  **Project Initialization**: Use `cargo init` to start a new project or `cargo build` to compile an existing one.
4.  **Dependencies**: Add dependencies to `Cargo.toml` using exact versions.

## 4. Dependency Management & Security

To maintain a secure and stable supply chain, all developers must follow the rules in [Safety & Security](agentsdocs/policies/safety.md), including pinning, wait periods, and auditing.

## 5. Session Start Checklist (AI Agents)
AI Agents MUST follow the mandatory session start procedures defined in [AGENTS.md](AGENTS.md).

## 6. Development Logs
*Record significant events, blockers, or changes in direction here.*
