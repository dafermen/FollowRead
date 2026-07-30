# Operations

This is the canonical entry for operating FollowRead after building an artifact.

## Operational controls

- confirm `GET /ready` before sending traffic;
- retain request IDs and structured logs without personal content;
- monitor latency, errors, availability, and storage usage;
- back up SQLite before migrations or version changes;
- verify checksum and integrity of each backup;
- run smoke tests after deploying;
- roll back artifacts without automatically downgrading data;
- document incident, impact, decision, and recovery.

## Local commands

```powershell
pnpm deploy:backup
pnpm deploy:restore
pnpm deploy:smoke
pnpm quality:load
```

`deploy:restore` is destructive and requires explicit confirmation. In staging/production, environment approval and a copy prior to restoration are also required.

## Related runbooks

- [Observability](architecture/OBSERVABILITY.md)
- [Backup and rollback](deployment/BACKUP_AND_ROLLBACK.md)
- [Containers](deployment/CONTAINER_DEPLOYMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Known issues](project-management/KNOWN_ISSUES.md)
