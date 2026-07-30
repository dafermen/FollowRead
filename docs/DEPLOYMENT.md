# Deployment

This is the canonical entry for packaging, validating, and deploying FollowRead.

## Policy

- `pnpm dev` is the normal development path and does not require Docker.
- Any external deployment requires that the thirteen categories in `docs/TESTING.md` are `PASS` or have an approved `WAIVED` exception.
- No artifact may contain SQLite, `.env`, tokens, certificates, or credentials.
- Migrations require verified backup, readiness, smoke test, and rollback plan.
- Production requires explicit owner approval.

## Minimal sequence

1. Identify immutable commit and version.
2. Complete the pre-deployment test minutes.
3. Build API, Admin, and Reader.
4. Create and verify backup.
5. Run migrations.
6. Deploy artifacts.
7. Run readiness and smoke tests.
8. Record result and retain tested rollback.

## Detailed sources

- [Deployment strategy](deployment/DEPLOYMENT_STRATEGY.md)
- [Containers](deployment/CONTAINER_DEPLOYMENT.md)
- [Release process](deployment/RELEASE_PROCESS.md)
- [Backup and rollback](deployment/BACKUP_AND_ROLLBACK.md)
- [Mobile releases](deployment/MOBILE_RELEASES.md)
- [Pre-deployment tests](testing/PRE_DEPLOYMENT_TESTS.md)
