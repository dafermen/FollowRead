# Reader Engine Architecture

## Purpose and scope

`@followread/reader-engine` converts a published timeline into a readable state. It does not know
about React, HTML, storage, network, or audio providers. The Reader application decides how to render
that state and how to persist progress.

## Input

The API exposes `GET /catalog/{slug}/reader-package` with:

- active publication and version;
- translations, chapters, and ordered paragraphs;
- main illustration and alternative description;
- optional illustration and alternative text per chapter, falling back to the main one;
- URI, duration, voice, and audio type;
- Speech Marks ordered with time, characters, paragraph, and chapter.

The service rejects incomplete publications to prevent the Reader from attempting to correct invalid
packages.

## State and operations

The engine maintains an immutable observable state with `status`, time, duration, rate, word,
chapter, layout revision, and error. Its operations are:

- `load`, `play`, `pause`, `toggle`, and `tick`;
- `seek`, `skip`, and `repeatActiveWord`;
- `setPlaybackRate` between 0.5× and 2×;
- `changeChapter`;
- `handleViewportChange`, `handleInterruption`, and `handleAudioLoss`;
- `getProgress` for stable positioning and anchors.

The active word is located by binary search over ordered marks, with cost O(log n).
During a gap without a mark no word is highlighted. Reaching total duration changes the
state to `ended`; replaying restarts from zero.

## Web integration

The Reader creates one instance per screen, subscribes to its changes, and uses a 100 ms clock for
the local demonstrator. The active word receives highlighting, a pointing hand, and auto-scroll. Progress
is saved by `slug` and language in `localStorage`; it does not contain identity or sensitive data.
The visible image is resolved from the active chapter and reuses the cover when the chapter-specific field
is null. Offline downloads include all referenced visual resources.

A resize or orientation change increments the layout revision and recenters the word.
Losing focus pauses reading. Loss of an audio source is represented as an error and not
as indefinite silence.

## MVP audio

`pnpm demo:seed` respects the configured provider. With `FOLLOWREAD_POLLY_PROVIDER=fake` it produces
deterministic durations and Speech Marks, allowing demonstration of synchronization without an API
key, AWS, network, or cost; that file is not real audible narration. With
`FOLLOWREAD_POLLY_PROVIDER=openai` it generates audible MP3s and aligned marks, stores their fingerprint in
SQLite, and reuses the files while the text and configuration do not change. The engine preserves
the same contract in both modes.

## Verification

- unit tests of the engine for validation, search, controls, progress, and interruptions;
- API tests for complete package, missing items, and invalid references;
- Reader tests for library, error, controls, language, and recovery;
- TypeScript strict, mypy, Ruff, ESLint, coverage, and builds at the `pnpm check` gate.
