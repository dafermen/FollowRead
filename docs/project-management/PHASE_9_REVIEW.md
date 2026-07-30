# Phase 9 Review - Sync and Offline

**Date:** 2026-07-26  
**Status:** COMPLETED

## Outcome

Reader can discover, download, verify, update, delete, and read content offline.
The build contains **El zorro y la luna**, so a fresh install preserves an actual reading
without depending on the API. Progress is queued locally and committed when reconnecting.

## Verified criteria

1. API and client compute SHA-256 over the same canonical bytes.
2. IndexedDB holds packages, catalog, and unused operations `localStorage` for content.
3. Local/remote catalog communicates version, availability, and incompatibility.
4. Atomic activation and rollback preserve the last valid package.
5. 100 MB warning, 250 MB limit, and browser quota are enforced before saving.
6. Deleting a download preserves favorites, history, vocabulary, and progress.
7. Library, downloads, reader, bookmarks, and device voice work without network.
8. The sync API acknowledges resends, prevents regression, and does not require PII.
9. Connection and sync states are announced visually and semantically.
10. Real Chrome demonstrates offline, queuing, and reconnection.

## Evidence

- 98 API tests;
- 31 Reader tests with over 90% coverage;
- Chrome test `reader:offline-e2e` in four stages;
- extensive screenshots of Downloads and reader offline;
- `pnpm check` from seeded SQLite.

## Decisions

- SQLite remains the basis of the MVP.
- IndexedDB is the authority for local packages.
- The demo story is part of the build and cannot be removed from the UI.
- A random local UUID identifies sync without collecting name or email.
