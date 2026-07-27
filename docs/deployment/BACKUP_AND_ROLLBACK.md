# Backup, migración y rollback

## Backup SQLite

La API usa la función online de backup de SQLite, ejecuta `PRAGMA integrity_check`, calcula SHA-256
y genera un manifiesto JSON.

```powershell
pnpm deploy:backup -- --output .\var\backups
```

En contenedor:

```bash
docker compose -f infrastructure/docker/compose.yaml run --rm --no-deps api \
  python -m followread_api.cli.database_backup backup --output /data/backups
```

El backup debe copiarse a almacenamiento separado del volumen y probarse en staging. RPO inicial:
24 horas. RTO inicial: 4 horas.

## Migraciones

Compose ejecuta `alembic upgrade head` como servicio de una sola ejecución antes de iniciar API.
Para staging/production:

1. detener cambios editoriales;
2. crear y verificar backup;
3. ejecutar migración con la nueva imagen;
4. confirmar `/ready`, catálogo y smoke tests;
5. reabrir tráfico.

No se ejecuta `alembic downgrade` automáticamente.

## Restauración

Detén la API y conserva una copia fuera del volumen. La restauración exige la palabra `RESTORE`,
valida checksum/integridad y crea un backup `pre-restore` del destino existente.

```powershell
pnpm deploy:restore -- --backup C:\secure\followread-20260726.sqlite3 --confirm RESTORE
```

Restaurar producción requiere aprobación del propietario y evidencia de corrupción o pérdida.

## Rollback de aplicación

```powershell
$env:FOLLOWREAD_DEPLOY_APPROVED = "YES"
node scripts/deploy-compose.mjs `
  --environment production `
  --env-file C:\secure\followread-production.env `
  --rollback v1.2.3
```

El rollback cambia las tres imágenes, conserva el volumen y no revierte esquema. Después:

1. ejecutar `pnpm deploy:smoke` contra las URLs reales;
2. verificar `/metrics` y errores 5xx;
3. confirmar compatibilidad del esquema;
4. registrar versión, causa, impacto y resultado.

