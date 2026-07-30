# Architecture

This document is the canonical entry point to FollowRead's architecture. Details live in
`docs/architecture/` and are not duplicated here.

## Overview

FollowRead is a monorepo with three applications:

- `apps/admin-web`: editorial administration in React/Vite;
- `apps/reader`: React/Vite reader, PWA and Capacitor base for Android/iOS;
- `apps/api`: FastAPI API with SQLAlchemy, Alembic and SQLite for the MVP.

Contracts and reusable components live in `packages/`. Optional packaging and deployment
infrastructure is in `infrastructure/`.

## Governing principles

- Admin, Reader and API are deployed as separate artifacts.
- Reader Engine does not depend on React, the DOM, or infrastructure.
- SQLite is the authoritative store for the MVP.
- AWS and Amazon Polly may only appear behind API adapters; the local `fake` provider must
  continue to work without credentials.
- Docker is optional for development and required only when packaging is validated.
- No personal accounts or PII of minors are stored.

## Detailed sources

- [System context](architecture/SYSTEM_CONTEXT.md)
- [Initial architecture](architecture/INITIAL_ARCHITECTURE.md)
- [Data model](architecture/DATA_MODEL.md)
- [Reader Engine](architecture/READER_ENGINE.md)
- [Offline mode](architecture/OFFLINE_MODE.md)
- [Observability](architecture/OBSERVABILITY.md)
- [Threat model](architecture/THREAT_MODEL.md)
- [Decision log](project-management/DECISIONS.md)
- [ADR](adr/README.md)

## Change rule

A change to boundaries, persistence, security, providers or deployment requires updating the
corresponding detailed document and recording a decision or ADR before it is considered closed.
