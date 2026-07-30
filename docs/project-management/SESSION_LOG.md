# Session Log

## Session 2026-07-24 - Initial baseline

### Objective

Review the master prompt, create the tracking system, and leave Phase 0 ready to continue in a controlled manner.

### Work performed

- Verified that the master PDF has 37 pages and is not encrypted.
- Extracted the full text and visually reviewed representative pages, including the required first run.
- Confirmed that the project only contained `docs/FollowRead Project Prompt.pdf`.
- Confirmed that there is still no Git repository.
- Created the initial Phase 0 documentation structure.
- Recorded mandatory prompt decisions, open decisions, risks, and inconsistencies.
- Completed FR-PH00-TASK-001.
- Left FR-PH00-TASK-002 as an active task.
- Copied 30 documentation files to the final directory without replacing the master PDF.

### Commands and checks

- Inspected PDF metadata with `pdfinfo`.
- Rendered the 37 pages with `pdftoppm`.
- Extracted text with `pypdf`.
- Recursive inventory of `C:\Projects\FollowRead`.
- Checked existence of `.git`.
- Future validation: documentation script for links, IDs, and states.

### Tests executed

No application tests were run because there is still no code.

A structural validation of the documentation was performed:

- 30 Markdown files found;
- 19 minimal deliverables present and non-empty;
- 12 Phase 0 tasks with all required fields;
- task states within the allowed set;
- no apparent AWS credential assignments;
- final result: `PASS`.
- SHA-256 comparison of the 30 files between preparation and destination: `PASS`;
- master PDF size at destination: 183293 bytes, unchanged.

The first version of the checker produced a false negative because PowerShell altered accented characters in the validation code and because the word `TODO` appeared within an explanatory rule. The comparison was normalized to ASCII and secret detection was limited; it was not necessary to modify or degrade the documentation.

### Problems found

- Inconsistency between "document" and the list of content types.
- Missing definition of child accounts and consent.
- Adult notes and bookmarks do not appear in the initial entities.
- No Git repository exists.

### Decisions made

See FR-DEC-001 to FR-DEC-005 in `DECISIONS.md`.

### Exact continuation point

Continue at FR-PH00-TASK-002, starting by validating the measurable results of `docs/requirements/PRODUCT_VISION.md`. Do not start Phase 1.

---

## Session 2026-07-24 - Product vision validation

### Objective

Complete FR-PH00-TASK-002 and start defining users for FR-PH00-TASK-003.

### Work performed

- Reread all mandatory management files.
- Compared the vision with scope, functional and non-functional requirements, stories, criteria, and traceability.
- Separated primary beneficiaries, enabling users, and stakeholders.
- Defined eight identified and measurable product outcomes.
- Clarified that usability goals are pilot hypotheses.
- Left decisions about child accounts, translation, and MVP open.
- Added traceability between outcomes, requirements, stories, and criteria.
- Completed FR-PH00-TASK-002 and started FR-PH00-TASK-003.

### Problems found

The initial vision mixed reader segments with editorial users and lacked explicit indicators or measurement methods. No critical contradiction with scope or requirements was found.

### Decisions made

FR-DEC-006 - Audience hierarchy by relationship to value.

### Tests executed

A cross-document validation was run:

- 30 Markdown files present;
- 12 task sections with all required fields;
- summary and detailed states synchronized;
- FR-PH00-TASK-002 in `COMPLETED`;
- FR-PH00-TASK-003 in `IN_PROGRESS`;
- eight product outcomes defined and eight traced;
- seven vision coherence checks in `PASS`;
- FR-AC-011 and FR-DEC-006 present;
- final result: `PASS`.
- final comparison of the 30 documents between preparation and destination: `PASS`.

The first run of the checker did not recognize the accented header of FR-AC-011. The comparison was repeated with Unicode normalization and it was confirmed to be a false negative of the checker, not a document defect.

### Exact continuation point

Continue FR-PH00-TASK-003 by creating user profiles and explicitly distinguishing person, account, role, and stakeholder. Do not decide child accounts by implication and do not start Phase 1.

---

## Session 2026-07-24 - Phase 0 closure and start of Phase 1

### Objective

Advance steadily until closing Phase 0 and begin UX/UI design without creating code.

### Tasks completed

- FR-PH00-TASK-003 through FR-PH00-TASK-012.
- FR-PH01-TASK-001 and FR-PH01-TASK-002.

### Work performed

- Seven profiles with context, goals, barriers, accessibility, and outcomes.
- Vertical MVP and component boundaries.
- Decisions on documents, editorial translation, child privacy, and notes.
- 55 functional requirements with source/verification and 25 rules.
- 37 measurable non-functional requirements, data policy, and 12 threats.
- 20 stories, 12 cases, 23 criteria, and complete traceability.
- Validation of architecture, accessibility, risks, tests, environments, and rollback.
- Formal closure of Phase 0 passing through `READY_FOR_REVIEW`.
- Eight Phase 1 tasks prepared.
- Inventory of 26 screens and UX architecture/flows.

### Tests executed

