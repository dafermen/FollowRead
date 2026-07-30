# English learning mode

**Status:** Implemented and verified in Phase 11

## Purpose

Link sound, spelling, and meaning without taking the learner out of reading.

## Defaults

- English as the primary text with `lang="en"`;
- editorial translation hidden/collapsed initially;
- suggested speed 0.85x, adjustable;
- repeatable word and sentence;
- contextual vocabulary accessible;
- optional hand indicator.

## Word interaction

1. Select word without changing progress.
2. Show contextual panel with pronunciation, translation, and editorial example.
3. Play word audio.
4. Save/remove vocabulary with local/sync state.
5. Close and return focus to the word.

## Sentence repetition

- uses canonical boundaries;
- announces "Repeat sentence";
- respects speed;
- returns to normal playback when the user chooses;
- does not create unexpected loops.

## Progressive density

Play/pause, speed, and repeat are visible. Translation, details, and vocabulary appear in
the contextual panel; this addresses FR-UXF-001 without hiding features.

## Offline and content

- essential translation/meaning is in the package per FR-DEC-008;
- word audio can use included segments;
- if a resource is missing, the text remains available and is explained.

## Accessibility

- languages marked by snippet;
- interactive word operable by keyboard/touch;
- panel returns focus;
- pronunciation is not the only representation;
- do not announce all words during playback.

## Validation

- FR-PERSONA-002 and FR-US-READER-007/008 covered: PASS.
- Translation, repetition, speed, and vocabulary: PASS.
- Favorites, history, meaning, examples, and local progress: PASS.
- Evidence: `../testing/PHASE_11_LEARNING.md`.
