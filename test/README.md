# Test Inventory

FollowRead is a monorepo and keeps unit tests close to the code they validate. This
folder is the cross-cutting index; tests will not be moved just to mimic a generic structure.

| Category | Current location |
|---|---|
| Unit and web components | `apps/*/src/**/*.test.ts(x)` and `packages/*/src/**/*.test.ts` |
| API and integration | `apps/api/tests/` |
| Contracts | OpenAPI, API schemas, package integrity and catalog tests |
| E2E | `scripts/verify-*-e2e.mjs` |
| Regression | `scripts/run-regression.mjs` |
| Security | auth/permissions tests, audits and `docs/architecture/PHASE_12_SECURITY_AUDIT.md` |
| Performance | `scripts/load-test.mjs` and `scripts/verify-quality-budget.mjs` |
| Fixtures | data inside each suite and `apps/reader/public/offline/bootstrap.json` |

Gaps and the status of the thirteen mandatory categories are tracked in
[`docs/testing/PRE_DEPLOYMENT_TESTS.md`](../docs/testing/PRE_DEPLOYMENT_TESTS.md).

If a fixture is shared by multiple applications, it must be created in `test/fixtures/` with
origin, license, expected content and update policy documented.
