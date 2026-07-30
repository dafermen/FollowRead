# FollowRead Phase Plan

## Conventions

- A phase can only be closed when its critical deliverables exist, have been reviewed, and meet their exit criteria.
- A task uses one of these states: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`,
  `READY_FOR_REVIEW`, `COMPLETED`, `CANCELLED` or `DEFERRED`.
- Architectural decisions that change this plan must be recorded in `DECISIONS.md`.

## Phases

| Phase | Name | Main objective | State |
|---:|---|---|---|
| 0 | Discovery, definition and planning | Define the product and a verifiable plan | COMPLETED |
| 1 | UX/UI design and visual system | Design flows, screens and accessibility | COMPLETED |
| 2 | Monorepo and development environment | Prepare projects, tools and base CI | COMPLETED |
| 3 | Data modeling and base API | Create the backend functional foundation | COMPLETED |
| 4 | Authentication and authorization | Protect Admin and prepare Reader users | COMPLETED |
| 5 | FollowRead Admin | Build the content administration | COMPLETED |
| 6 | Integration with Amazon Polly | Generate audio and Speech Marks with security | COMPLETED |
| 7 | Reading engine | Implement reusable audio-text synchronization | COMPLETED |
| 8 | FollowRead Reader Web | Build library, reader and accessible PWA | COMPLETED |
| 9 | Synchronization and offline mode | Download, validate and sync content | COMPLETED |
| 10 | Capacitor, Android and iOS | Package only Reader for devices | COMPLETED |
| 11 | Learn English mode | Add educational features | COMPLETED |
| 12 | Quality, security and performance | Harden the system for stable use | COMPLETED |
| 13 | CI/CD and deployment | Automate validations and deliveries | IN_PROGRESS |
| 14 | Final documentation and GitHub | Prepare evaluation, contribution and portfolio | NOT_STARTED |

## Phase 0 - Closed

### Objective

Turn the master prompt into a coherent, prioritized and traceable set of decisions, requirements, risks and strategies before writing code.

### Critical deliverables

- `docs/requirements/PRODUCT_VISION.md`
- `docs/requirements/PROJECT_SCOPE.md`
- `docs/requirements/FUNCTIONAL_REQUIREMENTS.md`
- `docs/requirements/NON_FUNCTIONAL_REQUIREMENTS.md`
- `docs/requirements/USER_STORIES.md`
- `docs/requirements/USE_CASES.md`
- `docs/requirements/ACCEPTANCE_CRITERIA.md`
- `docs/requirements/TRACEABILITY_MATRIX.md`
- `docs/architecture/SYSTEM_CONTEXT.md`
- `docs/architecture/INITIAL_ARCHITECTURE.md`
- `docs/architecture/SECURITY_STRATEGY.md`
- `docs/ux-ui/UX_STRATEGY.md`
- `docs/testing/TEST_STRATEGY.md`
- `docs/deployment/DEPLOYMENT_STRATEGY.md`
- the files in `docs/project-management/`

### Exit criteria

1. All requirements have an identifier, priority and verifiable criterion.
2. Stories, use cases and planned tests can be traced to requirements.
3. The MVP scope and what is out of scope are explicit.
4. Boundaries between Admin, Reader, API and Reader Engine are defined.
5. Child privacy, authentication, data, AWS, offline and accessibility have strategies.
6. Open decisions have an owner and a target date.
7. High risks have mitigation and an associated task.
8. The plan was reviewed as a whole with no critical contradictions.
9. The Phase 0 closing task is `COMPLETED`.

### Prohibitions while Phase 0 is active

- Do not create final screens.
- Do not install dependencies.
- Do not integrate AWS services.
- Do not create the applications monorepo.
- Do not mark provisional requirements as approved.

### Outcome

Phase 0 closed on 2026-07-24. Evidence: `PHASE_0_REVIEW.md`.

## Phase 1 - Closed

### Objective

Design the experience, navigation, wireframes, visual system, responsiveness and accessibility before implementing screens.

### Exit criteria

1. Reader and Admin flows cover critical and alternate cases.
2. All minimum screens have wireframes and states.
3. Visual system defines typography, color, spacing, icons and components.
4. Child, adult and learning modes are resolved as coherent modes.
5. Responsiveness, keyboard, focus, motion and touch have specifications.
6. Critical prototypes pass walkthroughs and accessibility review.
7. All Phase 1 deliverables are validated.

### Outcome

Phase 1 closed on 2026-07-24. Evidence: `PHASE_1_REVIEW.md`.

## Phase 2 - Closed

### Objective

Create the monorepo, base applications, tools, local environment, tests and CI without yet implementing product functionality.

### Exit criteria

1. Admin, Reader and API exist separately and start.
2. TypeScript strict, Python type hints, lint and formatting are configured.
3. Base tests and builds pass.
4. SQLite and base migrations work without Docker or external services.
5. Environment variables are documented without secrets.
6. Scripts, hooks and CI perform the same validation.
7. Clean installation is documented and verified.

### Outcome

Phase 2 closed on 2026-07-24. Evidence: `PHASE_2_REVIEW.md`.

## Phase 3 - Closed

### Objective

Create the backend functional foundation through a consistent relational model, migrations, repositories, services, HTTP contracts, errors, logging, health checks, OpenAPI and tests.

### Exit criteria

1. The 22 initial entities from the prompt have a model or an explicit, traceable postponement.
2. Relationships, constraints, states, versioning and deletion preserve business rules.
3. A working migration creates and reverts the SQLite schema from an empty base.
4. Repositories and services keep domain logic out of HTTP routes.
5. Validations and error responses use a standard contract without leaking internal details.
6. Health/readiness, structured logging and OpenAPI reflect real behavior.
7. A slice of catalog/content works via API with unit and integration tests.
8. The full gate passes from a disposable SQLite base.

### Outcome

Phase 3 closed on 2026-07-24. Evidence: `PHASE_3_REVIEW.md`.

## Summary of criteria for following phases

Each subsequent phase must define, before starting, complete tasks with dependencies, files, tests and acceptance criteria. The detailed description of activities from the master prompt is considered the minimum source; `TASKS.md` will be expanded when preparing each phase.

## Phase 5 - Closed

### Objective

Create an accessible administrative application that allows the editorial team to sign in, view prioritized work and manage content from draft to publication.

### Exit criteria

1. Login, session restore and logout use the secure contracts from Phase 4.
2. Shell, dashboard and navigation respond to permissions and work from 320 CSS px.
3. Listing, creation and editing of content persist metadata, structure and valid translations.
4. Drafts preserve changes, communicate saves and avoid overwrite on conflict.
5. Resources, voice and processing present states, recoverable errors and authorized actions.
6. Review, preview and publication follow the audited state machine.
7. Empty, loading, error and partial-permission states are accessible and preserve context.
8. Component, integration and critical-path tests pass with the full gate.

### Outcome

Phase 5 closed on 2026-07-25. Evidence: `PHASE_5_REVIEW.md`.

## Phase 6 - Closed

### Objective

Generate audio and Speech Marks from editorial translations using decoupled contracts, cost control, intact storage and a recoverable administrative experience.

### Outcome

Phase 6 closed on 2026-07-25. Evidence: `PHASE_6_REVIEW.md`. The MVP keeps the local adapter as the default option and does not require an AWS account.

## Phase 7 - Closed

### Objective

Turn the published content and its Speech Marks into a deterministic, reusable, React-agnostic engine that controls timing, the active word, chapters, speed, recovery and interruptions.

### Exit criteria

1. The engine validates a timeline and deterministically finds the active word.
2. Play, pause, repeat, seek, change speed and navigate chapters update a single observable state.
3. Progress can be serialized and recovered by content and language.
4. Viewport changes, interruptions and audio loss have explicit behavior.
5. The API delivers published text, resources and Speech Marks in a stable package.
6. There is an original bilingual story seedable into SQLite without external services.
7. Unit, integration tests, types, lint and compilation pass.
8. The architecture and constraints of simulated audio are documented.

### Outcome

Phase 7 closed on 2026-07-26. Evidence: `PHASE_7_REVIEW.md`. An early visual slice of Phase 8 was advanced to demonstrate the engine from the browser without yet completing the full PWA.

## Phase 8 - Closed

### Objective

Deliver FollowRead Reader Web as a responsive, accessible and installable application with library, detail, audible reader, personal areas, settings and reading modes.

### Exit criteria

1. Home, library, search, categories, detail and reader consume the published catalog.
2. Favorites, progress, history and vocabulary work locally without storing PII.
3. Child, adult and learning modes apply coherent preferences.
4. Device voice integrates without an API key and degrades to visual tracking.
5. Manifest, icon and service worker make the shell installable.
6. Navigation, reflow, keyboard, focus, reduced motion and safe areas meet the specification.
7. Vitest and a Chrome headless run cover the critical flows.
8. Documentation, visual review and full gate are green.

### Outcome

Phase 8 closed on 2026-07-26. Evidence: `PHASE_8_REVIEW.md`. Verified content downloads and offline operation remain explicitly in Phase 9.

## Phase 9 - Closed

### Objective

Allow downloading, validating, updating and using content offline, preserving local progress and synchronizing idempotently when the network returns.

### Exit criteria

1. Remote catalog and local packages are merged and compared by version and checksum.
2. Only compatible, complete packages with valid SHA-256 are activated.
3. IndexedDB preserves content, metadata and operations without storing PII.
4. The build includes at least one verifiable story for first offline start.
5. Downloads, updates, deletion, quota and recovery have visible states.
6. Library, detail, reading, local voice and progress work without the API.
7. Reconnection syncs idempotent operations without rolling back progress.
8. Unit tests, API and real Chrome demonstrate corruption, offline and reconnection.

### Outcome

Phase 9 closed on 2026-07-26. Evidence: `PHASE_9_REVIEW.md`.

## Phase 10 - Closed

### Objective

Convert only FollowRead Reader into Android/iOS apps via Capacitor, preserving web/PWA, offline, accessibility and full separation from Admin.

### Exit criteria

1. Capacitor packages only `apps/reader/dist` with a stable identifier.
2. Android and iOS, icons, light/dark splash and native configuration are versioned.
3. Network and lifecycle use minimal plugins; IndexedDB/`localStorage` persist without permissions.
4. No sensitive permissions nor misleading background audio exist.
5. Safe areas and orientation preserve controls, timing, word and progress.
6. An Android APK is compiled, installed and opens on an API 35 emulator.
7. iOS is synchronized and structurally validated; macOS/Xcode is the publication gate.
8. Doctor, validator, Vitest, E2E, builds and documentation cover operation/publication.

### Outcome

Phase 10 closed on 2026-07-26. Evidence: `PHASE_10_REVIEW.md` and
`../testing/PHASE_10_MOBILE.md`. The physical iOS test cannot be run on Windows and remains mandatory before TestFlight, without blocking Phase 11 development.

## Phase 11 - Closed

### Objective

Implement educational features inside the Reader without removing the student from the story or relying on AI for essential capabilities.

### Exit criteria

1. Visible/hidden editorial translation preserves the reading position.
2. Word and sentence can be repeated respecting marks and speed.
3. Selecting a word shows meaning and contextual bilingual examples.
4. Vocabulary, favorites and history persist locally without PII.
5. States new/learning/mastered, reviews and metrics show private progress.
6. The My Vocabulary screen allows searching, filtering, listening and deleting.
7. Keyboard, focus, languages, Escape, reflow and offline preserve accessibility.
8. Domain, storage, React, real Chrome, mobile and full gate are green.

### Outcome

Phase 11 closed on 2026-07-26. Evidence: `PHASE_11_REVIEW.md`,
`../architecture/LEARNING_MODE.md` and `../testing/PHASE_11_LEARNING.md`. The next phase is
Phase 12 - Quality, security and performance.

## Phase 12 - Closed

### Objective

Harden the entire product for stable use through recovery, private observability, HTTP security, optimization, caching and reproducible audits.

### Exit criteria

1. API and applications handle unexpected failures without exposing details or losing context.
2. JSON logging, request IDs, timing and aggregated metrics allow local diagnosis.
3. Lazy loading, chunks and gzip budgets prevent bundle regressions.
4. Compression, ETag, cache-control and service worker have explicit policies.
5. Eight critical routes pass mobile audit for semantics, labels and reflow.
6. Concurrent load meets p95 under 750 ms with no errors.
7. JavaScript/Python dependencies have no known moderate-or-higher vulnerabilities.
8. Tests, E2E, builds, audits and documentation are green.

### Outcome

Phase 12 closed on 2026-07-26. Evidence: `PHASE_12_REVIEW.md`,
`../architecture/PHASE_12_SECURITY_AUDIT.md`, `../architecture/OBSERVABILITY.md` and
`../testing/PHASE_12_QUALITY.md`. The next phase is Phase 13 - CI/CD and deployment.

## Phase 13 - Under external validation

### Objective

Automate validations, artifacts, containers, releases and secure operation across local, development, staging and production.

### Exit criteria

1. GitHub Actions runs quality, security and image builds.
2. API, Admin and Reader are packaged independently with health and minimal privileges.
3. Migration, backup, restore and rollback have safe commands and documentation.
4. SemVer versioning produces release notes, web builds and immutable OCI images.
5. Secrets and approvals are limited by environment and never enter the repository.
6. Compose brings up the stack, migrates SQLite and passes smoke tests.
7. A real GitHub runner validates CI/release without depending on local state.
8. Staging demonstrates backup, migration, smoke and rollback before production.

### Status

Items 1 through 5 are implemented and pass local/static validation. Items 6 through 8 await Docker, remote GitHub and a provider. Evidence: `PHASE_13_REVIEW.md` and `../deployment/`.
