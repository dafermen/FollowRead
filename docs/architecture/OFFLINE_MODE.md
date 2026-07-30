# Offline Mode Architecture

## Content Flow

1. The API serializes the Reader package with canonical order and separators.
2. Publishing and seeding store `sha256:<hex>` about those exact bytes.
3. Reader merges the remote catalog with active IndexedDB records.
4. A download is fully validated before an atomic write.
5. A failed update leaves the previous version intact.

`localStorage` does not contain packages. IndexedDB stores text, marks, metadata, and operations; Cache Storage holds the shell and retrievable covers.

## Visible States

- `remote`: online and downloadable;
- `downloaded`: offline-ready;
- `update_available`: a different version or checksum exists;
- `local_only`: the package remains local even if it disappears from the catalog;
- `incompatible`: requires a newer version of FollowRead;
- `failed`: reserved for a download that needs recovery.

The `/downloads` screen reports count, space, origin included/downloaded, update, and deletion. Shell and reader indicators announce connection and text synchronization.

## Integrity and Storage

- SHA-256 is computed with Web Crypto over the exact UTF-8 text.
- Less than 100 MB: normal download.
- From 100 MB: confirmation before saving.
- More than 250 MB: rejection.
- An estimated insufficient quota also rejects without replacing the active record.

## Progress

Reader groups pending progress by content. `POST /reader/sync` accepts up to 100 operations, validates content and anchoring, confirms replays, and never applies a position earlier than the one recorded. The device local identifier is random and does not contain PII.

## Local Operation

After publishing or modifying the demo story:

```powershell
pnpm demo:seed
pnpm dev
pnpm offline:bootstrap
```

The last command requires the local API to be active and fails if any checksum does not match.
