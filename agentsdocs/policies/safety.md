# Safety and Security

This document outlines the mandatory security practices and safety protocols for this repository.

## Supply Chain Security

### Dependency Management
*   **Pinning:** ALWAYS pin dependencies to exact versions (e.g., `1.2.3` instead of `^1.2.3`). This applies to `package.json`, `requirements.txt`, and `Cargo.toml`.
*   **Wait Period:** Do NOT use any new package or a new version of an existing package until it is at least **4-7 days old**.
*   **Verification:** Check the web or the registry to ensure the package has a clean audit and no reported security issues if it is older than a week.
*   **Lock Files:** Never delete lock files unless absolutely necessary to resolve a "nuclear" issue. Prefer `--legacy-peer-deps` or specific version fixes first.

### Auditing and Vulnerability Resolution
*   **Frequency:** Run `npm audit` (or equivalent for other languages) early and often.
*   **Mandatory Fixes:** You MUST resolve all reported vulnerabilities before submitting changes.
*   **Resolution Method:** Use `npm audit fix --force` or manual intervention until the audit is clean.
*   **Verification:** After fixing vulnerabilities, ensure that the application still functions correctly and fix any regressions introduced by updates.

## AI Safety: The Prompt Firewall

For agents with a public attack surface (e.g., reading external data like emails or calendar invites), a Prompt Firewall must be implemented to prevent **Indirect Prompt Injection**.

### The Guardian Prompt
*   **Mechanism:** Pass input through a specialized "Guardian" prompt that can only return `SAFE` or `UNSAFE`.
*   **Constraint:** The Guardian is restricted from using tools or emitting complex reasoning.
*   **Threat Focus:** Prevents instructions embedded in external data from being parsed as valid tasks.

### Recursive Isolation (Divide and Conquer)
If a large input is flagged as `UNSAFE`:
1.  **Split:** Break the input into smaller chunks.
2.  **Re-scan:** Run each chunk through the Firewall.
3.  **Isolate:** Identify the specific "problem chunk".
4.  **User Alert:** Present the specific chunk to the user for manual verification.
