# Environment Setup

This document describes the primary development environment and the tools used for version management.

## Base Environment

*   **Operating System:** Windows 11.
*   **Build Tools:** MSVC build tools (required for Rust and some Node.js native modules).
*   **IDE:** VS Code is preferred, especially with `rust-analyzer` for Rust development.

## Version Management

### Node.js
*   **Tool:** Use **NVM** (Node Version Manager) for Node.js version control.
*   **Configuration:** Include a `.nvmrc` file in the project root.

### Python
*   **Tool:** Use **PIM** (Python Install Manager) for Python version control on the host Windows environment.

### Rust
*   **Tool:** Use **rustup** for toolchain management.
*   **Target:** Development is typically done on Windows 11 using the MSVC toolchain.
