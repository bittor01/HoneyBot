# Coding Standards

This document defines the coding standards that must be followed for all projects in this repository.

## Verbose Commenting

*   **Rule:** You MUST comment every 1-2 lines of code.
*   **Purpose:** This is critical for maintainability and ensures that someone unfamiliar with the framework (like React, Vite, or Python) can easily understand the logic.
*   **Detail:** Explain what the code is doing and, where appropriate, why.
*   **Language Focus:** Pay extra attention to commenting **Python**, **React**, **Vite**, **TypeScript**, and **Rust** code extensively.

## Line Endings

*   **Management:** Line endings are managed strictly via `.gitattributes`.
*   **Docker/Linux:** Files intended to run inside Docker containers or on Linux (e.g., `.sh`, `.yml`, `.conf`, `.env`) MUST have **LF** line endings.
*   **Windows:** Windows-specific files (e.g., `.bat`, `.ps1`) can use **CRLF**.
*   **Consistency:** Always respect the settings in `.gitattributes`.
