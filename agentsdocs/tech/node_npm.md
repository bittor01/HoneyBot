# Node.js and NPM

This document outlines the specific standards and procedures for Node.js projects using NPM.

## Version Management

*   **NVM:** Use **NVM** for Node.js version control.
*   **Configuration:** A `.nvmrc` file must be present in the project root.

## Dependency Management

*   **Pinning:** ALWAYS pin dependencies to exact versions in `package.json`. Do NOT use ranges like `^` or `~`.
*   **Audit Policy:**
    *   Run `npm audit` at the start of every session.
    *   Resolve all reported vulnerabilities before proceeding with tasks.
    *   Use `npm audit fix --force` or manual intervention until the audit is clean.
*   **Lock Files:** Never delete `package-lock.json` unless absolutely necessary for a "nuclear" reset.

## Frameworks

*   React and Vite are frequently used for frontends. Ensure that Vite configurations are optimized for the target environment (e.g., development vs. production build).
