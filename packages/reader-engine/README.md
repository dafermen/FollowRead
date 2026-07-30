# @followread/reader-engine

Synchronization, active word, and playback control without dependence on React or the DOM.

## Capabilities

- validates duration, ordering, bounds, and relationship between marks and chapters;
- finds the active word using binary search;
- plays, pauses, seeks, skips, repeats, and changes speed or chapter;
- preserves progress via stable position and anchors;
- models resize, orientation, interruption, and audio loss.

```powershell
pnpm --filter @followread/reader-engine test
pnpm --filter @followread/reader-engine build
```

Full integration is described in `docs/architecture/READER_ENGINE.md`.