- FR-PH00-TASK-005: 55 requirements and 25 rules, PASS.
- FR-PH00-TASK-006: 37 NFR and 12 threats, PASS.
- FR-PH00-TASK-007/008: 92/92 requirements and 25/25 rules traced, PASS.
- FR-PH00-TASK-009/011: 4 walkthroughs and 8 risks mapped, PASS.
- Pre-close Phase 0: 19 deliverables and 9 exit criteria, PASS.
- FR-PH01-TASK-001: 12 Reader, 14 Admin, 12 cases and 7 profiles, PASS.
- FR-PH01-TASK-002: 12 cases and 3 flow diagrams, PASS.
- Final validation: 40 Markdown files and 20 tasks, PASS.
- Comparison of the 40 documents at destination and master PDF intact, PASS.

Several initial runs of validators produced false positives due to accented characters, global section comparison, or abbreviations. They were corrected to validate the real structure; documentary defects were not hidden.

### Decisions

- FR-DEC-007: document uses `article`.
- FR-DEC-008: essential editorial translations.
- FR-DEC-009: no minor accounts/PII in the MVP.
- FR-DEC-010: free-form notes after the MVP.

### Known issues

- FR-ISSUE-001 remains open until Phase 2: no Git repository.
- FR-DEC-OPEN-004 remains open with owner/date: license before Phase 14.

### Exact continuation point

Continue FR-PH01-TASK-003 creating Reader wireframes for the 12 screens, starting with the base layout and the Reader. Do not create React components yet.

---

## Session 2026-07-24 - Phase 1 closure and technical base up to Docker

### Objective

Close Phase 1 and implement the verifiable base of Phase 2 until a real blocker is encountered.

### Tasks completed

- FR-PH01-TASK-003 through FR-PH01-TASK-008.
- FR-PH02-TASK-001 through FR-PH02-TASK-006.

### Work performed

- 12 Reader wireframes, 14 Admin, visual system, responsive design, accessibility, modes, and journeys.
- Git repository `main`, pnpm monorepo and six TypeScript packages with explicit boundaries.
- Admin and Reader separated with React/Vite, smoke tests and builds.
- FastAPI API with typed configuration and `GET /health`.
- Root gate `pnpm check` with ESLint, Prettier, Ruff, mypy, Vitest, pytest and builds.
- Examples and validation of public and private environment variables.

### Validation

- Phase 1: 12 deliverables, 26/26 wireframes and 12/12 cases, PASS.
- Contrast: 18 pairs, minimum 5.47:1 light and 7.32:1 dark, PASS.
- Root gate: format, lint, types, six tests and builds, PASS with no warnings.
- Admin, Reader, configuration and API: 100% base coverage.

### Current blocker

FR-ISSUE-005: Docker is not installed or not available on `PATH`. FR-PH02-TASK-007 remains `BLOCKED`; PostgreSQL validation was not simulated.

### Exact continuation point

Install or start Docker Desktop. Verify `docker --version` and `docker compose version`; then create and validate local PostgreSQL.

---

## Continuation 2026-07-24 - Static preparation of PostgreSQL

Docker remained absent. Without bypassing that blocker, the verifiable portion of FR-PH02-TASK-007 was completed:

- official image `postgres:18.4-alpine3.24` pinned;
- volume compatible with the change in PostgreSQL 18 `PGDATA`;
- port limited to `127.0.0.1`;
- healthcheck with `pg_isready`;
- local variables and typed PostgreSQL DSN;
- static validator incorporated into `pnpm check`;
- FR-DEC-012 recorded.

`pnpm check` passed fully: Compose validation, format, lint, types, six tests, 100% base coverage and builds. Remaining: `docker compose config`, startup and confirmation `healthy`.

---

## Continuation 2026-07-24 - Final audit of the Docker blocker

The check was repeated a third time and the following were inspected:

- command resolution via `PATH` and `where`;
- usual paths for Docker Desktop and Docker CLI;
- installed applications registry;
- Docker services and processes;
- availability of Podman as an alternative runtime.

All results were negative. Tasks 008 to 011 depend on PostgreSQL/migrations or the full gate that includes them, so there is no other safe progress that respects dependencies. The project is stopped until Docker Desktop is installed/started.

---

## Resumption 2026-07-24 - SQLite authorized for the MVP

The owner indicated that PostgreSQL is not available for the MVP and authorized SQLite. FR-DEC-013 was recorded, replacing FR-DEC-012 for the current scope. FR-ISSUE-005 is resolved by scope change and FR-PH02-TASK-007 returns to `IN_PROGRESS`.

PostgreSQL remains as a future evolution; it is not a requirement to continue MVP phases.

---

## Continuation 2026-07-24 - SQLite, migrations, hooks and CI

The PostgreSQL/Docker preparation was replaced by a local SQLite base in accordance with FR-DEC-013:

- typed configuration and reproducible resolution of the database path;
- SQLAlchemy connection with foreign keys enabled and isolated sessions;
- Alembic with base migration, upgrade/downgrade tested and a single head;
- install, migration and quality scripts compatible with Windows/CI;
- pre-commit verifiable that runs `pnpm check:fast` without modifying files;
- GitHub Actions workflow with minimal permissions, declared versions and equivalent gate;
- documentation for installation, variables, operation and SQLite limits.

