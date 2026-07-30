# Deployment containers

Docker remains optional for development: `pnpm dev` uses local processes and SQLite without
containers. Phase 13 adds reproducible images for deployment:

- `api.Dockerfile`: FastAPI as an unprivileged user and volume `/data`;
- `admin.Dockerfile`: Vite build and Nginx for the admin SPA;
- `reader.Dockerfile`: Reader/PWA build and Nginx;
- `compose.yaml`: prior Alembic migration, health, minimal capabilities, and SQLite volume.

Base images are pinned to explicit versions. CI builds the three images without
publishing them; a SemVer tag publishes to GHCR when the repository has a remote on GitHub.

Optional local usage:

```powershell
pnpm deploy:local
pnpm deploy:smoke
```

Requires Docker Desktop or Docker Engine. It does not change the normal development workflow.
