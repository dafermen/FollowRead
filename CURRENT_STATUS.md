# Estado actual de FollowRead

**Actualizado:** 2026-07-29
**Fase:** 13 - CI/CD y despliegue  
**Estado:** IN_PROGRESS - implementación terminada, validaciones externas pendientes  
**Base anterior:** `9ce61e5` - cierre de Fase 12
**Implementación de Fase 13:** `f18762b`
**Estructura documental y gate predespliegue:** `6346673`
**Voz OpenAI y seguimiento estable:** `f0777da`
**Caché persistente de audio:** `ecc5c1f`

## Qué está terminado

- Fases 0 a 12 cerradas y documentadas.
- Admin editorial completo: acceso, dashboard, catálogo, editor, recursos, procesamiento, revisión y
  publicación.
- Reader web/PWA/Android/iOS: biblioteca, cuento bilingüe, audio local, sincronización por palabra,
  descargas, offline, progreso, vocabulario y modo aprender inglés.
- API FastAPI con SQLite, migraciones, seguridad, observabilidad, métricas y 107 pruebas.
- Calidad transversal: errores globales, GZip, caching, lazy loading, auditoría de accesibilidad,
  carga, dependencia y regresión.
- Fase 13 implementada localmente: Dockerfiles, Compose, backup/restore, smoke test, CI ampliado,
  releases SemVer/GHCR, release notes y rollback de artefactos.
- Documentación canónica completada con arquitectura, API, desarrollo, pruebas, despliegue,
  operaciones, seguridad, troubleshooting, ADR, contribución, changelog y plantillas GitHub.
- Matriz obligatoria de trece categorías de pruebas previas al despliegue documentada y validable.
- Reader evita reproducir antes de que la línea de tiempo del cuento/idioma activo esté cargada.
- La API dispone de un adaptador OpenAI TTS opcional, alineación de palabra con `whisper-1`,
  publicación segura de MP3 y regeneración idempotente sobre SQLite.
- Reader reproduce el audio editorial cuando existe, mantiene el resaltado siempre hacia delante y
  muestra una mano `☝️` debajo de la palabra activa.
- Admin y Reader documentan online el archivo `apps/api/.env`, `OPENAI_API_KEY`, las voces
  recomendadas y la prohibición de exponer el secreto en variables `VITE_*`.
- SQLite guarda una huella del texto, idioma, voz y modelos para reutilizar el MP3 sin volver a
  llamar al proveedor. Cambios de contenido/configuración o un archivo ausente invalidan la caché.
- Las pruebas administrativas fuerzan el adaptador local simulado y no pueden heredar una clave
  OpenAI desde `.env`.

## Última validación local

- `pnpm docs:validate`: PASS el 2026-07-29.
- `pnpm migrate`: PASS; SQLite quedó en la revisión `20260729_0003`.
- `pnpm check`: PASS el 2026-07-29 con 107 pruebas API, 40 Reader y 14 Admin.
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
7. Generar español/inglés desde Admin y realizar la validación auditiva real. La clave local y el
   proveedor OpenAI ya están configurados; las pruebas automatizadas permanecen aisladas.

## Próxima acción exacta

Reiniciar `pnpm dev`, generar el cuento con `marin`/`cedar` desde Admin y validar
voz/sincronización. Repetir la acción y comprobar en Procesamiento el estado
`Audio reutilizado · sin costo API`. Después continuar las brechas de
`docs/testing/PRE_DEPLOYMENT_TESTS.md` y los gates Docker/GitHub/staging.
No iniciar Fase 14 ni marcar Fase 13 `COMPLETED` antes de cerrar toda la matriz o aprobar
excepciones explícitas.

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
