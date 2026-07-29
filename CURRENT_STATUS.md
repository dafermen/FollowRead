# Estado actual de FollowRead

**Actualizado:** 2026-07-28
**Fase:** 13 - CI/CD y despliegue  
**Estado:** IN_PROGRESS - implementación terminada, validaciones externas pendientes  
**Base anterior:** `9ce61e5` - cierre de Fase 12
**Implementación de Fase 13:** `f18762b`

## Qué está terminado

- Fases 0 a 12 cerradas y documentadas.
- Admin editorial completo: acceso, dashboard, catálogo, editor, recursos, procesamiento, revisión y
  publicación.
- Reader web/PWA/Android/iOS: biblioteca, cuento bilingüe, audio local, sincronización por palabra,
  descargas, offline, progreso, vocabulario y modo aprender inglés.
- API FastAPI con SQLite, migraciones, seguridad, observabilidad, métricas y 103 pruebas.
- Calidad transversal: errores globales, GZip, caching, lazy loading, auditoría de accesibilidad,
  carga, dependencia y regresión.
- Fase 13 implementada localmente: Dockerfiles, Compose, backup/restore, smoke test, CI ampliado,
  releases SemVer/GHCR, release notes y rollback de artefactos.
- Documentación canónica completada con arquitectura, API, desarrollo, pruebas, despliegue,
  operaciones, seguridad, troubleshooting, ADR, contribución, changelog y plantillas GitHub.
- Matriz obligatoria de trece categorías de pruebas previas al despliegue documentada y validable.
- Reader evita reproducir antes de que la línea de tiempo del cuento/idioma activo esté cargada.

## Última validación local

- `pnpm docs:validate`: PASS el 2026-07-28.
- `pnpm check`: PASS el 2026-07-28.
- `pnpm quality:regression`: PASS el 2026-07-28 con servicios activos.
- `pnpm deploy:smoke`: PASS contra API, Admin y Reader locales.
- 103 pruebas API, pruebas web, builds, seguridad, accesibilidad, offline, móvil, aprendizaje,
  presupuestos y carga: PASS.
- Admin 5173, Reader 5174 y API 8000 quedaron activos después de la validación.

## Validaciones pendientes

1. Ejecutar `docker build` y `pnpm deploy:local` en una máquina con Docker. Docker no está instalado
   en este equipo.
2. Conectar el repositorio a GitHub y ejecutar `ci.yml`/`release.yml`; actualmente no existe remote.
3. Elegir proveedor, dominios y almacenamiento de backups antes de development/staging/production.
4. Ejecutar smoke, migración y rollback en staging.
5. Validar iOS físico con macOS/Xcode antes de TestFlight.
6. Completar propiedades/invariantes, mutation testing, fuzzing, contratos formales y pruebas de
   resiliencia; registrar aceptación del artefacto candidato.

## Próxima acción exacta

Implementar primero las brechas automatizables de
`docs/testing/PRE_DEPLOYMENT_TESTS.md` —propiedades, mutation testing, fuzzing, contratos y
resiliencia—. Después validar Docker, GitHub y staging. No iniciar Fase 14 ni marcar Fase 13
`COMPLETED` antes de cerrar toda la matriz o aprobar excepciones explícitas.

## Comandos útiles

```powershell
pnpm dev
pnpm docs:validate
pnpm check
pnpm quality:regression
pnpm security:audit
pnpm deploy:validate
pnpm deploy:local
pnpm deploy:smoke
```

La fuente detallada está en `docs/project-management/PROJECT_STATUS.md`,
`docs/project-management/NEXT_STEPS.md` y `docs/deployment/`.