The migration and `pnpm check` passed in `C:\Projects\FollowRead`; the API reached 100% coverage. Pytest required using `.pytest-temp/` within the checkout because the global temporary folder on Windows was not accessible in the validation environment. FR-PH02-TASK-009 and 010 were completed. FR-PH02-TASK-011 moved to `READY_FOR_REVIEW` to run the final clean audit.

---

## Continuation 2026-07-24 - Phase 2 closure and start of Phase 3

The final audit was executed on a clean Git clone from commit `c348ca1`. Node/Python dependencies were installed, hooks configured, Alembic applied on SQLite and `pnpm check` passed.

The first clone revealed a real discrepancy with line endings: Git converted text to CRLF on Windows while Prettier requires LF. `.gitattributes` was corrected, `c348ca1` was created and a second clone passed the full gate. Evidence was left in `PHASE_2_REVIEW.md`.

FR-PH02-TASK-011 became `COMPLETED`, Phase 2 was closed and 12 tasks were prepared for Phase 3. FR-PH03-TASK-001 became `IN_PROGRESS`.

---

## Continuation 2026-07-24 - Reading models and functional migration

- Implemented ReadingProgress, Favorite, VocabularyWord and DownloadRecord with ownership, versioning, stable anchors and idempotence.
- Fixed the obsolete continuation reference in PROJECT_STATUS.
- Initial migration review found that AuditLog did not yet have a model; it was added before accepting the schema.
- Alembic `2bf6cf5e1177` materializes the full functional model on top of the Phase 2 base.
- The migration test applies, inspects tables/FKs, reverts and reapplies a single head.
- `pnpm check` passed with 19 Python tests and 100% coverage.

FR-PH03-TASK-006 and 007 became `COMPLETED`; FR-PH03-TASK-008 became `IN_PROGRESS`.

---

## Continuation 2026-07-24 - Repositories and unit of work

- Created a typed base repository that prepares inserts, UUID queries and deletions without committed transactions.
- Implemented the published catalog with filters by language, type, audience, level and category, total independent of page and stable ordering.
- The detail loads the full editorial tree and excludes drafts, inactive publications and incomplete packages.
- `SqlAlchemyUnitOfWork` centralizes session, commit, rollback and close.
- Tests cover filters, pagination, detail/not-found, duplicates, commit, explicit rollback and rollback on context exit; the API retains 100% coverage.

FR-PH03-TASK-008 became `COMPLETED`; FR-PH03-TASK-009 became `IN_PROGRESS`.

---

## Continuation 2026-07-24 - Services, validations and errors

- Implemented `CatalogService` via a protocol decoupled from SQLAlchemy reading.
- The service validates limit 1..100, non-negative offset and canonical slugs.
- Stable codes `catalog.invalid_query` and `content.not_found` were defined.
- The global handler translates domain errors to a documented JSON container without exposing internal details.
- Tests cover valid and invalid inputs, content present/absent and HTTP states 404/422; the API retains 100% coverage.

FR-PH03-TASK-009 became `COMPLETED`; FR-PH03-TASK-010 became `IN_PROGRESS`.

---

## Continuation 2026-07-24 - Public catalog API

- Added typed schemas for summary, pagination, translations, chapters and paragraphs.
- `GET /catalog` supports filters by language, type, audience, level and category.
- `GET /catalog/{slug}` returns the published editorial tree or a stable 404.
- Integration excludes drafts and checks 200, 404 and 422.
- Tests detected SQLite thread isolation `:memory:`; `StaticPool` fixes it without altering file-based SQLite databases.
- The API passed 39 tests and maintains 100% coverage.

FR-PH03-TASK-010 became `COMPLETED`; FR-PH03-TASK-011 became `IN_PROGRESS`.

---

## Continuation 2026-07-24 - Observability, readiness and OpenAPI

- Separated liveness (`/health`) from readiness (`/ready`) with a real SQLite query.
- Each response incorporates `X-Request-ID`; invalid incoming values are replaced.
- Request events are emitted in JSON without query, bodies or secrets.
- Unexpected failures are logged with correlation and return a generic 500.
- OpenAPI verifies operational routes, catalog, detail and 404/503 schemas.
- Tests cover SQLite success/failure, logs, request ID, safe 500 and OpenAPI contract.

FR-PH03-TASK-011 became `COMPLETED`; FR-PH03-TASK-012 became `IN_PROGRESS`.

---

## Continuation 2026-07-24 - Phase 3 audit

- A disposable SQLite database was created from scratch with Alembic.
- Confirmed a single head/current: `2bf6cf5e1177`.
- Downgrade to base and second upgrade to head passed.
- `pnpm check` passed with 44 Python tests, 5 JavaScript, 100% coverage and all builds.
- The eight exit criteria were documented in `PHASE_3_REVIEW.md`.
- The disposable database was removed and no blockers remained.

FR-PH03-TASK-012 and Phase 3 moved to `READY_FOR_REVIEW`.

---

## Continuation 2026-07-24 - Phase 3 closure

The evidence commit `a32c6ca` executed the full pre-commit again with no discrepancies. The mandatory transition `IN_PROGRESS -> READY_FOR_REVIEW -> COMPLETED` was confirmed.

