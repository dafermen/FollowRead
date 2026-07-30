# Quality, accessibility, and performance evidence - Phase 12

**Date:** 2026-07-26
**Result:** PASS

## Automation added

| Command | Coverage |
|---|---|
| `pnpm quality:a11y` | semantics, names, labels, language, IDs, landmarks and mobile reflow |
| `pnpm quality:budget` | chunks, gzip, service worker, headers, timing and metrics |
| `pnpm quality:load` | 120 concurrent requests against health and SQLite catalog |
| `pnpm security:audit` | JavaScript and Python vulnerabilities |
| `pnpm quality:regression` | full door, four E2E Reader and the previous audits |

## Measured result

- Admin: entry 12.7 KB, deferred admin area 54.0 KB and React 189.7 KB; all chunks are below 150 KB gzip.
- Reader: entry 65.0 KB, deferred reading room 19.8 KB and React 189.7 KB; all chunks are below 150 KB gzip.
- Final load: 120 requests, concurrency 12, p50 60.9 ms, p95 107.9 ms, max 122.5 ms, zero failures. p95 budget: 750 ms.
- Automated accessibility: eight Admin/Reader routes at 390 × 844 without empty names, unlabeled fields, images missing `alt`, duplicate IDs, missing landmarks or horizontal overflow.
- Dependencies: zero known moderate-or-higher vulnerabilities in JavaScript and zero known vulnerabilities in the Python environment.

## Functional regression

- Admin: 14 tests.
- Reader: 38 tests.
- Reader Engine: 6 tests.
- Configuration: 3 tests.
- API: 101 tests.
- Strict types, lint, format, coverage and production builds green.

Automated auditing reduces regressions, but does not replace testing with assistive technologies nor the required physical iOS validation before TestFlight.
