# Test strategy

**Status:** Validated for Phase 0 - FR-PH00-TASK-011 COMPLETED.

## Goals

- detect bugs close to the layer that causes them;
- test the Reader Engine deterministically;
- validate contracts between content, audio, and clients;
- demonstrate offline, accessibility, and permissions;
- avoid dependency on and cost of external services in automation.

## Levels

| Level | Scope |
|---|---|
| Unit | Domain, state, parser, checksums, progress, utilities |
| Components | UI, forms, reader, states and accessibility |
| API | Validation, auth, permissions, errors, repositories |
| Integration | Real SQLite, fake storage, contracts and transactions |
| E2E | Publishing, reading, offline, resumption and learning |
| Architecture | Dependency boundaries and absence of AWS/React where not appropriate |
| Security | Malicious inputs, IDOR, sessions, secrets and permissions |
| Performance | Catalog, active word, scrolling, audio and critical endpoints |

## Pyramid and planned tools

- Vitest and React Testing Library for TypeScript/React.
- Pytest for Python API and domain.
- Playwright for web/PWA flows and automatable accessibility.
- Mocks, fixtures and fake adapters for Polly and S3.
- Real SQLite in a temporary file for integration; do not simulate transactions or constraints.
- Queries should remain compatible with portable SQLAlchemy for a future migration to
  PostgreSQL, which will add its own integration matrix when decided.

Final selection will be confirmed in Phase 2; do not add another library without justification.

## Critical cases

- time before, during and after marks;
- exact boundaries and invalid marks;
- line break, resize, orientation and auto-scroll;
- pause, resume, speed and repeat;
- local/remote progress and conflict;
- missing or interrupted audio;
- cut download, invalid checksum and rollback;
- compatible/incompatible update;
- invalid login and insufficient permission;
- invalid transition or publishing;
- keyboard-only navigation, focus and reduced motion.

## Test data

- minimal content in English and Spanish;
- punctuation, contractions, Unicode and long paragraphs;
- compatible, corrupted and incomplete packages;
- known Speech Marks sequences;
- users by role;
- controllable clocks and network.

## Quality gates

A task is not done if:

- a related test fails;
- there is no test for a critical criterion;
- a test is omitted due to instability without a recorded issue;
- it depends on real AWS;
- the execution documentation is not up to date.

Before any external deployment the thirteen-category matrix of
`PRE_DEPLOYMENT_TESTS.md` also applies. A partial or unimplemented row blocks delivery except for a formal,
dated and approved exception.

## Accessibility strategy

Automation will detect semantics, names and some contrasts. Manual validation will cover focus order,
screen reader, zoom, reflow, motion, comprehension and touch targets.

## Risk coverage

| Risk | Primary level | Required evidence |
|---|---|---|
| FR-RISK-001 excessive scope | Acceptance review | Vertical demo and MVP matrix |
| FR-RISK-002 child privacy | Security/E2E | Inventory without PII and local flow |
| FR-RISK-003 misaligned marks | Unit/integration/E2E | Fixtures, boundaries and preview |
| FR-RISK-004 AWS costs | Unit/integration | Estimate/limit with fake adapter |
| FR-RISK-005 damaged download | Integration/E2E | Interruption, checksum and rollback |
| FR-RISK-006 hand/motion | Component/manual/a11y | Lines, zoom, reduced motion |
| FR-RISK-007 stale docs | Documentary validation | IDs, links, states and traceability |
| FR-RISK-008 no Git | Phase 2 | Repository/history before code |

## Change gates

1. Format/lint.
2. Type-check or Python analysis.
3. Affected unit tests.
4. Integration when contract/data changes.
5. Components/accessibility when UI changes.
6. E2E for critical flows.
7. Reproducible build.
8. Documentation and traceability.

## Validation outcome

- Each risk has level and evidence: PASS.
- Real AWS is forbidden in automation: PASS.
- Prompt critical cases are covered: PASS.
- Failure of a gate prevents completing the task: PASS.