FR-PH03-TASK-012 became `COMPLETED` and Phase 3 was closed. The next step is to prepare and activate Phase 4 breakdown before implementing authentication or authorization.

---

## Continuation 2026-07-24 - Phase 4 preparation

The strategy was contrasted with current OWASP guides. FR-DEC-014 selects Argon2id password hashing and an opaque revocable session in an HttpOnly cookie, with no JWT or client-side credential storage. It also sets TTL, CSRF/origin, no-store, local bootstrap and exclusion of recovery/child accounts.

Ten tasks and eight exit criteria were defined. FR-PH04-TASK-001 became `COMPLETED`; FR-PH04-TASK-002 became `IN_PROGRESS` to model credentials and sessions before endpoints.

---

## Continuation 2026-07-25 - Persistence, cryptography and authentication bootstrap

- Added `UserCredential` and `UserSession` with separate hashes, expiration, revocation, constraints and indices, along with a reversible Alembic migration.
- SQLite normalizes session dates to UTC when evaluating validity.
- Passwords use Argon2id via `pwdlib`; opaque tokens use cryptographic randomness, SHA-256 for persistence and constant-time comparison.
- `pnpm admin:bootstrap` creates the first superadmin locally, idempotently and without seeded password or password in arguments.
- The API reached 60 tests with 100% coverage prior to the comprehensive verification.

FR-PH04-TASK-002, 003 and 004 became `COMPLETED`; FR-PH04-TASK-005 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - HTTP session and browser controls

- Exposed `POST /auth/login`, `GET /auth/session` and `POST /auth/logout`.
- Login errors do not distinguish nonexistent account, disabled account or incorrect password.
- The session renews on activity without exceeding eight hours and logout is revocable and idempotent.
- The session cookie is host-only, HttpOnly and Strict; production adds Secure.
- Logout requires an allowed origin and a CSRF token verified against the cookie and a server hash.
- CORS accepts credentials only from configured Admin/Reader and `/auth` is never cached.
- The API suite reached 73 Python tests with 100% coverage before the integral gate.

FR-PH04-TASK-005 and 006 became `COMPLETED`; FR-PH04-TASK-007 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - RBAC authorization

- Defined four roles and eight stable permissions with idempotent synchronization.
- Bootstrap assigns all MVP permissions to `super_admin`.
- HTTP dependencies resolve an active session and require an explicit permission.
- `/admin/access` validates Admin entry via `admin.access`.
- Accounts without permission, inactive, revoked or without session are rejected.
- The suite reached 77 Python tests with 100% coverage before the integral gate.

FR-PH04-TASK-007 became `COMPLETED`; FR-PH04-TASK-008 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - Login limit and audit

- Five failures in 15 minutes block the credential for 15 minutes.
- The window resets on expiry and success clears counters/block.
- Login and logout generate `AuditLog` with result and correlation ID.
- The audit does not contain password, token, requested email or HTTP body.
- Nonexistent accounts preserve the same external contract and minimized evidence.
- The suite reached 79 Python tests with 100% coverage.

FR-PH04-TASK-008 became `COMPLETED`; FR-PH04-TASK-009 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - Audit and Phase 4 closure

- Disposable SQLite passed upgrade, downgrade to base and second upgrade up to `20260725_0002`.
- `pnpm check` passed with 79 Python tests, 5 web, 100% coverage and all builds.
- The eight criteria were in PASS in `PHASE_4_REVIEW.md`.
- FR-PH04-TASK-009 and 010 transited through `READY_FOR_REVIEW` before `COMPLETED`.

FR-PH04-TASK-009, FR-PH04-TASK-010 and Phase 4 moved to `COMPLETED`. The next step is to prepare Phase 5 breakdown.

---

## Continuation 2026-07-25 - Visual start of Phase 5

- Broke Phase 5 into 12 verifiable tasks and activated the access flow.
- Replaced the provisional card with a responsive admin shell.
- Dashboard and Contents show an identified preview with sample editorial data.
- Login consumes `/auth/login` and presents states for submitting, invalid credential, rate limit and unavailability.
- Integrated documentation adapted to the new visual system without losing pnpm installation.
- Admin passed seven tests, coverage configured to 100%, typecheck and production build.

FR-PH05-TASK-001 and 002 became `COMPLETED`; FR-PH05-TASK-003 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - Full Admin session

- Admin restores the session from `/auth/session` and keeps identity and permissions only in memory.
- Logout sends the CSRF token from the cookie and returns to protected access.
- Navigation hides areas without permission, while the API maintains definitive authorization.
- A valid session shows the real identity; development keeps the preview when no account exists.
- Eight web tests cover routes, login, restoration, partial permission and logout with 100% coverage.

FR-PH05-TASK-003 became `COMPLETED`; FR-PH05-TASK-004 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - Connected editorial dashboard

- Added an admin summary protected by `admin.access`.
- The API computes metrics, priorities, recent content and activity from SQLite.
- The authenticated Dashboard consumes real data and shows loading, empty and error states.
- The development preview remains identified and separate from real information.
- Navigation permissions were aligned with the API's effective permissions.
- The integral gate passed with 81 Python tests, eight web tests and coverage set to 100%.

