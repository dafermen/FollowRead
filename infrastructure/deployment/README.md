# Deployment automation

The files `*.example.env` contain only public values or placeholders. Copy the environment example to an unversioned file, configure domains, and run `scripts/deploy-compose.mjs`.

`local` can be brought up directly with `pnpm deploy:local`. `staging` and `production` require
an explicit file and `FOLLOWREAD_DEPLOY_APPROVED=YES`. A rollback changes artifacts to a previous SemVer tag and never rolls back the database automatically.

See `docs/deployment/CONTAINER_DEPLOYMENT.md`, `RELEASE_PROCESS.md`, and
`BACKUP_AND_ROLLBACK.md`.
