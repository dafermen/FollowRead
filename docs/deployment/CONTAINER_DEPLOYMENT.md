# Container Deployment

## Scope

FollowRead can deploy API, Admin, and Reader as three separate images. Docker is an optional packaging method and is not required for development. SQLite remains the authoritative data source for the MVP and lives in the volume `followread-data`.

## Images

| Image | Base | Port | Persistence |
|---|---|---:|---|
| API | `python:3.12.13-slim-bookworm` | 8000 | `/data` |
| Admin | `nginx:1.28.3-alpine3.23` | 8080 | none |
| Reader | `nginx:1.28.3-alpine3.23` | 8080 | none |

Web builds use `node:24.18.0-bookworm-slim` and pnpm 11.9.0. Admin/Reader receive
`VITE_API_BASE_URL` at build time; therefore a change of endpoint requires rebuilding those two
artifacts, never injecting secrets.

## Local development with Docker

Docker Desktop/Engine is optional and is currently not installed on the project's Windows workstation.

```powershell
pnpm deploy:validate
pnpm deploy:local
pnpm deploy:smoke
```

`deploy:local` uses `infrastructure/deployment/local.example.env`, builds images, runs
Alembic before the API, and waits for health checks. Ports remain 8000, 5173, and 5174.

## Shared environments

1. Copy the example to a file outside Git.
2. Define HTTPS domains, exact origins, OCI namespace, and SemVer tag.
3. Create the persistent volume and a tested backup.
4. Run with approval:

```powershell
$env:FOLLOWREAD_DEPLOY_APPROVED = "YES"
node scripts/deploy-compose.mjs --environment staging --env-file C:\secure\followread-staging.env
pnpm deploy:smoke
```

Production also requires a TLS/CDN proxy, restricted access to `/metrics`, scheduled
backups, retention, alerts, and approval from the GitHub Environment. No specific provider is
assumed in the repository.

## Controls

- images pinned to explicit versions;
- unprivileged processes and `cap_drop: ALL`;
- read-only filesystem and ephemeral `/tmp`;
- migration completed before starting the API;
- health checks for all three services;
- cacheless HTML, assets with immutable cache;
- single data volume, outside the image;
- credentials absent from Dockerfiles, Compose, and examples.

## Current limitation

The definition passes static validation and CI is set up to build it. The real local test of
`docker build/compose` remains pending because Docker is not installed; external publishing
also requires remote GitHub, domains, and a provider chosen by the owner.
