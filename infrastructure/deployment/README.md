# Automatización de despliegue

Los archivos `*.example.env` contienen sólo valores públicos o placeholders. Copia el ejemplo del
entorno a un archivo no versionado, configura dominios y ejecuta `scripts/deploy-compose.mjs`.

`local` puede levantarse directamente con `pnpm deploy:local`. `staging` y `production` requieren
un archivo explícito y `FOLLOWREAD_DEPLOY_APPROVED=YES`. Un rollback cambia artefactos a un tag
SemVer anterior y nunca revierte la base de datos automáticamente.

Consulta `docs/deployment/CONTAINER_DEPLOYMENT.md`, `RELEASE_PROCESS.md` y
`BACKUP_AND_ROLLBACK.md`.
