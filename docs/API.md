# API

This is the canonical entry point to the FollowRead API.

## Local development

- Base URL: `http://localhost:8000`
- Readiness: `GET /ready`
- Health: `GET /health`
- Interactive OpenAPI: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

The API uses FastAPI, SQLAlchemy, Alembic, and SQLite in the MVP. The example public configuration
is in `apps/api/.env.example`.

## Main contracts

- authentication and administrative sessions;
- public catalog and reading bundles;
- editorial administration protected by permissions;
- idempotent progress synchronization;
- health, readiness, metrics, and request IDs.

## Detailed sources

- [API Guide](api/README.md)
- [Error format](api/ERRORS.md)
- [Data model](architecture/DATA_MODEL.md)
- [Security](SECURITY.md)
- [Environment variables](development/ENVIRONMENT_VARIABLES.md)
- [Pre-deployment tests](testing/PRE_DEPLOYMENT_TESTS.md)

The executable contract is OpenAPI. Any breaking change requires contract testing,
documentation update, and an explicit versioning decision.


## Persistent audio processing and VPS paths

`pnpm dev` now starts the audio worker with the other local services. After updating an
existing installation, run `pnpm migrate` and restart `pnpm dev`. Admin remains on 5173,
Reader on 5174 and the API on 8000. Audio requests return a queued job immediately;
Admin polls its progress while the worker processes it. A restarted worker preserves queued
jobs and marks interrupted running jobs as failed; review provider charges before retrying.

The planned public Reader is at `/`, Admin at `/admin/` and the API at `/api/` on
`followread.innovalogic.tech`. API interactive documentation is disabled in production;
product documentation remains at `/admin/docs/`. The VPS runbook is available in the
documentation portal under Delivery → FollowRead VPS. Publication requires owner approval.
