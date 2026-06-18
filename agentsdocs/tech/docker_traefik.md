# Docker and Traefik

This document outlines the standards for containerization and reverse proxy configuration using Docker and Traefik.

## Traefik Configuration

*   **Version:** Use Traefik v3+ as the edge router.
*   **Dial-in/Dial-out Rule:**
    *   **Dial-in:** Only apply Traefik labels if the service needs to be accessed externally.
    *   **Dial-out:** If the service only performs outbound actions (e.g., a background worker), do NOT include Traefik labels.
*   **Domains:** Use the `.local.lan` domain suffix for all local services (e.g., `app.local.lan`).
*   **Entrypoints:** Typically use `web` for HTTP (redirected to `websecure`) and `websecure` for HTTPS with TLS enabled.

## Docker Compose Standards

*   **Templates:** Refer to `templates/docker-compose.yml` for the standard service structure.
*   **Environment Variables:** Provide a `.env.example` file. Ensure sensitive data is never committed.
*   **Networking:** Use internal networks for service-to-service communication, exposing only the Traefik router to the external network if required.
*   **Exclusions:** The root `.gitignore` must exclude `docker-compose.yml` and `.env`.

## Example Traefik Labels

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.myservice.rule=Host(`myservice.local.lan`)"
  - "traefik.http.routers.myservice.entrypoints=websecure"
  - "traefik.http.routers.myservice.tls=true"
```
