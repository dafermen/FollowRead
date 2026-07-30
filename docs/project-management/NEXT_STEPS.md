# Next steps

## Next exact task

**FR-PH13-TASK-012 - Validate real Docker, GitHub and staging**

### Objective

Close the external gates that cannot be run at the current workstation and record evidence of a reproducible delivery before closing Phase 13.

### Work order

1. Complete the partial/not implemented rows of `docs/testing/PRE_DEPLOYMENT_TESTS.md`.
2. Install or have Docker available and build the API, Admin and Reader images.
3. Run `pnpm deploy:local` and `pnpm deploy:smoke`.
4. After owner approval, update the Python audit setup so the workflow does not retain vulnerable
   `pip 25.0.1`; rerun `ci.yml` in `dafermen/FollowRead` and retain the evidence.
5. Choose a provider and create a protected development or staging environment.
6. Demonstrate migration, backup, smoke and rollback; record URLs and evidence without secrets.
7. Record acceptance and update `CURRENT_STATUS.md` before deciding to close the phase.

## Do not do yet

- Do not mark Phase 13 completed without running real Docker and GitHub.
- Do not select or create accounts with a cloud provider without the owner's decision.
- Do not include SQLite, secrets, `.env`, certificates or credentials in artifacts.
- Do not deploy to production or publish to stores without explicit approval.
- Do not skip audits or regressions to speed up a pipeline.
- Do not run production migrations without backup, readiness and rollback.
- Do not interpret `pnpm check` as a substitute for the thirteen pre-deployment categories.

## External gate retained

TASK-011 was completed with `pnpm check`, full regression, audits, 103 API tests, builds and local
smoke in green. The remote GitHub runner has been exercised: its first run failed only in the Python
dependency audit because its generated environment retained `pip 25.0.1`. TASK-012 still requires
the approved audit correction, a green rerun, Docker and staging. Physical validation of iOS on
macOS/Xcode remains mandatory before TestFlight. Additionally, the deployment gate requires closing
properties/invariants, mutation testing, fuzzing, contracts and resilience.
