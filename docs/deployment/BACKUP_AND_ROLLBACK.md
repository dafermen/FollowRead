# Backup, migration and rollback

## SQLite Backup

The API uses SQLite's online backup function, runs `PRAGMA integrity_check`, computes SHA-256 and generates a JSON manifest.

```powershell
pnpm deploy:backup -- --output .\var\backups
```

In container:

```bash
docker compose -f infrastructure/docker/compose.yaml run --rm --no-deps api \
  python -m followread_api.cli.database_backup backup --output /data/backups
```

The backup must be copied to storage separate from the volume and tested in staging. Initial RPO: 24 hours. Initial RTO: 4 hours.

## Migrations

Compose runs `alembic upgrade head` as a one-off service before starting the API. For staging/production:

1. stop editorial changes;
2. create and verify backup;
3. run migration with the new image;
4. confirm `/ready`, catalog and smoke tests;
5. reopen traffic.

`alembic downgrade` is not run automatically.

## Restoration

Stop the API and keep a copy outside the volume. Restoration requires the word `RESTORE`, validates checksum/integrity and creates a backup `pre-restore` of the existing target.

```powershell
pnpm deploy:restore -- --backup C:\secure\followread-20260726.sqlite3 --confirm RESTORE
```

Restoring production requires owner approval and evidence of corruption or loss.

## Application rollback

```powershell
$env:FOLLOWREAD_DEPLOY_APPROVED = "YES"
node scripts/deploy-compose.mjs `
  --environment production `
  --env-file C:\secure\followread-production.env `
  --rollback v1.2.3
```

The rollback changes the three images, preserves the volume, and does not revert the schema. Afterwards:

1. run `pnpm deploy:smoke` against the real URLs;
2. verify `/metrics` and 5xx errors;
3. confirm schema compatibility;
4. record version, cause, impact and outcome.
