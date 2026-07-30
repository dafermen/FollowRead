# Phase 8 Review - FollowRead Reader Web

**Date:** 2026-07-26  
**Status:** COMPLETED

## Outcome

Reader provides a complete and demonstrable experience: sign-in, library, filters, categories,
detail, bilingual reader, favorites, progress, history, settings, vocabulary and three reading modes.
The browser can narrate with a local voice without an API key and the app includes a manifest, icon,
installation and PWA shell caching.

## Verified criteria

1. Library and search consume exclusively published content.
2. Detail and reader preserve slug, language, chapters and progress.
3. Favorites, history, vocabulary and local settings are validated and do not contain PII.
4. Child, adult and learning share the application and apply different defaults.
5. Audible narration degrades to visual tracking when Web Speech is not available.
6. Wide/compact shell, safe areas, 320 px, reduced motion and visible focus are considered.
7. The PWA caches the shell without prefetching Phase 9 content downloads.
8. Unit, integration, real browser tests, types, lint, build and full gate pass.

## Evidence

- 22 Reader tests with coverage above 90% in storage, narration and PWA.
- headless Chrome run across five public routes and the manifest;
- wide and compact visual review;
- `pnpm check` seeded from SQLite.

## Decisions

- Web Speech is the local audible adapter for the MVP; it does not require OpenAI or AWS.
- The Reader Engine retains temporary authority.
- Offline downloads, checksum and synchronization remain for Phase 9.
