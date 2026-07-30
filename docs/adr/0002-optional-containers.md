# ADR-0002: Optional Containers and Neutral Artifacts

**Status:** ACCEPTED  
**Date:** 2026-07-26  
**Canonical decision:** FR-DEC-019

## Context

The project needs reproducible packaging without making Docker or a cloud provider requirements for local development.

## Decision

`pnpm dev` continues as the main route. Docker packages API, Admin and Reader for CI and deployment.
Artifacts do not select a provider and use external configuration.

## Consequences

- local development independent of Docker;
- three versioned and verifiable images;
- real Docker, GitHub and staging remain gates of Phase 13;
- choosing a provider or deploying to production requires explicit authorization.

See [DECISIONS.md](../project-management/DECISIONS.md).
