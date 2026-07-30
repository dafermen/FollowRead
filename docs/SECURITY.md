# Security

This is the canonical entry for FollowRead security.

## Mandatory rules

- do not store secrets, tokens, certificates, SQLite or real `.env` files in Git;
- do not log read text, vocabulary, tokens or PII;
- do not create personal accounts for minors in the MVP;
- keep authentication, authorization and auditing on the API side;
- use local adapters in tests; do not depend on real AWS;
- audit dependencies before a release;
- treat security findings as blockers until they are resolved or a dated exception is approved.

## Reporting

```powershell
pnpm security:audit
pnpm check
pnpm quality:regression
```

Vulnerability reports must not be submitted in a public issue. Until a formal private channel is defined, they should be communicated directly to the repository owner.

## Detailed sources

- [Security strategy](architecture/SECURITY_STRATEGY.md)
- [Threat model](architecture/THREAT_MODEL.md)
- [Phase 12 audit](architecture/PHASE_12_SECURITY_AUDIT.md)
- [Data policy](requirements/DATA_POLICY.md)
- [Environment variables](development/ENVIRONMENT_VARIABLES.md)
