# Quality gates by phase

**Status:** Base approved for planning

| Phase | Minimum gate |
|---:|---|
| 0 | Documentation validation, IDs, traceability and decisions |
| 1 | Wireframes, states, responsiveness and accessibility reviewed |
| 2 | Lint, type-check, baseline tests, build and CI |
| 3 | Migrations, API, integration and OpenAPI |
| 4 | Permissions matrix and security tests |
| 5 | Components/Admin E2E and draft recovery |
| 6 | AWS mocks, parser, errors, cost and idempotency |
| 7 | Unit tests/benchmarks of Reader Engine |
| 8 | E2E Reader/PWA and accessibility audit |
| 9 | E2E offline, corruption and synchronization |
| 10 | Devices, orientation, safe areas and builds |
| 11 | Educational flows and vocabulary |
| 12 | Security, load, regression and observability |
| 13 | Thirteen pre-deploy categories, staging, migration, rollback and smoke tests |
| 14 | Clean installation, links and final documentation review |

A phase is not completed with a red gate. An exception requires explicit issue, risk, decision and
next action.
