# Test Evidence - Phase 11

## Automated coverage

| Layer | Evidence |
|---|---|
| Domain | Contextual alignment, progress and filters in `learningDomain.test.ts` |
| Persistence | Vocabulary, favorites, reviews and history in `readerStorage.test.ts` |
| React Integration | Translation, selection, context, saving, favorite and focus in `App.test.tsx` |
| Real browser | `pnpm reader:learning-e2e` |
| Reader regression | `pnpm --filter @followread/reader test:coverage` |
| Gate end-to-end | `pnpm check` |

## Chrome walkthrough

`scripts/verify-learning-e2e.mjs` checks in a real browser:

1. enable learning mode with English and speed 0.75x;
2. open the published story;
3. show and hide the editorial translation;
4. select `watched` and get `miraba` with both examples;
5. save and mark the word as favorite;
6. confirm vocabulary and history in `localStorage`;
7. open My Vocabulary, apply the Favorites filter and preserve the query;
8. repeat the visual walkthrough at 390 × 844 without horizontal overflow.

Diagnostic screenshots are generated in `var/e2e/` and are not versioned:

- `phase11-learning-reader-desktop.png`;
- `phase11-vocabulary-desktop.png`;
- `phase11-vocabulary-mobile.png`.

## Result

- 9 Reader test files approved.
- 36 Reader tests approved before the final gate.
- The experience works without an AI API.
- Educational information remains available once the package is already downloaded.