FR-PH05-TASK-004 became `COMPLETED`; FR-PH05-TASK-005 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - Connected editorial catalog

- Added an admin list protected with search, state, type, sort and pagination.
- Each result uses the most recent editorial version and shows title, audience and languages.
- The API computes visible actions for editing, processing, review and publishing by permission.
- The screen keeps interactive demo data when no local session exists.
- Loading, error and empty catalog states were incorporated into desktop and compact compositions.
- The gate passed with 83 Python tests, nine web tests, 100% coverage and all builds.

FR-PH05-TASK-005 became `COMPLETED`; FR-PH05-TASK-006 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - Visual draft creation

- Added a responsive create screen with title, automatic slug, type and audience.
- The form includes reader level, one or two languages and editorial categories.
- `POST /admin/content` requires `content.create`, allowed origin, session cookie and CSRF token.
- SQLite creates or reuses levels and categories, records version 1 as draft and leaves an audit.
- The preview simulates the result for demos without an account; a real session persists data.
- The gate passed with 85 Python tests, ten web tests, 100% coverage and all builds.

FR-PH05-TASK-006 became `COMPLETED`; FR-PH05-TASK-007 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - Structural editor and recovery

- Added protected reading and saving of editorial documents by content.
- The visual editor organizes languages, chapters and paragraphs and allows reordering with accessible controls.
- Changes are autosaved, show state and are kept locally until persistence is confirmed.
- An expected date detects concurrent edits and presents a recoverable conflict.
- Saving requires `content.edit`, allowed origin and CSRF, and generates an audit.
- The gate passed with 86 Python tests, eleven web tests and 100% coverage.

FR-PH05-TASK-007 became `COMPLETED`; FR-PH05-TASK-008 became `IN_PROGRESS`.

---

## Continuation 2026-07-25 - Visual closure of Admin and Phase 6

- The editor completed translations, compatible voice selection and validated illustration upload.
- The Processing screen shows cost, progress, language, voice, diagnostic, cancellation and retry.
- The API splits text, calculates cost, generates local audio and links Speech Marks to each paragraph.
- The Amazon Polly limit was decoupled, configurable and tested with a simulated offline client.
- Review and publishing incorporated checklist, approval, rejection, publish, unpublish, archive and audited history.
- Responsive compositions cover 320 px, labels, alerts, ARIA progress and reduced motion.
- The quick gate passed with 91 Python tests, 13 Admin tests and 100% backend coverage.

FR-PH05-TASK-008 to 012 and FR-PH06-TASK-001 to 010 became `COMPLETED`. Phases 5 and 6 closed in PASS; the next step is to break down Phase 7.

---

## Continuation 2026-07-26 - Reading engine and first story

- Implemented `@followread/reader-engine` without React or DOM, with validated timeline, binary search, play, pause, seek, repeat, speed, chapters and progress.
- The API exposes a published reading package with translations, paragraphs, illustration, audio and linked Speech Marks.
- Created El zorro y la luna, an original bilingual story with two chapters and original illustration.
- `pnpm demo:seed` creates and publishes the story idempotently in SQLite without API keys or external services.
- Reader advanced a visual cut of Phase 8 with library, highlighting, hand pointer, auto-scroll, controls, language switching and local recovery.
- MVP audio simulates duration and marks; audible narration is traced for Phase 8.
- `pnpm check` passed in the final project with 95 API tests, 24 application and package tests, rounded coverages of 99% and all builds.

FR-PH07-TASK-001 to 010 became `COMPLETED`. Phase 7 closed in PASS; the next step is to break down Phase 8.

---

## Continuation 2026-07-26 - Reader Web and PWA

- Completed start, filterable library, categories, search and published detail.
- Favorites, progress, history, preferences and vocabulary are saved locally without PII.
- Child, adult and learning share components with defaults and appropriate controls.
- Web Speech provides local audible narration; when no voice is available visual tracking continues.
- Learning mode aligns editorial words between Spanish and English and allows repeat/save.
- Manifest, icon and service worker make the shell installable without prefetching Phase 9 downloads.
- Wide/compact navigation, safe areas, 320 px, focus and reduced motion implemented.
- Added 22 Reader tests and a Chrome headless run against a real API/Reader.

FR-PH08-TASK-001 to 012 became `COMPLETED`. Phase 8 closed in PASS; the next step is to break down Phase 9.

---

## Continuation 2026-07-26 - Downloads, offline and sync

- The API delivers canonical JSON and persists its exact SHA-256 when publishing or seeding.
- Reader combines remote catalog and IndexedDB with download and update states.
- El zorro y la luna is included in the build as the initial verifiable offline package.
- Download and update validate compatibility, integrity, 100 MB, 250 MB and quota.
- The Downloads screen allows reading, updating and deleting without erasing progress.
- Library, detail, reader, local voice and marks operate when the API is unavailable.
- Progress is grouped by content and `POST /reader/sync` confirms idempotent operations.
- Chrome verified included content, network blocked, local queue and sync on reconnect.
- The final gate passed with 98 API tests and 31 Reader tests.

FR-PH09-TASK-001 to 011 became `COMPLETED`. Phase 9 closed in PASS; the next step is to break down Phase 10.

---

## Continuation 2026-07-26 - Capacitor, Android and iOS

