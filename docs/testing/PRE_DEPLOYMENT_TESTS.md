# Mandatory Pre-deployment Tests

**Gate status:** BLOCKED for external deployment  
**Applies to:** shared development, staging, and production  
**Does not apply to:** `pnpm dev` on a local workstation

## Approval rule

Before deploying, each row must have evidence associated with the same commit and result `PASS`.  
An exception `WAIVED` requires recorded risk, scope, owner, explicit approval, and an expiration date.  
`PARTIAL`, `NOT_IMPLEMENTED`, `BLOCKED`, `FAIL` or absence of evidence block the deployment.

## Current VPS candidate

The local web candidate dated 2026-09-12 now has recorded evidence for all technical
categories in [VPS candidate validation](VPS_CANDIDATE.md). Owner acceptance, repository
protection/workflow execution and public rollout remain pending. No exception is granted.
`PASS_LOCAL` records a measured local result and must be associated with the approved
release commit; it is not authorization to publish. The bounded scope of generated inputs,
selected mutations, contracts and traffic measurements is explicitly recorded there.

## Historical matrix before the VPS preparation

| # | Category | Current evidence or command | Current status | Gap to deploy |
|---:|---|---|---|---|
| 1 | Acceptance | criteria, Admin/Reader walkthroughs and owner review | PARTIAL | record acceptance on the candidate artifact |
| 2 | Unit | `pnpm test` and GitHub run `30558522375` | PASS_CI | repeat for the final candidate commit |
| 3 | Properties and invariants | deterministic Reader Engine cases, checksums and idempotence | PARTIAL | add case generation with Hypothesis or fast-check |
| 4 | Mutation testing | no runner configured | NOT_IMPLEMENTED | define threshold and run mutation on critical domain |
| 5 | Fuzzing | validations and malicious cases written manually | NOT_IMPLEMENTED | fuzz parsers, schemas, packages and API inputs |
| 6 | Integration | pytest with SQLite/Alembic and GitHub run `30558522375` | PASS_CI | repeat against the candidate environment |
| 7 | Contract | OpenAPI, schemas and Reader package validation | PARTIAL | freeze/differentiate OpenAPI and add consumer-provider contracts |
| 8 | End-to-end | `reader:e2e`, offline, mobile, learning and Admin walkthroughs | PASS_LOCAL | run against the candidate environment |
| 9 | Regression | `pnpm quality:regression` | PASS_LOCAL | run against the same commit before deployment |
| 10 | Security | `pnpm security:audit`, auth, permissions, headers and GitHub audit | PASS_CI | review candidate environment secrets |
| 11 | Concurrency and resilience | local load, idempotent sync, offline/reconnect and errors | PARTIAL | test SQLite locking, restarts, timeouts, retries and degradation |
| 12 | Performance and resources | `quality:budget` and `quality:load` | PASS_LOCAL | measure candidate artifact with recorded budgets |
| 13 | Compatibility and deployment | GitHub CI plus API/Admin/Reader image builds | BLOCKED | Compose, staging, rollback and physical iOS |

The external gate remains `BLOCKED` pending candidate acceptance and operational readiness.
The historical gaps below are superseded only by the explicit candidate evidence above.
This conclusion must not be changed to accelerate a delivery.

## Execution order

1. Fix commit, version, environment, test data and owners.
2. Run `pnpm docs:validate`, `pnpm check` and unit tests.
3. Run properties/invariants, mutation testing and fuzzing.
4. Run integration and contracts.
5. Run E2E, regression and security.
6. Run concurrency/resilience and performance/resources.
7. Build containers and mobile/web artifacts.
8. Create and verify backup; apply migration in staging.
9. Run smoke, compatibility and rollback.
10. Record acceptance and approve or reject the deployment.

## Evidence record

```text
Version:
Commit:
Environment:
Date and time zone:
Execution owner:
Artifacts and checksums:

1. Acceptance: PASS | FAIL | WAIVED — evidence:
2. Unit: PASS | FAIL | WAIVED — evidence:
3. Properties and invariants: PASS | FAIL | WAIVED — evidence:
4. Mutation testing: PASS | FAIL | WAIVED — evidence:
5. Fuzzing: PASS | FAIL | WAIVED — evidence:
6. Integration: PASS | FAIL | WAIVED — evidence:
7. Contract: PASS | FAIL | WAIVED — evidence:
8. End-to-end: PASS | FAIL | WAIVED — evidence:
9. Regression: PASS | FAIL | WAIVED — evidence:
10. Security: PASS | FAIL | WAIVED — evidence:
11. Concurrency and resilience: PASS | FAIL | WAIVED — evidence:
12. Performance and resources: PASS | FAIL | WAIVED — evidence:
13. Compatibility and deployment: PASS | FAIL | WAIVED - evidence:

Risks/exceptions:
Overall result: APPROVED | REJECTED
Approver:
```
