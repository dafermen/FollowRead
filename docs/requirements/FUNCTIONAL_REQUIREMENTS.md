# Functional Requirements

**Document status:** Validated for Phase 0 - FR-PH00-TASK-005 COMPLETED.  
**Requirement states:** `PROPOSED`, `APPROVED`, `DEFERRED`, `REMOVED`.

`MVP` indicates implementation in the vertical cut. `Contract` indicates the contract must allow it,
but only the necessary variant is implemented first.

## Content and publishing

| ID | Requirement | Priority | MVP | Source | Verification |
|---|---|---|---|---|---|
| FR-CONTENT-001 | The system will support `story`, `article`, `book` and `lesson` | Must | Contract | Prompt §8; FR-DEC-007 | Create/query `story`; validate full enum |
| FR-CONTENT-002 | A content item may have representations in English, Spanish or both | Must | Yes | Prompt §2/8 | Query languages independently |
| FR-CONTENT-003 | Content will have audience and reading level | Must | Yes | Prompt §8 | Validate allowed values |
| FR-CONTENT-004 | Each version will have ID, number, state, dates, checksum, URL and compatibility | Must | Yes | Prompt §7 | Serialize full contract |
| FR-CONTENT-005 | Transitions will follow a validated state machine | Must | Yes | Prompt §13 | Accept valid and reject invalid |
| FR-CONTENT-006 | Every transition will record actor, date and optional comment | Must | Yes | Prompt §13 | Review persisted audit |
| FR-CONTENT-007 | A published correction will create a new version | Must | Yes | Prompt §6/7 | Verify immutability |

## FollowRead Admin

| ID | Requirement | Priority | MVP | Source | Verification |
|---|---|---|---|---|---|
| FR-ADMIN-001 | An authorized administrator will be able to sign in and sign out | Must | Yes | Prompt §3.1/4 | Success, invalid credential and logout |
| FR-ADMIN-002 | An editor will be able to create and edit content, chapters and paragraphs | Must | Yes | Prompt §3.1 | CRUD with validations |
| FR-ADMIN-003 | An editor will be able to associate text and translation per editorial unit | Must | Yes | Prompt §3.1; FR-DEC-008 | Save and retrieve bilingual pair |
| FR-ADMIN-004 | An editor will be able to assign audience, level, categories and voices | Must | Yes | Prompt §3.1/8/12 | Persistence and invalid values |
| FR-ADMIN-005 | An editor will be able to upload cover and illustrations | Should | Yes | Prompt §3.1 | Type, size and error |
| FR-ADMIN-006 | The editor will have draft, autosave and recovery | Must | Yes | Prompt Phase 5 | Simulate exit and recovery |
| FR-ADMIN-007 | An authorized user will be able to request audio processing | Must | Yes | Prompt §3.1/12 | Create traceable job |
| FR-ADMIN-008 | A reviewer will be able to preview text, audio and synchronization | Must | Yes | Prompt §3.1/12 | View equivalent to Reader |
| FR-ADMIN-009 | A publisher will be able to approve, publish, unpublish and archive | Must | Yes | Prompt §3.1/13 | Permissions and transitions |
| FR-ADMIN-010 | An operator will be able to query errors and retry jobs | Must | Yes | Prompt §3.1/12 | Visible error and idempotent retry |
| FR-ADMIN-011 | History will show versions and audited changes | Should | Yes | Prompt §3.1 | Chronological query |

## Audio and processing

| ID | Requirement | Priority | MVP | Source | Verification |
|---|---|---|---|---|---|
| FR-AUDIO-001 | API will process through HTTP-decoupled independent services | Must | Yes | Prompt §12; FR-DEC-004 | Dependency rule |
| FR-AUDIO-002 | The backend will split text respecting provider limits | Must | Yes | Prompt §12 | Length, Unicode and limits |
| FR-AUDIO-003 | The system will generate audio and Speech Marks for the same version | Must | Yes | Prompt §12 | IDs/metadata match |
| FR-AUDIO-004 | The parser will normalize Speech Marks to an internal contract | Must | Yes | Prompt §10/12 | Known fixtures |
| FR-AUDIO-005 | Processing will validate text-marks correspondence | Must | Yes | Prompt §12 | Detect omissions, duplicates and order |
| FR-AUDIO-006 | Partial errors, cancellation and retries will be explicit | Must | Yes | Prompt §12 | Tests by state |
| FR-AUDIO-007 | Admin will see progress and estimated cost | Should | Yes | Prompt Phase 6 | Presentation with fake adapter |

## FollowRead Reader and Reader Engine

