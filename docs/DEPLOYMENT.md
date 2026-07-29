# Despliegue

Esta es la entrada canónica para empaquetar, validar y desplegar FollowRead.

## Política

- `pnpm dev` es la ruta normal de desarrollo y no requiere Docker.
- Todo despliegue externo requiere que las trece categorías de `docs/TESTING.md` estén en `PASS` o
  tengan una excepción `WAIVED` aprobada.
- Ningún artefacto puede contener SQLite, `.env`, tokens, certificados o credenciales.
- Las migraciones requieren backup verificado, readiness, smoke test y plan de rollback.
- Production requiere aprobación explícita del propietario.

## Secuencia mínima

1. Identificar commit y versión inmutables.
2. Completar el acta de pruebas previas al despliegue.
3. Construir API, Admin y Reader.
4. Crear y verificar backup.
5. Ejecutar migraciones.
6. Desplegar artefactos.
7. Ejecutar readiness y smoke tests.
8. Registrar resultado y conservar rollback probado.

## Fuentes detalladas

- [Estrategia de despliegue](deployment/DEPLOYMENT_STRATEGY.md)
- [Contenedores](deployment/CONTAINER_DEPLOYMENT.md)
- [Proceso de release](deployment/RELEASE_PROCESS.md)
- [Backup y rollback](deployment/BACKUP_AND_ROLLBACK.md)
- [Releases móviles](deployment/MOBILE_RELEASES.md)
- [Pruebas previas al despliegue](testing/PRE_DEPLOYMENT_TESTS.md)
