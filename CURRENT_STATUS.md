# Estado actual de FollowRead

**Actualizado:** 2026-07-30
**Fase:** 13 - CI/CD y despliegue  
**Estado:** IN_PROGRESS - implementación terminada, validaciones externas pendientes  
**Base anterior:** `9ce61e5` - cierre de Fase 12
**Implementación de Fase 13:** `f18762b`
**Estructura documental y gate predespliegue:** `6346673`
**Voz OpenAI y seguimiento estable:** `f0777da`
**Caché persistente de audio:** `ecc5c1f`
**Reparación de audio publicado:** `232b6a0`
**Cambio bilingüe con marcas OpenAI:** `5d68a06`
**Ilustraciones por capítulo:** `010bcae`
**Resaltado estable del Reader:** `6266a14`
**Indicador de lectura claro:** `a9e3f62`
**Catálogo demo completo:** `5fdd785`
**Audio natural del catálogo completo:** `d838334`

## Qué está terminado

- Fases 0 a 12 cerradas y documentadas.
- Admin editorial completo: acceso, dashboard, catálogo, editor, recursos, procesamiento, revisión y
  publicación.
- Reader web/PWA/Android/iOS: biblioteca, cuento bilingüe, audio local, sincronización por palabra,
  descargas, offline, progreso, vocabulario y modo aprender inglés.
- API FastAPI con SQLite, migraciones, seguridad, observabilidad, métricas y 111 pruebas.
- Calidad transversal: errores globales, GZip, caching, lazy loading, auditoría de accesibilidad,
  carga, dependencia y regresión.
- Fase 13 implementada localmente: Dockerfiles, Compose, backup/restore, smoke test, CI ampliado,
  releases SemVer/GHCR, release notes y rollback de artefactos.
- Documentación canónica completada con arquitectura, API, desarrollo, pruebas, despliegue,
  operaciones, seguridad, troubleshooting, ADR, contribución, changelog y plantillas GitHub.
- Matriz obligatoria de trece categorías de pruebas previas al despliegue documentada y validable.
- El repositorio público `dafermen/FollowRead` fue autorizado y el código original se publica bajo
  licencia MIT. `.env`, SQLite, logs, caches y artefactos locales permanecen excluidos.
- Reader evita reproducir antes de que la línea de tiempo del cuento/idioma activo esté cargada.
- La API dispone de un adaptador OpenAI TTS opcional, alineación de palabra con `whisper-1`,
  publicación segura de MP3 y regeneración idempotente sobre SQLite.
- Reader reproduce el audio editorial cuando existe, mantiene el resaltado siempre hacia delante y
  muestra una mano `👆` debajo de la palabra activa.
- Admin y Reader documentan online el archivo `apps/api/.env`, `OPENAI_API_KEY`, las voces
  recomendadas y la prohibición de exponer el secreto en variables `VITE_*`.
- SQLite guarda una huella del texto, idioma, voz y modelos para reutilizar el MP3 sin volver a
  llamar al proveedor. Cambios de contenido/configuración o un archivo ausente invalidan la caché.
- Las pruebas administrativas fuerzan el adaptador local simulado y no pueden heredar una clave
  OpenAI desde `.env`.
- El cuento publicado dispone de narración OpenAI real en español (`marin`) e inglés (`cedar`), con
  MP3 servidos por la API y 73/74 marcas temporales respectivamente.
- La publicación recalcula su checksum después de generar audio y el Reader reemplaza un bootstrap
  incluido obsoleto sin alterar paquetes descargados por el usuario.
- El service worker obtiene el manifiesto offline con prioridad de red y una versión nueva de sus
  cachés para no conservar paquetes editoriales antiguos.
- El cambio ES/EN tolera pequeñas superposiciones de timestamps externos y la API normaliza esas
  marcas antes de publicarlas o reutilizarlas desde caché.
- El paquete Reader admite una ilustración opcional por capítulo; cuando falta, la interfaz
  reutiliza la portada del cuento.
- **El zorro y la luna** incluye una ilustración original adicional para el capítulo 2, disponible
  también en ambos idiomas y en el paquete offline.
- La palabra activa conserva el mismo flujo tipográfico durante la narración y la mano permanece
  superpuesta sin alterar el ancho o alto del renglón.
- El desplazamiento automático sólo centra la lectura cuando la palabra activa queda fuera de la
  ventana visible, evitando movimientos continuos mientras el usuario lee el mismo bloque.
- El catálogo demo contiene cuatro lecturas bilingües publicadas con dos capítulos cada una:
  **El zorro y la luna**, **The River Between Us**, **El jardín secreto** y
  **La casa de los sonidos**.
- Las tres lecturas nuevas tienen portadas originales y el bootstrap offline incluye los cuatro
  paquetes completos.
- `pnpm demo:seed` prepara todo el catálogo idempotentemente. Con OpenAI configurado asegura la
  narración real en español (`marin`) e inglés (`cedar`) y reutiliza los MP3 ya generados.
- Admin muestra las cuatro lecturas como publicadas y permite abrir cada una directamente en
  Reader.

## Última validación local

- `pnpm docs:validate`: PASS el 2026-07-29.
- `pnpm migrate`: PASS; SQLite quedó en la revisión `20260729_0003`.
- `pnpm check`: PASS el 2026-07-29 con 111 pruebas API, 42 Reader y 14 Admin.
- `pnpm reader:e2e`: PASS; Chrome abrió las cuatro lecturas en ES/EN y confirmó la ilustración
  específica del capítulo 2.
- `pnpm quality:regression`: PASS el 2026-07-28 con servicios activos.
- `pnpm deploy:smoke`: PASS contra API, Admin y Reader locales.
- 103 pruebas API, pruebas web, builds, seguridad, accesibilidad, offline, móvil, aprendizaje,
  presupuestos y carga: PASS.
- Admin 5173, Reader 5174 y API 8000 quedaron activos después de la validación.

## Validaciones pendientes

1. Ejecutar `docker build` y `pnpm deploy:local` en una máquina con Docker. Docker no está instalado
   en este equipo.
2. Confirmar la primera ejecución real de `ci.yml` en GitHub y corregir cualquier diferencia del
   runner remoto. `release.yml` se validará al crear el primer tag SemVer autorizado.
3. Elegir proveedor, dominios y almacenamiento de backups antes de development/staging/production.
4. Ejecutar smoke, migración y rollback en staging.
5. Validar iOS físico con macOS/Xcode antes de TestFlight.
6. Completar propiedades/invariantes, mutation testing, fuzzing, contratos formales y pruebas de
   resiliencia; registrar aceptación del artefacto candidato.
7. Confirmar auditivamente en el navegador la calidad y sincronización del MP3 real ya generado.
   La validación técnica HTTP, las marcas temporales y la reutilización con costo cero están
   completadas.

## Próxima acción exacta

Hacer una recarga completa del Reader (`Ctrl+Shift+R`), abrir `/library` y revisar las cuatro
lecturas terminadas. Reproducir al menos una lectura nueva en ES/EN para confirmar auditivamente la
voz y sincronización ya verificadas por pruebas automatizadas.
Después continuar las brechas de `docs/testing/PRE_DEPLOYMENT_TESTS.md` y los gates de
Docker/CI/staging.
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