- Locked Capacitor to 8.4.2 and `com.followread.reader` with `apps/reader/dist` as the single source.
- Android API 24/36 and iOS 15/SPM were generated, synchronized and versioned under Reader.
- Adaptive icons and light/dark splash were generated from verified 1024/2732 sources.
- Network and App integrate connection, reconnection, background pause and layout restoration.
- IndexedDB and `localStorage` preserve offline/progress without file permissions or PII.
- Android only uses Internet/network state; iOS requests no sensitive permissions.
- Background audio was not enabled because Web Speech does not guarantee continuous playback.
- Safe areas and orientation passed in Chrome 390×844 and 844×390 preserving progress.
- Debug APK compiled, installed and opened in an Android emulator API 35; activity survived rotation.
- iOS project passed sync/audit; build and device remain as macOS/Xcode gate before TestFlight.
- Added doctor, validator, E2E, build/publish guides and Android/iOS troubleshooting.
- Final gate passed with 98 API tests and 33 Reader tests.

FR-PH10-TASK-001 to 012 became `COMPLETED`. Phase 10 closed in PASS; the next step is to break down Phase 11.

---

## Continuation 2026-07-26 - Learn English mode

- Textually and visually reviewed page 24 of the master prompt.
- `learningDomain.ts` builds meanings and examples from the bilingual editorial package.
- The reader shows an educational toolbar and per-paragraph translation visible or hidden.
- The contextual panel allows repeating a word/sentence, saving, marking favorite and changing state.
- Vocabulary retains context, favorite, new/learning/mastered, reviews and history.
- My Vocabulary was redesigned with goals, metrics, search, filters, cards and recent activity.
- No AI, external dictionary, PII or network dependency was incorporated for essential functions.
- Added domain/storage/React tests and `reader:learning-e2e` with desktop/mobile screenshots.
- Chrome run confirmed persistence, Favorites filter and no overflow at 390 × 844.
- The final gate passed with full monorepo coverage and builds.

FR-PH11-TASK-001 to 012 became `COMPLETED`. Phase 11 closed in PASS; the next step is to break down Phase 12.

---

## Continuation 2026-07-26 - Quality, security and performance

- API added GZip, ETag/revalidation, cache policies and defensive headers.
- Request IDs, JSON logs and safe errors now feed aggregated Prometheus metrics.
- Admin and Reader contain React/global errors without logging private messages.
- AdminExperience and StoryReaderPage load lazily with gzip budgets.
- Service worker separates navigation, assets and content with three cache strategies.
- Mobile audit checked eight critical routes at 390 × 844.
- SQLite load passed 120 requests, concurrency 12 and final p95 107.9 ms with no failures.
- Audit fixed transitive Capacitor warnings and updated the vulnerable `pip`.
- JavaScript has zero known vulnerabilities of moderate or higher; Python has zero.
- Regression was automated with quality, security, four E2E and the full gate.

FR-PH12-TASK-001 to 010 became `COMPLETED`. Phase 12 closed in PASS; the next step is to break down Phase 13.

---

## Continuation 2026-07-26 - Automation and continuity for Phase 13

- Visually verified page 25 of the master prompt.
- API, Admin and Reader obtained separate images with explicit base versions.
- Compose coordinates Alembic, health, SQLite volume, filesystem read-only and minimal capabilities.
- CI adds audit, web artifacts and builds for the three images.
- SemVer tags prepare GHCR, web packages, release notes and GitHub Release.
- GitHub Environments protect smoke tests for development/staging/production.
- SQLite backup/restore validates integrity and checksum; rollback preserves data and does not downgrade.
- Environments, secrets, releases, migrations, backup and rollback were documented.
- `AGENTS.md` and `CURRENT_STATUS.md` were recorded as required input for future sessions.
- Docker is not installed, Git has no remote and there is no provider; external validation is explicit and not simulated.

The local gate passed with `pnpm check` and `pnpm quality:regression`: 103 API tests, web tests, builds, security/accessibility audits, offline/mobile/learning journeys, budgets and load were green. Local smoke confirmed API, Admin and Reader. Backup/restore tests also verified integrity and fixed explicit release of SQLite connections on Windows.

FR-PH13-TASK-001 to 011 became `COMPLETED`; TASK-012 remains `BLOCKED` until Docker, remote GitHub and authorized staging are available.

---

## Continuation 2026-07-28 - Documentation structure and pre-deploy gate

- Added canonical entries for architecture, API, development, tests, deployment, operations, security and troubleshooting without moving detailed sources.
- Added ADRs for SQLite and optional containers, changelog, contribution, notice `UNLICENSED`, third-party license status and GitHub templates.
- `test/` became a cross-cutting inventory; unit tests remain next to code.
- Defined thirteen mandatory categories before deployment and an evidence record.
- The matrix honestly marks properties, mutation, fuzzing, contracts, resilience and external compatibility as partial/not implemented.
- `pnpm docs:validate` checks structure, links and presence of the thirteen categories.
- The first gate detected an intermittent race: the reader could show Play before its timeline loaded. The UI was blocked until the timeline corresponds to the active story, version and language.
- `pnpm check` and `pnpm quality:regression` passed fully after bringing up the three services; the regression covered E2E, offline, mobile, learning, accessibility, security, budgets and load.

