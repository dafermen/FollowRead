# FollowRead Reader Web Architecture

## Scope

Phase 8 turns the published package of the API and the Phase 7 Reader Engine into an accessible, responsive, and installable web application. Reader remains independent from Admin.

## Layers

1. `readerClient.ts` consumes the public catalog and the versioned packages.
2. `ReaderApp.tsx` presents home, library, detail, and personal areas.
3. `StoryReaderPage.tsx` connects React with the Reader Engine and the browser narration.
4. `readerStorage.ts` validates non-sensitive local preferences.
5. `browserNarrator.ts` adapts Web Speech without sending text to external services.
6. `offlineDomain.ts` validates compatibility, size, and SHA-256.
7. `offlineRepository.ts` persists packages and operations in IndexedDB.
8. `offlineService.ts` merges catalogs, triggers downloads, and synchronizes progress.
9. `pwa.ts`, the manifest and `sw.js` install and cache the shell and local resources.

The Reader Engine remains the single source of ephemeral state. Device voice word events correct position, but never replace the editorial timeline.

## Local persistence

Reader stores only preferences, favorite slugs, progress, history, and vocabulary. It does not store names, emails, child profiles, tokens, or passwords. All values are validated on read and revert to safe defaults if they are corrupted.

## PWA and offline mode

The service worker caches the shell, the bootstrap document, and requested cover images. IndexedDB is the authority for downloaded content: a record only replaces another after validating version, compatibility, limits, and SHA-256. The build includes the four readings of the demo catalog so the first offline start has real and varied content.

The catalog shows remote, downloaded, update, local-only, and incompatible states. A download of 100 MB or more requests confirmation and a package larger than 250 MB is rejected. Local deletion does not touch history, favorites, or progress.

## Synchronization

Each reading keeps at most one pending operation per slug with UUID, version, stable anchor, and position. The API confirms idempotent operations, prevents regressions, and represents the device with a random UUID without a name or email. Only one confirmation removes the local operation.

## Safe degradation

- No device voice: visual tracking continues.
- No API: the library uses the local catalog and allows reading active packages.
- Corrupt or interrupted download: the previous valid version is kept.
- No quota: the package is not activated and the user can delete another download.
- No PWA support: Reader works as a normal web app.
- No valid progress: the story starts from the beginning.
