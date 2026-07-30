# Initial Deployment Strategy

**Status:** Local/CI deployment implemented in Phase 13; external validation pending.
Artifacts are provider-agnostic. Domains, hosting and credentials will be decided with
the owner before staging/production.

## Mandatory pre-gate

Before deploying to shared development, staging, or production, complete
`docs/testing/PRE_DEPLOYMENT_TESTS.md`. All thirteen categories must be in `PASS` or `WAIVED`
approved for the same commit and artifacts. The local gate `pnpm check` does not substitute that record.

## Environments

| Environment | Purpose | Data/services |
|---|---|---|
| local | Individual development | Containers and fake adapters |
| development | Team continuous integration | Low-cost isolated resources |
| staging | Production-like validation | Synthetic data, migrations and rollback |
| production | Real users | Controls, backups and monitoring |

## Deployable units

- Admin web static or served, separate from Reader;
- Reader web/PWA;
- FastAPI API;
- processing worker when added;
- persistent MVP SQLite file;
- object storage;
- Reader mobile apps from Phase 10 onward.

## Principles

- configuration by environment;
- secrets in an appropriate store, never in artifacts;
- versioned, immutable artifacts;
- migrations reviewed and executed in a controlled manner;
- API deployment compatible with reasonable prior clients;
- content versioned independently of the build;
- application rollback does not delete data or content.

## Implemented delivery flow

1. lint, type-check and tests;
2. reproducible build;
3. security analysis;
4. publish web builds and OCI images with SemVer tag;
5. deploy to development;
6. migration and testing in staging;
7. approval;
8. deploy production;
9. smoke tests and monitoring;
10. rollback if indicators fail.

## Mobile

Reader web is the only source that Capacitor packages. Permissions, plugins, icons and native
configurations are versioned per platform. New content does not require publishing another app.

Phase 10 left Android/iOS under `apps/reader`, reproducible resources, Android debug build and signing/publishing guides in `MOBILE_RELEASES.md`. Final iOS execution is performed on macOS/Xcode before
TestFlight; store signing, accounts and credentials remain out of the repository.

## Available automation

- `pnpm deploy:validate`: static definition, images, Compose, CI and release.
- `pnpm deploy:local`: optional build/migration/startup via Docker Compose.
- `pnpm deploy:smoke`: API health and Admin/Reader shell.
- `pnpm deploy:backup` and `deploy:restore`: SQLite with integrity and checksum.
- CI builds all images; SemVer tags publish to GHCR and create GitHub Release.

## External pending items

- provider and regions;
- high availability, RTO and RPO;
- domain, TLS and CDN;
- actual backup/restore execution on the chosen host;
- S3 lifecycle;
- zero-downtime migration strategy;
- store signing and accounts;
- connecting metrics/alerts to the chosen provider;
- validation `docker build/compose` on a machine with Docker;
- remote GitHub and first run of workflows.

## Migrations

- Every migration is versioned and reviewed.
- First tested with a copy/synthetic data in staging.
- Destructive changes use expand/contract: add, migrate, verify and remove after.
- The application must tolerate both previous/new version during deployment where applicable.
- Backup and restore are tested before a high-risk migration.

## Rollback

1. Stop promotion and incompatible changes.
2. Revert artifact to a known version.
3. Do not destructively revert schema without a tested plan.
4. Restore data only with evidence of corruption and authorization.
5. Run smoke tests for Admin, Reader, API and catalog.
6. Record incident, impact and decision.

## Environment validation

- `local`: fake adapters and synthetic data: PASS.
- `development`: configuration and gates defined; external execution pending.
- `staging`: configuration, migration, rollback and approval defined; execution pending.
- `production`: secrets, backups, observability and approval defined; execution pending.
- Content deployment independent of build: PASS.