TASK-012 continues `BLOCKED`; the documentation structure does not replace the tests or pending external gates.

---

## Continuation 2026-07-29 - OpenAI voice and visual tracking

- Added an OpenAI TTS adapter in the API with voices `marin`, `coral`, `cedar` and `verse`.
- The key is read only from `OPENAI_API_KEY` in `apps/api/.env`; it never reaches the browser.
- MP3 aligns by word with `whisper-1`, is published in `/audio` and can be regenerated without duplicating assets or Speech Marks in SQLite.
- Reader plays real editorial audio when published and keeps Web Speech as fallback.
- Late or out-of-order events can no longer roll back highlighting.
- The arrow was replaced by a hand `☝️` positioned below the active word.
- Admin, Reader and canonical documentation explain how to enable OpenAI and recommend `marin`/`cedar`.
- `pnpm check` passed fully: 106 API tests, 40 Reader tests, 14 Admin tests, lint, types, documentation, static security and builds green.

An actual audio test remains pending because the repository does not contain a key. The next step is to create `apps/api/.env`, generate both languages from Admin and validate voice/synchronization.

---

## Continuation 2026-07-29 - Persistent cache for paid audio

- The API stores `source_checksum`, a SHA-256 fingerprint of text, language, voice, provider and models.
- A new request with the same fingerprint reuses the MP3 and its Speech Marks, finishes as `cached` and records zero cost without calling the provider.
- The cache invalidates when content or configuration changes, or when the file is missing.
- Admin creates a request key per action and shows `Audio reutilizado · sin costo API` when appropriate.
- SQLite migration `20260729_0003` was applied to the local database.
- The admin suite was explicitly isolated with `FakePollyAdapter`, so a real `.env` cannot turn an automated test into a paid call.
- The local file and OpenAI configuration were verified without exposing the secret.
- `pnpm check` passed fully with 107 API tests, 40 Reader and 14 Admin, plus lint, types, documentation and builds.

Generating the real story from Admin, listening and repeating the action to visually validate cache state with the service active remains pending.

---

## Continuation 2026-07-29 - Fixing published audio

- Diagnosed that Reader preferred an old offline bootstrap that contained local adapter paths and marked them incorrectly as published audio.
- Generated the real MP3s of the story with OpenAI: Spanish with `marin` and English with `cedar`.
- The API serves both files as `audio/mpeg`; the package contains 73 marks in Spanish and 74 in English.
- A second request per language finished as `cached`, with estimated zero cost and no further paid generation.
- The processing service now updates the checksum of any active publication after saving audio and Speech Marks.
- Reader replaces an included bootstrap if its checksum changed, but preserves any explicit user download.
- The service worker uses new cache versions and fetches the offline manifest with network priority.
- `pnpm check` passed fully with 108 API tests, 41 Reader and 14 Admin, plus lint, types, documentation, static security and builds.

Only the user auditory confirmation after a full Reader reload remains. External gates of Phase 13 (Docker, GitHub and staging) remain pending.

---

## Continuation 2026-07-29 - ES/EN switch with OpenAI timestamps

- Reproduced that the EN button received the click but did not change the interface.
- The English mark `trees.` started 220 ms before the previous one ended; Reader rejected the entire timeline and the handler terminated before updating the language.
- Reader defensively normalizes marks from any package before loading them into the engine.
- OpenAI TTS also normalizes external timestamps before persisting them.
- Cache reuse repairs old marks and updates the published checksum without calling the provider.
- The only existing overlap was fixed in SQLite and exported again to the offline bootstrap; the process recorded zero provider calls.
- The Reader regression now includes an overlaid English timeline and verifies that EN shows `A Light in the Forest`.

The published API now has 74 English marks and 73 Spanish marks, both with zero invalid sequences.

---

## Continuation 2026-07-29 - Illustrations per chapter

- The public Reader contract added optional `image_uri` and `image_alt_text` per chapter.
- The main image remains the fallback: a story with a single illustration repeats it across chapters without extra configuration.
- Editorial illustrations use position 0 for cover and positions 1..N for chapters.
- Reader switches the image along with the chapter and preserves accessible alt text.
- Offline downloads store the cover and all specific available images.
- An original illustration was generated for The Shining Path / El sendero brillante, maintaining characters, palette and cover style.
- Idempotent seeding adds or updates the chapter 2 resource without touching OpenAI audio.
- The real package and bootstrap expose the chapter 2 image in Spanish and English; chapter 1 retains `null` and demonstrates the fallback.
- `pnpm check` passed with 110 API tests, 42 Reader and 14 Admin.
- `pnpm reader:e2e` advanced to chapter 2 in Chrome and confirmed the visible image URI.

---

## Continuation 2026-07-29 - Highlighting without visual jumps

- Conceptually reproduced the visual fatigue caused by reflowing the line when activating each word.
- The active word now preserves the same `inline` behavior as the others; color, background, shadow and the hand do not take extra space in the paragraph flow.
- Reader checks the word position before scrolling the page and only centers it if it is outside the visible window.
- The automated regression confirms that a visible word does not invoke scrolling.
- `pnpm check` passed with 110 API tests, 42 Reader and 14 Admin, plus lint, types, documentation and builds.

