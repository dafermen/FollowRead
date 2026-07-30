# ADR-0001: SQLite for the MVP

**Status:** ACCEPTED  
**Date:** 2026-07-24  
**Canonical decision:** FR-DEC-013

## Context

The MVP must be able to be developed and demonstrated without running PostgreSQL or containers.

## Decision

SQLite is the authoritative database for the MVP via SQLAlchemy and Alembic. Queries should avoid unnecessary dependencies on SQLite to preserve a future migration path.

## Consequences

- local development with less infrastructure;
- integration tests against real SQLite;
- file backups with checksum and integrity;
- concurrency and future migration require specific validations;
- PostgreSQL cannot be introduced as an MVP requirement without a new decision.

See [DECISIONS.md](../project-management/DECISIONS.md).
