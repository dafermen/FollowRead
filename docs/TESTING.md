# Tests

This is the canonical entry for FollowRead's testing strategy and quality gates.

## Rule before deploying

Before deploying to shared development, staging, or production, these thirteen categories must be executed and documented:

1. acceptance tests;
2. unit tests;
3. property and invariant tests;
4. mutation testing;
5. fuzzing;
6. integration tests;
7. contract tests;
8. end-to-end tests;
9. regression tests;
10. security tests;
11. concurrency and resilience;
12. performance and resources;
13. compatibility and deployment.

A category may only be `PASS` or `WAIVED`. A `WAIVED` requires risk, justification,
owner, expiry date, and explicit approval. `PARTIAL`, `NOT_IMPLEMENTED`, `BLOCKED` or
missing evidence prevent external deployment.

The matrix with commands, current evidence, gaps, and meeting template is in
[Mandatory tests before deployment](testing/PRE_DEPLOYMENT_TESTS.md).

## Available gates

```powershell
pnpm docs:validate
pnpm check
pnpm quality:regression
pnpm security:audit
pnpm deploy:validate
pnpm deploy:smoke
```

These commands cover a significant portion of the matrix, but do not replace mutation testing,
fuzzing, properties/invariants, formal contracts, or actual validation of containers and
staging while those rows remain incomplete.

## Detailed sources

- [Test strategy](testing/TEST_STRATEGY.md)
- [Gates by phase](testing/QUALITY_GATES.md)
- [Mandatory tests before deployment](testing/PRE_DEPLOYMENT_TESTS.md)
- [Test inventory](../test/README.md)
- [Acceptance criteria](requirements/ACCEPTANCE_CRITERIA.md)
