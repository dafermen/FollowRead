# Acceptance Criteria

**Status:** Validated for Phase 0 - FR-PH00-TASK-008 COMPLETED.

## FR-AC-001 - Active word

**Relates to:** FR-READER-004, FR-US-READER-001, FR-UC-002

- Given an ordered list of valid marks, when time enters the interval of a word,
  then the Reader Engine returns that word.
- At an exact boundary, the inclusion rule is deterministic and documented.
- Before the first mark or after the end, no incorrect word is returned.

## FR-AC-002 - Accessible animated hand

**Relates to:** FR-READER-006, FR-READER-015

- The hand is positioned beneath the active word and does not cover the glyph.
- It realigns after scroll, line break, resize, or orientation change.
- When hidden or reduced motion is enabled, it is not animated.

## FR-AC-003 - Progress recovery

**Relates to:** FR-READER-009, FR-US-READER-003

- When closing and reopening the same version, the Reader offers to continue at the last confirmed position.
- A network failure does not remove local progress.
- Repeated synchronization does not duplicate or roll back progress without a visible conflict rule.

## FR-AC-004 - Complete download

**Relates to:** FR-OFFLINE-003 to FR-OFFLINE-005, FR-UC-003

- A valid checksum allows the package to be activated.
- An invalid checksum produces an error and removes or isolates the temporary file.
- If a valid local version exists, it remains available after the failure.

## FR-AC-005 - Valid publishing

**Relates to:** FR-CONTENT-005 to FR-CONTENT-007, FR-UC-001

- Only `approved` may transition to `published`.
- The action requires permission.
- The transition records actor and date.
- A published version is not modified in place.

## FR-AC-006 - Error processing

**Relates to:** FR-AUDIO-005, FR-AUDIO-006, FR-US-ADMIN-006

- A provider error ends in `processing_failed`.
- The error retains a safe code, stage, and correlation ID.
- Retrying does not create duplicate publications.
- Tests use a fake adapter.

## FR-AC-007 - Offline usage

**Relates to:** FR-OFFLINE-001, FR-OFFLINE-007, FR-UC-003

- Without network, the user opens downloaded content, plays audio, and saves progress.
- The interface communicates offline mode without interrupting reading.
- When the network returns, pending changes synchronize idempotently.

## FR-AC-008 - Accessible navigation

**Relates to:** NFR-ACCESSIBILITY-001 to 006

- All critical actions are reachable by keyboard.
- Focus is visible and logical.
- Controls have announceable names and states.
- Reading does not depend solely on color or motion.

## FR-AC-009 - AWS security

**Relates to:** NFR-SECURITY-001, FR-AUDIO-001

- Admin and Reader bundles do not contain credentials or secret variables.
- Only the backend configures the AWS SDK or adapter.
- Secret scanning does not detect real values.

## FR-AC-010 - Version change

**Relates to:** FR-CONTENT-004, FR-OFFLINE-002

- Reader ignores or explains an incompatible version.
- A new version downloads without a rebuild.
- The local catalog only changes after full validation.

## FR-AC-011 - Measurable vision

**Relates to:** FR-OV-001 to FR-OV-008, FR-PH00-TASK-002

- Each vision outcome has an identifier, an indicator, an initial target, and a method.
- Each outcome is related to at least one requirement, story, or verifiable criterion.
- User test goals are identified as pilot hypotheses.
- Deferred decisions are not presented as approved by implication.
- The vision explicitly includes dynamic content, offline continuity, and accessibility.

## FR-AC-012 - Contract and content lifecycle

**Relates to:** FR-CONTENT-001 to 007, FR-BR-001 to 006, FR-BR-014 to 020

- Enums reject unknown values and allow documented values.
- A version contains all required metadata.
- Only permitted transitions change state and every transition is audited.
- A published version is immutable and a correction creates another.
- Only published and compatible content appears in the catalog.

## FR-AC-013 - Editing and draft preservation

**Relates to:** FR-ADMIN-001 to 006

