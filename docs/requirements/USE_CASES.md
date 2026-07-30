# Use cases

**Status:** Validated for Phase 0 - FR-PH00-TASK-007 COMPLETED.

## FR-UC-001 - Publish bilingual content

- **Primary actor:** Editor / Reviewer / Publisher
- **Preconditions:** Authenticated users; appropriate permissions; content in draft.
- **Trigger:** The editor decides to prepare a release.
- **Main flow:**
  1. The editor structures chapters and paragraphs.
  2. Associates languages, audience, level, categories, and voices.
  3. Requests processing.
  4. API validates, creates a job, and generates audio/marks via services.
  5. The reviewer previews the synchronization.
  6. The reviewer approves.
  7. The publisher publishes an immutable version.
  8. The remote catalog exposes the new version.
- **Alternates:** Failed validation; partial processing; review rejected; insufficient permission.
- **Postcondition:** There exists an audited published version or the state retains an explanation.
- **Stories:** FR-US-ADMIN-001, 003, 004, 005, 006.

## FR-UC-002 - Play synchronized reading

- **Primary actor:** Reader
- **Preconditions:** Valid content, audio, and Speech Marks available.
- **Trigger:** The reader selects play.
- **Main flow:**
  1. Reader loads the version and progress.
  2. Reader Engine starts audio.
  3. Each time update resolves an active word.
  4. The UI highlights the word and positions the hand if enabled.
  5. Text scrolls only when the word leaves the safe area.
  6. Progress is saved periodically and on relevant events.
- **Alternates:** Missing audio; invalid marks; resize; orientation; pause; interruption.
- **Postcondition:** Reading continues or shows a recoverable error without losing progress.
- **Stories:** FR-US-READER-001, 002, 003, 005.

## FR-UC-003 - Download and read offline

- **Primary actor:** Reader
- **Preconditions:** Connection available for download; sufficient storage.
- **Trigger:** The reader chooses to download.
- **Main flow:**
  1. Reader obtains metadata and compatibility.
  2. Downloads to a temporary area.
  3. Verifies checksum and required content.
  4. Activates the package atomically.
  5. Offline, opens text, images, audio, and local marks.
  6. Saves local changes for later synchronization.
- **Alternates:** Interrupted network; invalid checksum; incompatible version; insufficient space.
- **Postcondition:** There exists a complete valid package or the previous version is preserved.
- **Stories:** FR-US-READER-004, FR-US-READER-009.

## FR-UC-004 - Update downloaded content

- **Primary actor:** Reader
- **Preconditions:** Local catalog present; backend available.
- **Trigger:** Startup, refresh, or an appropriate scheduled task.
- **Main flow:**
  1. Compares IDs and versions.
  2. Filters incompatible versions.
  3. Downloads only changes.
  4. Validates and activates the new version.
  5. Migrates or anchors progress when possible.
- **Alternates:** Corrupted update; content withdrawn; progress conflict.
- **Postcondition:** Reader retains a valid version and communicates the result.
- **Stories:** FR-US-READER-003, 004, 009.

## FR-UC-005 - Learn English while reading

- **Primary actor:** Student
- **Preconditions:** English content with editorial supports available.
- **Trigger:** Enables learn English mode.
- **Main flow:**
  1. Sees English text and optional translation.
  2. Taps a word to hear it.
  3. Looks up contextual meaning.
  4. Repeats word or sentence and slows down playback.
  5. Saves the word to vocabulary.
- **Alternates:** Translation unavailable; offline; word already saved.
- **Postcondition:** Reading does not lose position and vocabulary is stored locally or synchronized.
- **Stories:** FR-US-READER-007, 008.

## FR-UC-006 - Reject an action without permission

- **Primary actor:** Authenticated user without permission
- **Preconditions:** Valid session with insufficient role.
- **Trigger:** Attempts to approve, publish, or administer.
- **Main flow:**
  1. API evaluates authorization.
  2. Denies without executing side effects.
  3. Logs the appropriate event.
  4. The client presents a safe message.
- **Postcondition:** Data and state remain unchanged.
- **Stories:** FR-US-SECURITY-001.

## FR-UC-007 - Configure an accessible session

