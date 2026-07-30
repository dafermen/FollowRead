# Architecture of the Learn Mode

**Status:** Implemented in Phase 11
**App:** `apps/reader`

## Purpose

The learning mode links word, audio, and meaning without leaving the story. It works on
web, PWA, Android, and iOS because it lives inside the shared Reader and does not use native plugins.

## Editorial source

The essential aids are built from the published bilingual package:

1. `stable_key` links the English paragraph with its Spanish translation.
2. The Speech Marks identify the selected word and its relative position.
3. `learningDomain.ts` obtains the deterministic editorial equivalent.
4. The original and translated paragraph are used as contextual examples.

Repetition does not assume that a paragraph is a single sentence: `sentenceMarksFor` walks the marks until
the previous and next terminal punctuation. The device voice plays only those
marks or the chosen word and preserves the current speed.

Relative alignment is an MVP fallback, not a universal dictionary. If there is no paired paragraph,
the interface reports that the aid is not available. No essential function calls
OpenAI, a machine translator, or an external dictionary.

## Components

| File | Responsibility |
|---|---|
| `learningDomain.ts` | Builds the contextual card, filters vocabulary and summarizes progress |
| `StoryReaderPage.tsx` | Visible/hidden translation, selection, repetition and contextual panel |
| `readerStorage.ts` | Preferences, vocabulary, favorites, history and study states |
| `ReaderApp.tsx` | Vocabulary panel, search, filters, metrics and recent activity |
| `styles.css` | Responsive and accessible presentation shared by web and mobile |

## Local persistence

The MVP preserves only non-sensitive reading decisions:

- `followread-reader-vocabulary-v1`: word, translation, context, favorite, state and reviews;
- `followread-reader-learning-history-v1`: last 100 explored words and query count;
- `followread-reader-preferences-v1`: mode, language, speed and initially visible translation.

Name, email, age or child identity are not stored. Legacy readers are normalized to
safe values when they do not yet contain the Phase 11 fields.

## Progress

Each saved word can be `new`, `learning` or `mastered`. The summary shows:

- unique words explored;
- saved;
- learning;
- mastered;
- favorites;
- progress against a local goal of five explorations.

The metric is a private device aid, not an academic assessment or remote analytics.

## Accessibility

- text and examples include the attribute `lang`;
- words are buttons operable by keyboard and touch;
- the panel uses an accessible name, closes with `Escape` and returns focus to the word;
- favorites and filters expose `aria-pressed`;
- states do not rely on color alone;
- speed, translation and repetition remain available without audio;
- mobile reflow avoids horizontal scrolling.

## Limits and extension

To provide complex linguistic senses, the future editorial contract must publish
revised alignments or glossaries. That extension should remain optional and versioned. The deterministic fallback
must not be replaced by AI as a silent dependency.
