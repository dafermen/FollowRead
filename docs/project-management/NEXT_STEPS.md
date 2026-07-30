# Next steps

## Next exact task

**FR-PH13-TASK-012 - Validate real Docker, GitHub and staging**

### Objective

Close the external gates that cannot be run at the current workstation and record evidence of a reproducible delivery before closing Phase 13.

### Work order

1. Complete the partial/not implemented rows of `docs/testing/PRE_DEPLOYMENT_TESTS.md`.
2. Obtain a Docker-capable environment; the API, Admin and Reader image builds already pass in CI.
3. Run `pnpm deploy:local` and `pnpm deploy:smoke`.
4. Choose a provider and create a protected development or staging environment.
5. Demonstrate migration, backup, smoke and rollback; record URLs and evidence without secrets.
6. Record acceptance and update `CURRENT_STATUS.md` before deciding to close the phase.

## Do not do yet

- Do not mark Phase 13 completed without running Compose and staging smoke/rollback.
- Do not select or create accounts with a cloud provider without the owner's decision.
- Do not include SQLite, secrets, `.env`, certificates or credentials in artifacts.
- Do not deploy to production or publish to stores without explicit approval.
- Do not skip audits or regressions to speed up a pipeline.
- Do not run production migrations without backup, readiness and rollback.
- Do not interpret `pnpm check` as a substitute for the thirteen pre-deployment categories.

## External gate retained

TASK-011 was completed with `pnpm check`, full regression, audits, tests, builds and local smoke in
green. GitHub Actions run `30558522375` passed the complete quality gate and built all three
containers on commit `faf194d`. TASK-012 still requires a running Compose environment and staging.
Physical validation of iOS on macOS/Xcode remains mandatory before TestFlight. Additionally, the
deployment gate requires closing properties/invariants, mutation testing, fuzzing, contracts and
resilience.