- An authorized editor creates a structured bilingual story and receives field-specific errors.
- Autosave distinguishes saving, saved, pending, and error.
- Closing or losing connection does not silently overwrite a newer version.
- Invalid cover/illustration is rejected without losing the draft.

## FR-AC-014 - Processing, review, and operation

**Relates to:** FR-ADMIN-007 to 011, FR-AUDIO-001 to 007

- Requesting processing creates a traceable and idempotent job.
- Audio, marks, language, and version match.
- Review uses a preview equivalent to the Reader.
- Error, cancellation, and retry retain state and evidence.
- Cost/progress is shown without invoking real AWS in automation.

## FR-AC-015 - Discovery, modes, and preferences

**Relates to:** FR-READER-001, 002, 010, 011, 012, 015

- Library combines local/remote catalog without duplicates.
- Search/filters work with the local catalog and empty state.
- Mode and preferences apply without creating separate apps.
- Hand, size, and motion preferences are preserved locally.
- All critical actions remain available without relying solely on color.

## FR-AC-016 - Playback and learning

**Relates to:** FR-READER-003 to 009, 013, 014

- Missing or invalid audio produces a recoverable state.
- Pause, resume, seek, repeat, and speed respect limits.
- Word/sentence are repeated using canonical segments.
- Editorial translation/vocabulary works offline when included.
- Confirmed progress is recovered after restart.

## FR-AC-017 - Offline synchronization

**Relates to:** FR-OFFLINE-001 to 008, FR-BR-007 to 010, FR-BR-021 to 023

- First launch may open included content without network.
- Only a compatible and intact package is activated.
- Interruption preserves the previous version and pending operation.
- Resubmission does not duplicate changes.
- The interface announces connection, download, and synchronization.

## FR-AC-018 - API, identity, and reader data

**Relates to:** FR-API-001 to 007

- Invalid credentials and insufficient permissions have no effect.
- Catalog does not expose drafts or incompatible objects.
- Ownership is validated for progress, favorites, and vocabulary.
- Health checks and OpenAPI reflect the available contract.
- Repeated synchronization is idempotent.

## FR-AC-019 - Verifiable accessibility

**Relates to:** NFR-ACCESSIBILITY-001 to 006

- Zero critical automated defects in MVP flows.
- Keyboard, focus, names/states, touch, and non-chromatic signals pass review.
- `prefers-reduced-motion` and the OS setting disable non-essential motion.

## FR-AC-020 - Performance, reliability, and availability

**Relates to:** NFR-PERFORMANCE-001 to 005, NFR-RELIABILITY-001 to 003,
NFR-AVAILABILITY-001 to 002

- Benchmarks meet the documented thresholds in the reference environment.
- Network/storage failures do not activate partial data.
- Critical offline flow works without backend.
- Recovery exercise demonstrates RTO/RPO or records deviation before production.

## FR-AC-021 - Security and privacy

**Relates to:** NFR-SECURITY-001 to 007, NFR-PRIVACY-001 to 003

- Scanning does not find real secrets.
- Inputs, permissions, sessions, CORS, and audit pass positive/negative cases.
- Inventory covers all persisted fields.
- MVP does not include PII or identifiable analytics of minors.

## FR-AC-022 - Maintainability and compatibility

**Relates to:** NFR-MAINTAINABILITY-001 to 004, NFR-COMPATIBILITY-001 to 002

- Type-check, Python analysis, and architectural rule pass.
- Material dependencies/decisions are recorded.
- Browser/orientation/safe area matrix passes critical flows.

## FR-AC-023 - Operation, cost, storage, and recovery

**Relates to:** NFR-OBSERVABILITY-001/002, NFR-COST-001, NFR-RECOVERY-001,
NFR-STORAGE-001

- Correlation ID links request, job, and error without sensitive data.
- Health checks distinguish liveness and dependencies.
- Cost limit blocks before invoking provider.
- Exceeded package produces warning/rejection according to configuration.
- Rollback is tested in staging before production.

## Coverage

Criteria FR-AC-012 to 023 cover all requirements by range. Criteria FR-AC-001 to 011
maintain additional detail for critical risks. The traceability matrix records the ranges and
the test methods.
