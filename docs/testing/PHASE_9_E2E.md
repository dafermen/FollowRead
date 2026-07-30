# Offline E2E Verification - Phase 9

## Preparation

```powershell
pnpm demo:seed
pnpm dev
pnpm offline:bootstrap
```

## Automated walkthrough

```powershell
pnpm reader:offline-e2e
```

Chrome uses a disposable profile and the DevTools Protocol to:

1. open `/downloads` and check the included story;
2. block the network;
3. navigate to the reader from the cached shell;
4. check text, controls and the `Sin conexión` indicator;
5. start reading and verify a progress operation in IndexedDB;
6. restore the network and wait for confirmation until the queue is emptied.

Screenshots are generated in `var/e2e/phase9-downloads.png` and
`var/e2e/phase9-offline-reader.png`.

## Additional coverage

- valid, tampered and incompatible package;
- local catalog with API down;
- corrupt update with rollback;
- grouped and idempotent operations;
- invalid content and anchoring;
- 100 MB and 250 MB limits;
- canonical API and exact-response checksum.
