# Decision log

This file records accepted decisions and questions that still need resolution.

## Accepted decisions

### FR-DEC-001 - Mandatory separation of applications

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** FollowRead will use a monorepo, but Admin, Reader, and API will be independent applications. Admin will never be included in the Capacitor package.
- **Rationale:** Avoids exposing administration on devices and preserves clear boundaries.
- **Consequences:** Shared items will live in explicit packages; screens or permission-specific logic will not be shared for convenience.
- **Source:** Master prompt, sections 3 and 5.

### FR-DEC-002 - Content via dual catalog

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** Reader will combine a local catalog included in the build with a versioned remote catalog. A content update will not require a new build.
- **Rationale:** Enables offline startup and dynamic publishing.
- **Consequences:** Each package requires versioning, compatibility, checksum, and atomic download.

### FR-DEC-003 - Reader Engine without UI dependency

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** Synchronization, active word calculation, and playback control will be in `packages/reader-engine`, decoupled from React and visual components.
- **Rationale:** Facilitates deterministic testing and web/mobile reuse.

### FR-DEC-004 - AWS only behind the API

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** Polly and S3 will only be used from backend adapters. HTTP handlers, frontends, and shared packages will not know credentials or the AWS SDK.
- **Rationale:** Security, testability, and replaceability.

### FR-DEC-005 - Documentation language

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** Product documentation will be written primarily in Spanish; code names, routes, identifiers, and public contracts will use English.
- **Rationale:** The project sponsor works in Spanish and the code must be accessible to a broad technical audience.

### FR-DEC-006 - Audience hierarchy by relation to value

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** Children, English learners, and adults are beneficiary segments of the reader. Editors, reviewers, and administrators are enabling users; tutors, families, teachers, and operations managers are supporting stakeholders.
- **Rationale:** Reader segments share the problem of following audio and text, while editorial users solve a different flow that enables that value.
- **Consequences:** FR-PH00-TASK-003 will define separate profiles without creating different Reader applications. Child mode will not imply a child account until FR-DEC-OPEN-002 is resolved.

### FR-DEC-007 - `document` is represented as `article`

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** The catalog retains `story`, `article`, `book`, and `lesson`. A document is modeled as `article` while there is no intrinsic behavior justifying a fifth type.
- **Rationale:** Avoids two indistinguishable types and respects the explicit list from the prompt.
- **Consequences:** A future case may propose another type via migration and a recorded decision.

### FR-DEC-008 - Editorial translations in the MVP

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** Translations, contextual meanings, and essential examples will be stored as versioned editorial content. They will not depend on AI or an external service.
- **Rationale:** Reviewable quality, clear rights, and offline operation.
- **Consequences:** A future provider will be optional and will not replace content without review.

### FR-DEC-009 - No personal accounts for minors in the MVP

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** Child mode uses a local or supervised profile; it does not collect identity, email, date of birth, or personal analytics of the minor.
- **Rationale:** Enables a child experience without inventing a legal consent model.
- **Consequences:** A future child account requires review of privacy, region, consent, retention, and deletion.

### FR-DEC-010 - Free-form notes after the MVP

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** The MVP includes favorites, history, and progress. Free-form notes and enriched adult-mode bookmarks remain on the roadmap.
- **Rationale:** Reduces personal data, synchronization, and conflicts without losing the core flow.

### FR-DEC-011 - pnpm workspaces without an additional orchestrator

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** The JavaScript/TypeScript monorepo will use pnpm workspaces. The API will keep its Python environment via `pyproject.toml`. Nx and Turborepo will not be included in Phase 2.
- **Rationale:** Workspaces cover boundaries and initial commands with less configuration and a smaller update surface. An orchestrator may be proposed when there is evidence of build times or dependency issues that justify it.
- **Consequences:** Root scripts coordinate applications and packages; internal dependencies are declared with `workspace:*`; Node, pnpm, and Python versions will be documented.

### FR-DEC-012 - Official PostgreSQL 18.4 for local development

- **Date:** 2026-07-24
- **Status:** SUPERSEDED_BY_FR-DEC-013
- **Decision:** The local environment uses the official image `postgres:18.4-alpine3.24`, with data persisted in `/var/lib/postgresql`, port limited to loopback, and health via `pg_isready`.
- **Rationale:** PostgreSQL 18.4 is the current stable version and the official image changed the recommended persistent root to `/var/lib/postgresql` in version 18.
- **Consequences:** The patch tag is updated deliberately; `latest` is not used; major upgrades require a plan and migration testing.

### FR-DEC-013 - SQLite replaces PostgreSQL in the MVP

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** The MVP uses SQLite as the authoritative datastore via SQLAlchemy and Alembic. It does not require Docker. PostgreSQL is out of the MVP and may be resumed when there is operational capacity or a demonstrated need for concurrency/scale.
- **Rationale:** The owner confirmed they do not have PostgreSQL for this MVP and authorized continuing with SQLite.
- **Consequences:** The API is the sole owner of the file; tests use temporary files; SQLite-specific extensions will be avoided when they impede portability; a future migration to PostgreSQL requires a decision, export/import, and integrity tests.

