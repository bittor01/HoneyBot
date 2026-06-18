# Project Structure and Documentation

This document explains the organization of this repository and the purpose of its documentation files. Maintaining a clear structure ensures that both humans and AI agents can effectively contribute to and maintain the project.

## Root Directory Organization

The root directory contains the primary entry points for understanding and working with the project.

| File / Directory | Purpose |
| :--- | :--- |
| `README.md` | The main entry point. High-level project overview, quick start, and links to other docs. |
| `design.md` | The "Blueprint". Defines the tech stack, requirements, and functional design. |
| `development.md` | The "Roadmap". Contains the implementation plan, progress tracking, and developer-specific guides. |
| `LICENSE_THIRDPARTY.md` | License audit. Information about licenses of prerequisites and their impact on this project. |
| `AGENTS.md` | AI Agent instructions. The primary entry point and menu for all agent rules and tech-specific docs. |
| `agentsdocs/` | Modularized documentation for policies and specific technologies. |
| `docker-compose.example.yml` | Template for local Docker orchestration (Traefik-free by default). |
| `.env.example` | Template for environment variables. |
| `.gitignore` | Standard Git ignore file. |
| `templates/` | Reusable configuration templates (e.g., Traefik, standard service configs). |
| `examples/` | Boilerplate implementations and reference code. |

## Documentation Hierarchy

### 1. Root Entry Points
- **`README.md`**: Human-centric overview.
- **`AGENTS.md`**: AI-centric entry point. Links to all modular instructions.

### 2. Modular Instructions (`agentsdocs/`)
Detailed instructions are split into modular files to keep the context focused:
- **`policies/`**: Core rules that apply to almost every project (Coding Standards, Safety/Security, Environment, Design).
- **`tech/`**: Specialized instructions for specific technologies (Docker, Electron, Node, Python, Rust, LLM Harnessing).

### 3. Project-Specific Docs
- **`design.md`**: Technical blueprint for the current project.
- **`development.md`**: Roadmap and progress tracker for the current project.

## Maintenance Standards

*   **Update on Change:** All documentation files MUST be kept synchronized with project changes.
*   **Audit Early:** AI agents must follow the session start procedures defined in `AGENTS.md`.
*   **License Audit:** Use `LICENSE_THIRDPARTY.md` to track dependencies before finalizing project licensing.
