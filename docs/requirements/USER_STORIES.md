# User Stories

**Status:** Validated for Phase 0 - FR-PH00-TASK-007 COMPLETED.

## Reader

### FR-US-CHILD-001 - Start a safe reading

As a child reader, I want to start a story with minimal controls and no access to administration so I can focus and avoid accidental actions.

- **Priority:** Must
- **Persona:** FR-PERSONA-001
- **Requirements:** FR-READER-011, FR-READER-015, NFR-PRIVACY-002

### FR-US-TUTOR-001 - Prepare a supervised session

As a tutor, I want to choose mode, language, size, and motion before handing over the device to provide an appropriate experience without creating a child account.

- **Priority:** Should
- **Persona:** FR-PERSONA-004
- **Requirements:** FR-READER-011, FR-READER-015, FR-DEC-009

### FR-US-ADULT-001 - Adapt for a long reading

As an adult reader, I want to use a sober presentation, hide the hand, and adjust text/theme to read during long sessions.

- **Priority:** Must
- **Persona:** FR-PERSONA-003
- **Requirements:** FR-READER-011, FR-READER-015

### FR-US-READER-001 - Follow a narration

As a reader, I want to see which word is being spoken to keep my attention and connect sound with text.

- **Priority:** Must
- **Requirements:** FR-READER-003 to FR-READER-006

### FR-US-READER-002 - Control playback

As a reader, I want to pause, resume, go back, repeat, and change speed to adapt the reading to my pace.

- **Priority:** Must
- **Requirements:** FR-READER-007, FR-READER-008

### FR-US-READER-003 - Resume where I left off

As a reader, I want to recover my position so I don't have to manually search for the last spot.

- **Priority:** Must
- **Requirements:** FR-READER-009, FR-API-004

### FR-US-READER-004 - Read offline

As a reader, I want to download content and open it without a network to read anywhere.

- **Priority:** Must
- **Requirements:** FR-OFFLINE-001 to FR-OFFLINE-005

### FR-US-READER-005 - Adjust the experience

As a reader, I want to hide the hand, reduce motion, and adjust text to read comfortably.

- **Priority:** Must
- **Requirements:** FR-READER-015

### FR-US-READER-006 - Explore the library

As a reader, I want to search and filter content by category, language, and level to find something appropriate.

- **Priority:** Must
- **Requirements:** FR-READER-001, FR-READER-002

### FR-US-READER-007 - Learn a word

As an English learner, I want to tap, listen to, translate, and save a word to study it later.

- **Priority:** Should
- **Requirements:** FR-READER-013, FR-READER-014

### FR-US-READER-008 - Repeat a sentence

As an English learner, I want to repeat a sentence slowly to improve comprehension and pronunciation.

- **Priority:** Must
- **Requirements:** FR-READER-008, FR-READER-013

### FR-US-READER-009 - Know sync status

As a reader, I want to know if my download or progress is pending so I can trust the app.

- **Priority:** Must
- **Requirements:** FR-OFFLINE-007, FR-OFFLINE-008

## Admin

### FR-US-ADMIN-001 - Create bilingual content

As an editor, I want to structure text in English and Spanish to publish a related experience.

- **Priority:** Must
- **Requirements:** FR-ADMIN-002, FR-ADMIN-003

### FR-US-ADMIN-002 - Avoid losing drafts

As an editor, I want autosave and clear indicators so I don't lose work.

- **Priority:** Must
- **Requirements:** FR-ADMIN-006

### FR-US-ADMIN-003 - Process audio

As an editor, I want to select voices and request audio to prepare the content.

- **Priority:** Must
- **Requirements:** FR-ADMIN-004, FR-ADMIN-007, FR-AUDIO-001 to FR-AUDIO-006

### FR-US-ADMIN-004 - Review synchronization

As a reviewer, I want to preview text, audio, and active words to catch errors.

- **Priority:** Must
- **Requirements:** FR-ADMIN-008, FR-AUDIO-005

### FR-US-ADMIN-005 - Publish securely

As a publisher, I want to approve and publish only a valid version to protect readers.

- **Priority:** Must
- **Requirements:** FR-ADMIN-009, FR-CONTENT-005 to FR-CONTENT-007

### FR-US-ADMIN-006 - Recover a failed processing

As an operator, I want to know the error and retry without duplicating content.

- **Priority:** Must
- **Requirements:** FR-ADMIN-010, FR-AUDIO-006

## Operation and security

### FR-US-SECURITY-001 - Manage by permissions

As an owner, I want each role to perform only authorized actions.

- **Priority:** Must
- **Requirements:** FR-API-001, FR-API-002

### FR-US-OPS-001 - Diagnose a failure

As an operator, I want to relate requests, jobs, and errors without exposing sensitive data.

- **Priority:** Must
- **Requirements:** FR-API-005, NFR-OBSERVABILITY-001

## Coverage by persona

| Persona | Main stories | Coverage |
|---|---|---|
| FR-PERSONA-001 | FR-US-CHILD-001, FR-US-READER-001/002/003/004/005 | COVERED |
| FR-PERSONA-002 | FR-US-READER-001/002/003/007/008 | COVERED |
| FR-PERSONA-003 | FR-US-ADULT-001, FR-US-READER-002/003/004/005/006 | COVERED |
| FR-PERSONA-004 | FR-US-TUTOR-001 | COVERED |
| FR-PERSONA-005 | FR-US-ADMIN-001/002/003 | COVERED |
| FR-PERSONA-006 | FR-US-ADMIN-004/005 | COVERED |
| FR-PERSONA-007 | FR-US-ADMIN-006, FR-US-OPS-001, FR-US-SECURITY-001 | COVERED |

## Validation

- Each persona has at least one story: PASS.
- Reading, publishing, offline, learning, accessibility, and permissions are covered: PASS.
- All stories link to requirements or decisions: PASS.
