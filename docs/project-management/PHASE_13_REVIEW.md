# Revisión de Fase 13 - CI/CD y despliegue

**Fecha:** 2026-07-26
**Estado:** READY_FOR_EXTERNAL_VALIDATION

## Resultado implementado

La automatización reproducible está terminada sin elegir proveedor ni introducir Docker como
requisito de desarrollo. API, Admin y Reader tienen imágenes separadas, Compose coordina migración
y salud, CI construye los artefactos y un tag SemVer puede publicar GHCR y GitHub Release.

## Cobertura del prompt maestro

| Actividad | Evidencia | Estado |
|---|---|---|
| GitHub Actions | CI, release y smoke por entorno | IMPLEMENTED |
| lint, type-check, tests, build | `pnpm ci` y workflow base | PASS_LOCAL |
| Docker | tres Dockerfiles y Compose seguro | STATIC_PASS |
| despliegue web/API | imágenes OCI, Nginx, Compose y health checks | IMPLEMENTED |
| migraciones | servicio Alembic previo a API | IMPLEMENTED |
| versionado/release notes | tags SemVer y generador reproducible | IMPLEMENTED |
| rollback | cambio de tag sin downgrade automático de datos | IMPLEMENTED |
| secretos/entornos | ejemplos sin secretos y GitHub Environments | IMPLEMENTED |
| documentación | cuatro guías, README, AGENTS y estado actual | IMPLEMENTED |

## Evidencia local cerrada

- `pnpm check`: validadores de CI/despliegue/móvil, formato, lint, tipos, 103 pruebas API, pruebas
  web y builds completos en verde.
- `pnpm quality:regression`: seguridad, recorridos Reader, offline, móvil, aprendizaje,
  accesibilidad, presupuestos y carga en verde.
- `pnpm deploy:smoke`: API, Admin y Reader locales respondieron correctamente.
- Backup y restore SQLite pasaron dos pruebas dedicadas, incluida integridad y liberación explícita
  de conexiones en Windows.

FR-PH13-TASK-011 queda `COMPLETED`. Esta evidencia no sustituye la ejecución real de contenedores,
workflows remotos ni staging.

## Gates que impiden el cierre

1. Docker no está instalado en la estación actual; falta construir y arrancar las tres imágenes.
2. El repositorio no tiene remote GitHub; los workflows no se han ejecutado en runners reales.
3. No se eligieron proveedor, dominios ni almacén de backups; staging/production no pueden
   desplegarse responsablemente.
4. La matriz predespliegue identifica brechas en aceptación, propiedades/invariantes, mutation
   testing, fuzzing, contratos y resiliencia.

Estos gates pueden revelar defectos de runtime, por lo que la fase no se marca `COMPLETED`.

## Criterio para cerrar

- `docker build` pasa para API/Admin/Reader;
- `pnpm deploy:local` y `pnpm deploy:smoke` pasan;
- `ci.yml` pasa en GitHub;
- un despliegue de development o staging demuestra migración, backup, smoke y rollback;
- `CURRENT_STATUS.md` registra la evidencia y el commit.
- las trece categorías predespliegue están en `PASS` o `WAIVED` explícitamente aprobado.
