# Rust Development

This document defines the standards for Rust projects in this repository.

## Environment

*   **Toolchain:** Use **rustup** for toolchain management.
*   **Target:** Windows 11 (MSVC build tools are required).
*   **IDE:** VS Code with the `rust-analyzer` extension is the preferred development environment.

## Dependency Management

*   **Pinning:** ALWAYS pin dependencies to exact versions in `Cargo.toml`.
*   **Security:** Run `cargo audit` periodically to check for vulnerabilities in dependencies.
*   **Wait Period:** Adhere to the 4-7 day wait period for new crate versions.

## Coding Standards

*   **Commenting:** Rust code must be commented extensively (every 1-2 lines). Explain complex logic, ownership transitions, and safety considerations (especially if `unsafe` is used).
