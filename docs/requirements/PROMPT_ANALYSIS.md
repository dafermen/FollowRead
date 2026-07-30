# Master prompt analysis

## Source

- **Document:** `docs/FollowRead Project Prompt.pdf`
- **Document date:** 2026-07-24
- **Pages reviewed:** 37 of 37
- **Status:** Initial normative source for the project

## Mandates that condition all implementation

1. Work progresses in phases and tasks with explicit states.
2. Admin, Reader, and API remain separated.
3. Only Reader is packaged with Capacitor.
4. Reader Engine is kept independent from the UI.
5. Editorial content and resources are updated without a new build.
6. AWS is used only from the backend and its credentials never reach the client.
7. Automated tests do not use real AWS services.
8. Accessibility, offline, security, documentation, and testing are not optional enhancements.
9. No task is completed if criteria, tests, or documentation are missing.
10. Phase 0 must be closed before designing final screens.

## Identified domains

- bilingual editorial management;
- catalog and content versioning;
- processing of text, audio, and Speech Marks;
- synchronized reader;
- child, adult, and learning modes;
- identity, authorization, and auditing;
- download, local storage, and synchronization;
- web apps, PWA, and hybrid mobile apps;
- security, privacy, accessibility, and operations.

## Inconsistencies and gaps

| ID | Topic | Observation | Treatment |
|---|---|---|---|
| PA-001 | Type `document` | Appears in the vision, not in the type catalog | FR-DEC-OPEN-001 |
| PA-002 | Child accounts | There is no consent or guardian model | FR-DEC-OPEN-002 |
| PA-003 | Contextual translation | Source, license, and offline mode are not defined | FR-DEC-OPEN-003 |
| PA-004 | Notes and bookmarks | Required in adult mode without initial entities | FR-ISSUE-003 |
| PA-005 | MVP | The document defines the final product, not the minimal cut | FR-PH00-TASK-004 |
| PA-006 | Measurable goals | "Fast", "stable", and "reasonable" require thresholds | FR-PH00-TASK-006 |
| PA-007 | License | A file is requested, but no license is indicated | FR-DEC-OPEN-004 |

## Working assumptions, not approved

- The MVP will be a demonstrable vertical section, not all roadmap features.
- Editorial content is prepared before publication; Reader never edits content.
- MVP translations will be editorial to work offline and avoid dependence on AI.
- Child usage will minimize personal data until an account model is decided.
- The original prompt proposed PostgreSQL as the authoritative source; FR-DEC-013 replaces it with SQLite for the MVP due to the confirmed operational constraint. S3 will retain large objects.

## Analysis outcome

The project is viable if scope is controlled and child privacy, translation model, content types, and non-functional metrics are resolved. It is not advisable to start coding before those definitions are closed.
