# Instructions for AI Agents

You MUST follow these rules when working in this repository. These rules take precedence over your standard operating procedures unless explicitly overridden by the user.

## Mandatory Session Start

*   **Audit Check:** At the start of every session, you MUST run the appropriate audit tool for the project (e.g., `npm audit` for Node projects, `cargo audit` for Rust).
*   **Resolution:** You MUST resolve all reported vulnerabilities before resuming or starting your assigned task. Use automated fix tools (like `npm audit fix --force`) or manual intervention until the audit is clean.

## Core Policies

All agents must adhere to the following core policies for every task:

*   [**Coding Standards**](agentsdocs/policies/coding_standards.md): Mandatory verbose commenting (every 1-2 lines) and strict line ending management.
*   [**Safety & Security**](agentsdocs/policies/safety.md): Strict dependency pinning, 4-7 day wait periods for new versions, and AI safety protocols (Prompt Firewall).
*   [**Environment Setup**](agentsdocs/policies/environment.md): Context on the primary Windows 11 development environment and version managers (NVM, PIM, Rustup).
*   [**Design Sensibilities**](agentsdocs/policies/design.md): General design principles and mandatory documentation standards (README, design.md, development.md).

## Technology-Specific Instructions

Identify the technologies used in the current project and follow the corresponding instructions:

*   [**Docker & Traefik**](agentsdocs/tech/docker_traefik.md): Rules for containerization, dial-in/out services, and `.local.lan` domain setup.
*   [**Electron**](agentsdocs/tech/electron.md): Standards for portable EXE builds and IPC synchronization.
*   [**Node.js & NPM**](agentsdocs/tech/node_npm.md): Specifics for NPM audit, `.nvmrc`, and React/Vite.
*   [**Discord.js**](agentsdocs/tech/discord_js.md): Standards for bot events, defensive API usage, and permission checks.
*   [**Python**](agentsdocs/tech/python_pip.md): PIM usage, requirements pinning, and extensive commenting requirements.
*   [**Rust**](agentsdocs/tech/rust.md): Cargo pinning, security audits, and extensive commenting requirements.
*   [**LLM Harnessing**](agentsdocs/tech/llm_harnessing.md): Standardized agentic architectures (Planner-Executor-Critic) and context management.

## Verification

Before submitting, verify that your changes do not break existing functionality. If you add or update a dependency, you must document its release date (verifying the 4-7 day wait period) and audit status in the commit message or PR description.
