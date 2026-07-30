# Contributing to FollowRead

## Before you start

1. Read `AGENTS.md`, `CURRENT_STATUS.md`, and `docs/project-management/NEXT_STEPS.md`.
2. Confirm the task is within the active phase.
3. Run `pnpm setup` and `pnpm check`.
4. Do not add secrets, personal data, or mandatory external services.

## Changes

- keep tests close to the code when they are unit tests;
- use `test/` as an inventory and for cross-cutting fixtures;
- update canonical documents and the corresponding detailed source;
- record architectural decisions in `docs/adr/` and in the canonical decisions log;
- use descriptive commits and keep the tree clean;
- do not lower coverage or gates to make a delivery pass.

## Validation

Every change must pass:

```powershell
pnpm docs:validate
pnpm check
```

Critical changes must also pass `pnpm quality:regression`. Before any external deployment, the matrix in
[`docs/testing/PRE_DEPLOYMENT_TESTS.md`](docs/testing/PRE_DEPLOYMENT_TESTS.md) applies, with no silent omissions.

## Pull requests

The description must include scope, risk, tests, documentation, migrations, security, and rollback plan. A test exemption requires recorded risk and explicit approval.