- **Primary actor:** Reader or tutor.
- **Preconditions:** Reader available; account not required.
- **Trigger:** Opens settings or prepares a session.
- **Main flow:**
  1. Chooses child/adult/learn English mode.
  2. Adjusts language, size, speed, hand, and motion.
  3. Reader presents a comprehensible preview.
  4. Saves preferences in local profile.
  5. Starts reading with preferences applied.
- **Alternates:** System preferences conflict with animation; local storage not available.
- **Accessibility:** Everything works with keyboard, visible focus, and status announcements.
- **Postcondition:** Reading is usable even if the hand is hidden.
- **Stories:** FR-US-CHILD-001, FR-US-TUTOR-001, FR-US-ADULT-001, FR-US-READER-005.

## FR-UC-008 - Recover an editorial draft

- **Primary actor:** Editor.
- **Preconditions:** Draft started and edit permission.
- **Trigger:** Returns after closure, crash, or loss of network.
- **Main flow:**
  1. Admin detects recoverable local or remote changes.
  2. Informs which version and time will be recovered.
  3. The editor accepts or compares when a conflict exists.
  4. Admin restores and reindicates saved state.
- **Alternates:** Corrupt draft; expired session; edited by another user.
- **Postcondition:** A newer version is not silently overwritten.
- **Stories:** FR-US-ADMIN-002.

## FR-UC-009 - Resolve pending progress

- **Primary actor:** Reader.
- **Preconditions:** There is pending local progress and connection returns.
- **Trigger:** Connectivity event or manual synchronization.
- **Main flow:**
  1. Reader sends operation with an idempotent ID.
  2. API validates ownership and version.
  3. Applies anchoring policy without silently rolling back.
  4. Confirms and Reader removes only the confirmed operation.
- **Alternates:** Token expired; version withdrawn; conflict; resend.
- **Postcondition:** The user sees synchronized or explainably pending state.
- **Stories:** FR-US-READER-003, FR-US-READER-009.

## FR-UC-010 - Operate a failed job

- **Primary actor:** Operator.
- **Preconditions:** Job in `processing_failed`.
- **Trigger:** Opens error detail.
- **Main flow:**
  1. Admin shows stage, safe code, correlation ID, and preserved resources.
  2. The operator corrects configuration or requests retry.
  3. API uses an idempotent key and records the action.
  4. The job progresses or fails with new evidence.
- **Alternates:** No permission; cost limit; content changed; provider unavailable.
- **Postcondition:** No silent duplicate publication or cost.
- **Stories:** FR-US-ADMIN-006, FR-US-OPS-001.

## FR-UC-011 - Browse and open content

- **Primary actor:** Reader.
- **Preconditions:** There is a valid local or remote catalog.
- **Trigger:** Opens library.
- **Main flow:**
  1. Reader merges catalogs without duplicating content.
  2. Shows categories, language, level, and availability.
  3. The reader searches or filters.
  4. Opens detail and chooses compatible language/mode.
  5. Starts reading or downloading.
- **Alternates:** No network; empty catalog; incompatible version; content withdrawn.
- **Postcondition:** A valid resource opens or an actionable explanation is provided.
- **Stories:** FR-US-READER-004, FR-US-READER-006.

## FR-UC-012 - Manage personal reading data

- **Primary actor:** Reader.
- **Preconditions:** Local profile or authorized account.
- **Trigger:** Saves favorite/vocabulary, queries history, or deletes a download.
- **Main flow:**
  1. Reader applies change locally immediately.
  2. Records a synchronizable operation when applicable.
  3. Communicates local/pending state.
  4. API confirms idempotently when there is an account and connection.
- **Alternates:** No account; no network; duplicate item; token expired; local deletion.
- **Postcondition:** The data remains local, synchronized, or pending without silent loss.
- **Stories:** FR-US-READER-003, FR-US-READER-007, FR-US-READER-009.

## Documentary walkthrough

| Risk/alternate | Cases | Result |
|---|---|---|
| Offline/corrupt download | FR-UC-003/004/009 | PASS |
| Invalid audio/marks | FR-UC-001/002/010 | PASS |
| Insufficient permission | FR-UC-001/006/010 | PASS |
| Accessibility/preferences | FR-UC-002/007 | PASS |
| Draft/progress loss | FR-UC-008/009 | PASS |
| Child account | FR-UC-007 + FR-DEC-009 | PASS |
| Empty/incompatible catalog | FR-UC-011 | PASS |
| Local/synchronized data | FR-UC-009/012 | PASS
