# Python Development

This document defines the standards for Python projects in this repository.

## Environment and Versioning

*   **PIM:** Use **PIM (Python Install Manager)** for Python version control on the host Windows environment.
*   **OS:** Primary development environment is Windows 11.

## Dependency Management

*   **Pinning:** ALWAYS pin dependencies to exact versions in `requirements.txt`.
*   **Wait Period:** Adhere to the 4-7 day wait period for new package versions.
*   **Commentary:** Python code must be commented extensively (every 1-2 lines), as the primary user is less familiar with it than other languages.

## Project Structure

*   Use standard Python project structures.
*   If using virtual environments manually, ensure they are excluded via `.gitignore`.
