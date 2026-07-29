# Operaciones

Esta es la entrada canónica para operar FollowRead después de construir un artefacto.

## Controles operativos

- confirmar `GET /ready` antes de enviar tráfico;
- conservar request IDs y logs estructurados sin contenido personal;
- vigilar latencia, errores, disponibilidad y uso de almacenamiento;
- respaldar SQLite antes de migraciones o cambios de versión;
- verificar checksum e integridad de cada backup;
- ejecutar smoke tests después de desplegar;
- revertir artefactos sin hacer downgrade automático de datos;
- documentar incidente, impacto, decisión y recuperación.

## Comandos locales

```powershell
pnpm deploy:backup
pnpm deploy:restore
pnpm deploy:smoke
pnpm quality:load
```

`deploy:restore` es destructivo y exige confirmación explícita. En staging/production también se
requiere aprobación de entorno y una copia previa a la restauración.

## Runbooks relacionados

- [Observabilidad](architecture/OBSERVABILITY.md)
- [Backup y rollback](deployment/BACKUP_AND_ROLLBACK.md)
- [Contenedores](deployment/CONTAINER_DEPLOYMENT.md)
- [Solución de problemas](TROUBLESHOOTING.md)
- [Problemas conocidos](project-management/KNOWN_ISSUES.md)
