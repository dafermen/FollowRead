# Initial Architecture Validation

**Status:** PASS  
**Responsible task:** FR-PH00-TASK-009 - COMPLETED  
**Date:** 2026-07-24

## Responsibility matrix

| Component | Responsibility | Allowed dependencies | Prohibited dependencies |
|---|---|---|---|
| Admin web | Editorial flow and preview | API, shared UI/types | AWS SDK, DB, Mobile Reader |
| Reader | Catalog, reading, preferences, offline | API, Reader Engine, local storage | AWS SDK, DB, Admin |
| API routers | HTTP, authentication and error translation | Application services | Direct SQLAlchemy/AWS |
| API services | Use cases and transactions | Domain, ports | Frontend components |
| API domain | States and rules | Its own types | FastAPI, SQLAlchemy, AWS |
| API adapters | SQLite/SQLAlchemy, Polly, S3, queue | SDKs/infrastructure | UI |
| Reader Engine | Timing, segments, controls and logical progress | Pure types | React, DOM, Capacitor, network, AWS |
| Shared types/models | Stable contracts | No concrete app | Privileged logic |

## Infrastructure components

- **SQLite:** authoritative source for the MVP for content, identities, jobs, audit, and remote data; only the API opens the file.
- **Future PostgreSQL:** will replace the adapter when there is an operational need and a proven migration, without changing the domain or routers.
- **S3:** large immutable objects; never the single source of business relationships.
- **Polly:** provider behind `PollyService`; mocked during automation.
- **Local storage:** catalog, packages, preferences and pending operations.
- **Future Redis/Celery:** implements the job execution port; does not change routers or domain.

## Walkthroughs

### Publishing

Admin -> API router -> authorization -> service -> state machine -> job -> adapters
Polly/S3 -> validation -> review -> publication -> catalog.

**Result:** PASS. There is no direct Admin/AWS call nor state jump.

### Playback

Reader -> validated package -> audio adapter -> Reader Engine -> logical position -> UI adapter
DOM/hand -> local save/API.

**Result:** PASS. Reader Engine remains pure and the visual position stays in the Reader.

### Offline and update

Reader -> remote catalog -> temporary download -> checksum/compatibility -> atomic activation ->
local catalog -> pending operation -> idempotent API.

**Result:** PASS. A failure preserves the previous package and local progress.

### Processing recovery

Admin -> job detail -> API -> authorization/cost/idempotence -> runner -> adapters ->
audit/correlation ID.

**Result:** PASS. A retry does not depend on the HTTP controller nor silently duplicate.

## Verifiable architectural rules

1. `reader-engine` does not import React, DOM, Capacitor or network.
2. API routers do not import AWS SDK.
3. Frontends do not contain secret variables or AWS clients.
4. Admin is not part of the Capacitor build.
5. Published packages are immutable.
6. The queue is consumed via a replaceable interface.
7. Catalog/package contracts are versioned.
8. Offline writes use idempotent IDs.

These rules will become architectural/CI tests in Phase 2 or in the phase that creates the component.

## Covered decisions

- FR-DEC-001: separation of applications.
- FR-DEC-002: dual catalog.
- FR-DEC-003: pure Reader Engine.
- FR-DEC-004: AWS behind the API.
- FR-DEC-007/008/009/010: scope and data.

## Residual risks

- choice of monorepo manager and local storage;
- identity provider;
- initial implementation of the job runner;
- concrete strategy for S3 URLs/delivery.

These are later-phase decisions and do not change the validated boundaries.