Only the user's visual confirmation during a real playback remains pending. External gates of Phase 13 (Docker, GitHub and staging) remain pending.

---

## Continuation 2026-07-29 - Clearer reading hand

- The user confirmed that stable highlighting removed visual fatigue.
- The gesture `☝️`, which could look like a raised hand, was replaced by `👆`.
- Both reading and visual preference now show the same finger pointing at the word from below.
- The Reader test verifies the new indicator; format, lint, types and the complete suites passed with 110 API tests, 42 Reader and 14 Admin.

---

## Continuation 2026-07-29 - Complete demo catalog

- Converted the remaining three Admin compositions into real, bilingual and published content: The River Between Us (lesson), El jardín secreto (article) and La casa de los sonidos (story).
- Each reading contains two chapters and six paragraphs per language; El zorro y la luna remains the fourth published content.
- Three original covers were created and incorporated into Reader and the offline catalog.
- `pnpm demo:seed` now prepares the full catalog idempotently and resumes partially created content without duplicating it.
- With OpenAI configured, seeding generates real audio with `marin` in Spanish and `cedar` in English; the persistent cache prevents repeating paid calls. A second run created zero content and did not regenerate audio.
- Admin shows the four readings as published and their accesses open Reader directly.
- The Reader home cover prioritizes a story when other content types exist.
- The offline bootstrap was regenerated with the four packages.
- `pnpm reader:e2e` opened the four contents in Spanish and English and verified all routes.
- `pnpm check` passed with 111 API tests, 42 Reader and 14 Admin, plus documentation, format, lint, types and builds.

The four contents are ready for local demonstration. Only external gates of Phase 13 remain pending: Docker, GitHub, staging, physical iOS and the advanced pre-deploy matrix.

---

## Continuation 2026-07-30 - Initial publication on GitHub and MIT license

- The owner created and authorized the public publication on `dafermen/FollowRead`.
- MIT was chosen for code and original assets, with copyright of `dafermen`.
- `LICENSE`, `package.json`, README, decisions and project status were aligned.
- Third-party dependencies keep their own licenses; distributing binaries requires a specific artifact inventory.
- Pre-push review confirmed that `.env`, SQLite, logs, caches and builds are ignored.
- No potential keys or versioned files larger than 50 MB were detected.
- The remote repository was empty, so the initial publication is performed directly on `main`; there is no base branch to open a pull request.
- The most recent full local validation remains green with 111 API tests, 42 Reader and 14 Admin.

After publication, the first workflow `ci.yml` must be confirmed on GitHub. Docker, staging, physical iOS and the advanced gaps of the pre-deploy matrix remain pending.

---

## Continuation 2026-07-30 - English portfolio documentation

- Reworked the root README in American English with architecture, setup, URLs, OpenAI narration,
  quality gates, documentation links and license information.
- Captured and visually verified four 1440x900 screenshots covering the Reader library,
  synchronized reading, Admin dashboard and editorial catalog.
- Added `pnpm screenshots:readme` so the portfolio gallery can be regenerated from running services.
- Translated 126 Markdown/YAML documentation files while preserving code blocks, inline code, URLs,
  identifiers and literal bilingual interface labels.
- Recreated the original master project prompt as a polished English PDF and visually inspected the
  cover, body, repository tree and final page after rendering all 39 pages.
- Used `gpt-5-mini` for the authorized bulk translation. Measured successful calls cost about
  USD 0.39; recoverable retries kept the total safely below the owner's USD 1.00 limit.
- Recorded the first real GitHub Actions result: all preceding work reached the dependency audit,
  which failed because the workflow-created Python environment retained vulnerable `pip 25.0.1`.
  The narrowly scoped CI correction remains pending explicit owner approval.
- `pnpm check` passed after integration with 111 API tests, 42 Reader tests, 14 Admin tests,
  shared-package tests, documentation/workflow/deployment/mobile validation and production builds.

The next external action is to approve and apply the CI packaging-tool upgrade, confirm a green
GitHub rerun, and continue the Docker/staging gates for Phase 13.

---

## Continuation 2026-07-30 - Green GitHub CI

- Reproduced the Python audit failure from GitHub Actions run `30551099625`: the manually created
  virtual environment retained vulnerable `pip 25.0.1`.
- Replaced the duplicated CI setup with `pnpm setup:python`, which upgrades the packaging tool and
  installs the API through the same cross-platform path used locally.
- Found that bare `pnpm ci` invoked pnpm's install alias instead of the repository script; changed
  CI and Release to the explicit `pnpm run ci`.
- The now-real quality gate exposed a missing Reader artifact and then a workspace dependency issue
  in its container. The Reader Dockerfile now builds `@followread/reader-engine` before Reader, and
  deployment validation requires both commands.
- GitHub Actions run `30558522375` passed on commit `faf194d`: complete quality gate, JavaScript and
  Python audits, deployment validation, web artifact upload, and API/Admin/Reader container builds.

The remaining Phase 13 gates are a running Compose deployment, staging migration/smoke/backup/
rollback, physical iOS validation and the advanced pre-deployment test categories.
