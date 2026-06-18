# Design Sensibilities

This document outlines general design principles and documentation standards for projects in this repository.

## Documentation Standards

Maintaining clear documentation is a mandatory part of the development process.

*   **README.md:** The main entry point. High-level project overview and quick start.
*   **design.md:** The "Blueprint". Defines the tech stack, requirements, and functional design. Must be established *before* significant development begins.
*   **development.md:** The "Roadmap". Contains milestones, progress tracking, and developer-specific guides.
*   **Keep Updated:** You MUST keep these files up to date as the project evolves.

## General Design Principles

*   **Modularization:** Break down complex systems into smaller, manageable components.
*   **Explicit over Implicit:** Prefer explicit configurations and clear, verbose code over "magic" or clever, obscure logic.
*   **Fail Gracefully:** Implement robust error handling and provide informative feedback to the user or other system components.
*   **Security by Design:** Consider security implications (like prompt injection or dependency vulnerabilities) at every stage of the design.

## Agentic Architecture

For projects involving AI agents, follow the standardized patterns for LLM harnessing, including the Planner-Executor-Critic pattern and tiered context management. See [LLM Harnessing](../tech/llm_harnessing.md) for details.