| ID | Requirement | Priority | MVP | Source | Verification |
|---|---|---|---|---|---|
| FR-READER-001 | Reader will show library, categories, search and filters | Must | Yes | Prompt §3.2 | Flows with catalog |
| FR-READER-002 | Reader will show details, languages, level and offline availability | Must | Yes | Prompt §3.2 | View per content |
| FR-READER-003 | Reader will play audio of the selected version | Must | Yes | Prompt §2/3.2 | Controls, missing resource and error |
| FR-READER-004 | Reader Engine will compute the active word by time | Must | Yes | Prompt §10 | Time limits |
| FR-READER-005 | The interface will highlight the active word | Must | Yes | Prompt §2/10 | Synchronized component |
| FR-READER-006 | An optional SVG hand will point without covering text | Must | Yes | Prompt §11 | Lines, scroll, resize and reduced motion |
| FR-READER-007 | The user will be able to pause, resume, skip forward, back and repeat | Must | Yes | Prompt §2/10 | Controls and limits |
| FR-READER-008 | The user will be able to change speed | Must | Yes | Prompt §2/9/10 | Range and persistence |
| FR-READER-009 | Reader will save and restore progress | Must | Yes | Prompt §2/10 | Close, resume and failure |
| FR-READER-010 | Reader will offer favorites, history and settings | Should | Yes | Prompt §3.2 | Local/remote persistence |
| FR-READER-011 | Reader will adapt presentation to child or adult mode | Must | Yes | Prompt §9 | Scenarios for both modes |
| FR-READER-012 | Reader will support Spanish, English and learn-English mode | Must | Yes | Prompt §9 | Content and controls per mode |
| FR-READER-013 | Learn-English will allow repeating word and sentence | Must | Yes | Prompt §9.3 | Segment precision |
| FR-READER-014 | Learn-English will allow translation and vocabulary | Should | Yes | Prompt §9.3; FR-DEC-008 | Editorial flow and offline |
| FR-READER-015 | The user will be able to hide the hand, reduce motion and adjust text | Must | Yes | Prompt §9/11/22 | Preferences applied |

## Offline and synchronization

| ID | Requirement | Priority | MVP | Source | Verification |
|---|---|---|---|---|---|
| FR-OFFLINE-001 | Reader will include catalog and initial content in the build | Must | Yes | Prompt §6/7 | First start without network |
| FR-OFFLINE-002 | Reader will query remote catalog and compare versions | Must | Yes | Prompt §7 | New, same and incompatible |
| FR-OFFLINE-003 | Reader will download only new or modified content | Must | Yes | Prompt §7 | Inspection of requests |
| FR-OFFLINE-004 | Reader will validate checksum before activating a download | Must | Yes | Prompt §7 | Valid and corrupt package |
| FR-OFFLINE-005 | A failed update will keep the valid local version | Must | Yes | Prompt §7 | Simulated interruption |
| FR-OFFLINE-006 | Reader will allow removing downloads without deleting remote progress | Should | Yes | Prompt Phase 9 | Deletion flow |
| FR-OFFLINE-007 | Offline changes will synchronize when connection is restored | Must | Yes | Prompt Phase 9 | Idempotent queue and conflict |
| FR-OFFLINE-008 | Reader will report connection, download and sync status | Must | Yes | Prompt §23 | Accessible states |

## API, identity and user data

| ID | Requirement | Priority | MVP | Source | Verification |
|---|---|---|---|---|---|
| FR-API-001 | API will authenticate users and issue secure sessions/tokens | Must | Yes | Prompt §3.3/Phase 4 | API and security |
| FR-API-002 | API will authorize actions by role and permission | Must | Yes | Prompt §3.3/Phase 4 | Permission matrix |
| FR-API-003 | API will publish catalog and compatible packages | Must | Yes | Prompt §6/7 | Contracts and compatibility |
| FR-API-004 | API will store progress, favorites and vocabulary | Must | Yes | Prompt §3.3 | CRUD with ownership |
| FR-API-005 | API will record audit and operational errors | Must | Yes | Prompt §3.3 | Queryable events |
| FR-API-006 | API will expose health checks and OpenAPI | Must | Yes | Prompt Phase 3 | Endpoints and schema |
| FR-API-007 | API will support idempotent synchronization | Must | Yes | Prompt §3.3/Phase 9 | Resend without duplicates |

## Dependencies and decisions

- FR-READER-014 uses editorial content according to FR-DEC-008.
- Child mode complies with FR-DEC-009 and does not create personal accounts for minors.
- Free notes are deferred according to FR-DEC-010.
- Requirements remain `PROPOSED` until the comprehensive review of FR-PH00-TASK-012.

## Validation

- Unique IDs: PASS.
- Every requirement has priority, MVP scope, source and verification: PASS.
- States, versions, integrity, progress and errors are covered: PASS.
- No requirement authorizes frontend calls to AWS: PASS.