### FR-DEC-014 - Revocable opaque sessions for the Admin MVP

- **Date:** 2026-07-24
- **Status:** ACCEPTED
- **Decision:** Adult/editorial accounts use password with Argon2id and random opaque sessions. The API will persist only the hash of the token and deliver it in a host-only cookie `HttpOnly`, `SameSite=Strict`, and `Secure` in production. JWTs, refresh tokens, and credentials will not be stored in `localStorage`/`sessionStorage`.
- **Protections:** 30-minute idle expiration, 8-hour absolute expiration, revocation on logout, rotation on authenticate/privilege change, `Cache-Control: no-store`, CSRF and origin verification for unsafe methods, messages that do not enumerate accounts, and attempt limits.
- **Scope:** Password recovery and accounts for minors remain out of the MVP. The first super-administrator is created via an explicit local command, never via seeded credentials.
- **Rationale:** Simplifies revocation and avoids credentials accessible to JavaScript. Follows current OWASP guidance for Argon2id, session cookies, and CSRF.
- **References:** [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html),
  [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html),
  [CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

### FR-DEC-015 - Minimal mobile adapter and no background audio

- **Date:** 2026-07-26
- **Status:** ACCEPTED
- **Decision:** Capacitor will only package Reader. App, Network, Splash Screen, and Status Bar are the only Phase 10 plugins. IndexedDB/`localStorage` continue as storage. Web Speech is paused in the background and no Android services or `UIBackgroundModes` are declared.
- **Rationale:** The existing experience is already offline, avoids file permissions, and lacks a continuous native audio source. Declaring background playback would be misleading.
- **Consequences:** Future native audio requires another decision, system controls, audio focus, interruptions, battery considerations, and store testing. Any secret will require native encrypted storage; current non-sensitive data will not.

### FR-DEC-016 - Deterministic educational aids from the bilingual package

- **Date:** 2026-07-26
- **Status:** ACCEPTED
- **Decision:** Learning mode obtains translation, meaning, and essential examples from bilingual paragraphs paired by `stable_key` and Speech Marks from the published package. Relative word alignment is an explicit MVP fallback.
- **Rationale:** Enables offline learning, preserves editorial review, and complies with the initial prohibition on relying on AI.
- **Consequences:** Complex senses will require a glossary or versioned editorial alignment. A future AI integration may only be optional, identified, and degradable.

### FR-DEC-017 - Local, aggregated observability without personal content

- **Date:** 2026-07-26
- **Status:** ACCEPTED
- **Decision:** API, Admin, and Reader produce minimal operational signals without sending data to third parties. Logs, metrics, and errors exclude bodies, query strings, cookies, tokens, text, vocabulary, and minor data. Routes are normalized to avoid uncontrolled cardinality.
- **Rationale:** Allows diagnosing stability without creating a new privacy surface.
- **Consequences:** Phase 13 may connect a collector, but must maintain wording, retention, access restricted to `/metrics`, and environment separation.

### FR-DEC-018 - Explicit caching by sensitivity and mutability

- **Date:** 2026-07-26
- **Status:** ACCEPTED
- **Decision:** Authentication, administration, synchronization, and operations use `no-store`; the public catalog uses short cache and packages are revalidated with ETag. Reader applies network-first to navigation, cache-first to versioned assets, and stale-while-revalidate to secondary resources.
- **Rationale:** Improves response time and offline behavior without storing sensitive responses or serving editorial content indefinitely stale.
- **Consequences:** A future CDN must preserve these rules and test invalidation on publish.

### FR-DEC-019 - Optional containers and provider-neutral artifacts

- **Date:** 2026-07-26
- **Status:** ACCEPTED
- **Decision:** Docker will package API, Admin, and Reader for CI/deploy, but `pnpm dev` and local SQLite remain the main path without Docker. OCI images, Compose, and scripts will not choose a provider; SemVer tags may be published to GHCR when a remote GitHub exists.
- **Rationale:** Meets Phase 13 scope without reintroducing PostgreSQL, blocking Windows, or creating unauthorized infrastructure or costs.
- **Consequences:** The phase retains an external gate until Docker, GitHub, and staging run. A future provider must add TLS, external backups, alerts, and environment-specific secrets.

### FR-DEC-020 - Public repository under MIT license

- **Date:** 2026-07-30
- **Status:** ACCEPTED
- **Decision:** FollowRead’s original code and assets will be published on GitHub under the MIT license, with copyright by `dafermen`.
- **Rationale:** The owner wants to showcase the project in their portfolio and allow others to study, reuse, and modify the code with attribution and without warranty.
- **Consequences:** `LICENSE` and `package.json` declare MIT. Dependencies retain their own licenses and any binary distribution requires an inventory of notices for the specific artifact.

## Open decisions

There are no open decisions recorded.
