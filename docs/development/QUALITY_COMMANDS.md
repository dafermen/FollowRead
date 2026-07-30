# Quality Gate

## Main command

```powershell
pnpm check
```

The gate stops at the first error and runs, in order:

1. Documentation structure, links, and pre-deploy matrix.
2. GitHub Actions static validator.
3. Boundary, permissions, and mobile resources validator.
4. Prettier for JS/TS code and configuration.
5. Ruff format for Python.
6. ESLint with strict and typed rules.
7. Ruff lint.
8. TypeScript strict in applications and packages.
9. mypy strict in API and tests.
10. Vitest with coverage for Admin, Reader, and configuration.
11. pytest with SQLite/Alembic, coverage, and warnings treated as errors.
12. builds of all TypeScript applications and packages.

## Partial commands

| Target | Command |
|---|---|
| Documentation | `pnpm docs:validate` |
| Format | `pnpm format:check` |
| Lint | `pnpm lint` |
| Types | `pnpm typecheck` |
| Tests and coverage | `pnpm test` |
| Builds | `pnpm build` |
| Migrate SQLite | `pnpm migrate` |
| Hook quick gate | `pnpm check:fast` |
| Verify hooks | `pnpm hooks:verify` |
| Validate mobile | `pnpm mobile:validate` |
| Diagnose SDKs | `pnpm mobile:doctor` |
| Mobile web E2E | `pnpm reader:mobile-e2e` |
| Learning mode E2E | `pnpm reader:learning-e2e` |
| Android debug APK | `pnpm mobile:build:android` |

`pnpm check` does not by itself represent a deployment authorization. The full matrix of
`docs/testing/PRE_DEPLOYMENT_TESTS.md` also requires properties, mutation testing, fuzzing,
contracts, resilience, and real compatibility.

`scripts/run-python.mjs` selects the virtual environment executable on Windows or Unix-like systems.
If the environment does not exist, it fails with an explicit instruction and does not silently use another Python.
The pre-commit hook runs the quick gate and never modifies files automatically.

`pnpm reader:learning-e2e` opens Chrome and verifies editorial translation, contextual meaning,
examples, saving, favoriting, history, progress, and mobile reflow. Its captures are saved in
`var/e2e/`.

## Base coverage

The Admin, Reader, and API scaffolds intentionally require 100% over the intentionally included base code. The
thresholds will grow with the product and may differentiate critical code, but they will not be lowered to
hide untested lines.
