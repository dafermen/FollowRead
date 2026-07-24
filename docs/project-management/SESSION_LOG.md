# Registro de sesiones

## Sesión 2026-07-24 - Línea base inicial

### Objetivo

Revisar el prompt maestro, crear el sistema de seguimiento y dejar la Fase 0 lista para continuar de
forma controlada.

### Trabajo realizado

- Se verificó que el PDF maestro tiene 37 páginas y no está cifrado.
- Se extrajo el texto completo y se revisaron visualmente páginas representativas, incluida la primera
  ejecución requerida.
- Se confirmó que el proyecto sólo contenía `docs/FollowRead Project Prompt.pdf`.
- Se confirmó que todavía no existe un repositorio Git.
- Se creó la estructura documental inicial de Fase 0.
- Se registraron decisiones obligatorias del prompt, decisiones abiertas, riesgos e inconsistencias.
- Se completó FR-PH00-TASK-001.
- Se dejó FR-PH00-TASK-002 como tarea activa.
- Se copiaron 30 archivos documentales al directorio definitivo sin reemplazar el PDF maestro.

### Comandos y comprobaciones

- Inspección de metadatos del PDF con `pdfinfo`.
- Renderizado de las 37 páginas con `pdftoppm`.
- Extracción de texto con `pypdf`.
- Inventario recursivo de `C:\Projects\FollowRead`.
- Comprobación de existencia de `.git`.
- Validación futura: script documental de enlaces, IDs y estados.

### Pruebas ejecutadas

No se ejecutaron pruebas de aplicación porque todavía no existe código.

Se ejecutó una validación estructural de la documentación:

- 30 archivos Markdown encontrados;
- 19 entregables mínimos presentes y no vacíos;
- 12 tareas de Fase 0 con todos los campos obligatorios;
- estados de tarea dentro del conjunto permitido;
- ausencia de asignaciones aparentes de credenciales AWS;
- resultado final: `PASS`.
- comparación SHA-256 de los 30 archivos entre preparación y destino: `PASS`;
- tamaño del PDF maestro en destino: 183293 bytes, sin cambios.

La primera versión del comprobador produjo un falso negativo porque PowerShell alteró caracteres
acentuados del código de validación y porque la palabra `TODO` aparecía dentro de una regla
explicativa. Se normalizó la comparación a ASCII y se limitó la detección de secretos; no fue
necesario modificar ni degradar la documentación.

### Problemas encontrados

- Inconsistencia entre "document" y la lista de tipos de contenido.
- Falta definición de cuentas infantiles y consentimiento.
- Notas y marcadores adultos no aparecen en las entidades iniciales.
- No existe repositorio Git.

### Decisiones tomadas

Ver FR-DEC-001 a FR-DEC-005 en `DECISIONS.md`.

### Punto exacto de continuación

Continuar en FR-PH00-TASK-002, comenzando por validar los resultados medibles de
`docs/requirements/PRODUCT_VISION.md`. No comenzar Fase 1.

---

## Sesión 2026-07-24 - Validación de visión del producto

### Objetivo

Completar FR-PH00-TASK-002 y dejar iniciada la definición de usuarios de FR-PH00-TASK-003.

### Trabajo realizado

- Se releyeron todos los archivos de gestión obligatorios.
- Se comparó la visión con alcance, requisitos funcionales y no funcionales, historias, criterios y
  trazabilidad.
- Se separaron beneficiarios primarios, usuarios habilitadores y partes interesadas.
- Se definieron ocho resultados de producto identificados y medibles.
- Se aclaró que las metas de usabilidad son hipótesis de piloto.
- Se mantuvieron abiertas las decisiones de cuenta infantil, traducción y MVP.
- Se añadió trazabilidad entre resultados, requisitos, historias y criterios.
- Se completó FR-PH00-TASK-002 y se inició FR-PH00-TASK-003.

### Problemas encontrados

La visión inicial mezclaba segmentos lectores con usuarios editoriales y no tenía indicadores ni
métodos de medición explícitos. No se encontró una contradicción crítica con el alcance o los
requisitos.

### Decisiones tomadas

FR-DEC-006 - Jerarquía de audiencias por relación con el valor.

### Pruebas ejecutadas

Se ejecutó una validación documental cruzada:

- 30 archivos Markdown presentes;
- 12 secciones de tareas con todos los campos obligatorios;
- resumen y detalle de estados sincronizados;
- FR-PH00-TASK-002 en `COMPLETED`;
- FR-PH00-TASK-003 en `IN_PROGRESS`;
- ocho resultados de producto definidos y ocho trazados;
- siete comprobaciones de coherencia de visión en `PASS`;
- FR-AC-011 y FR-DEC-006 presentes;
- resultado final: `PASS`.
- comparación final de los 30 documentos entre preparación y destino: `PASS`.

La primera ejecución del comprobador no reconoció el encabezado acentuado de FR-AC-011. Se repitió
la comparación con normalización Unicode y se confirmó que era un falso negativo del comprobador,
no un defecto del documento.

### Punto exacto de continuación

Continuar FR-PH00-TASK-003 creando perfiles de usuario y distinguiendo explícitamente persona, cuenta,
rol y parte interesada. No decidir cuentas infantiles por implicación y no comenzar Fase 1.

---

## Sesión 2026-07-24 - Cierre de Fase 0 e inicio de Fase 1

### Objetivo

Avanzar de forma sostenida hasta cerrar Fase 0 y comenzar diseño UX/UI sin crear código.

### Tareas completadas

- FR-PH00-TASK-003 a FR-PH00-TASK-012.
- FR-PH01-TASK-001 y FR-PH01-TASK-002.

### Trabajo realizado

- Siete perfiles con contexto, objetivos, barreras, accesibilidad y resultados.
- MVP vertical y límites por componente.
- Decisiones de documentos, traducción editorial, privacidad infantil y notas.
- 55 requisitos funcionales con fuente/verificación y 25 reglas.
- 37 requisitos no funcionales medibles, política de datos y 12 amenazas.
- 20 historias, 12 casos, 23 criterios y trazabilidad completa.
- Validación de arquitectura, accesibilidad, riesgos, pruebas, entornos y rollback.
- Cierre formal de Fase 0 pasando por `READY_FOR_REVIEW`.
- Ocho tareas de Fase 1 preparadas.
- Inventario de 26 pantallas y arquitectura/flujos UX.

### Pruebas ejecutadas

- FR-PH00-TASK-005: 55 requisitos y 25 reglas, PASS.
- FR-PH00-TASK-006: 37 NFR y 12 amenazas, PASS.
- FR-PH00-TASK-007/008: 92/92 requisitos y 25/25 reglas trazados, PASS.
- FR-PH00-TASK-009/011: 4 walkthroughs y 8 riesgos mapeados, PASS.
- Pre-cierre Fase 0: 19 entregables y 9 criterios de salida, PASS.
- FR-PH01-TASK-001: 12 Reader, 14 Admin, 12 casos y 7 perfiles, PASS.
- FR-PH01-TASK-002: 12 casos y 3 diagramas de flujo, PASS.
- Validación final: 40 archivos Markdown y 20 tareas, PASS.
- Comparación de los 40 documentos en destino y PDF maestro intacto, PASS.

Varias primeras ejecuciones de validadores produjeron falsos positivos por caracteres acentuados,
comparación global de secciones o abreviaturas. Se corrigieron para validar la estructura real; no se
ocultaron defectos documentales.

### Decisiones

- FR-DEC-007: documento usa `article`.
- FR-DEC-008: traducciones esenciales editoriales.
- FR-DEC-009: sin cuentas/PII de menores en MVP.
- FR-DEC-010: notas libres después del MVP.

### Problemas conocidos

- FR-ISSUE-001 sigue abierto hasta Fase 2: no existe repositorio Git.
- FR-DEC-OPEN-004 sigue abierta con dueño/fecha: licencia antes de Fase 14.

### Punto exacto de continuación

Continuar FR-PH01-TASK-003 creando wireframes Reader para las 12 pantallas, comenzando por el layout
base y el Lector. No crear componentes React todavía.

---

## Sesión 2026-07-24 - Cierre de Fase 1 y base técnica hasta Docker

### Objetivo

Cerrar Fase 1 e implementar la base verificable de Fase 2 hasta encontrar un bloqueo real.

### Tareas completadas

- FR-PH01-TASK-003 a FR-PH01-TASK-008.
- FR-PH02-TASK-001 a FR-PH02-TASK-006.

### Trabajo realizado

- 12 wireframes Reader, 14 Admin, sistema visual, responsive, accesibilidad, modos y journeys.
- Repositorio Git `main`, monorepo pnpm y seis paquetes TypeScript con límites explícitos.
- Admin y Reader separados con React/Vite, pruebas de humo y builds.
- API FastAPI con configuración tipada y `GET /health`.
- Puerta `pnpm check` con ESLint, Prettier, Ruff, mypy, Vitest, pytest y builds.
- Ejemplos y validación de variables de entorno públicas y privadas.

### Validación

- Fase 1: 12 entregables, 26/26 wireframes y 12/12 casos, PASS.
- Contraste: 18 pares, mínimo 5.47:1 claro y 7.32:1 oscuro, PASS.
- Puerta raíz: formato, lint, tipos, seis pruebas y builds, PASS sin advertencias.
- Admin, Reader, configuración y API: 100% de cobertura base.

### Bloqueo actual

FR-ISSUE-005: Docker no está instalado o no está disponible en `PATH`. FR-PH02-TASK-007 queda
`BLOCKED`; no se simuló la validación de PostgreSQL.

### Punto exacto de continuación

Instalar o iniciar Docker Desktop. Verificar `docker --version` y `docker compose version`; después
crear y validar PostgreSQL local.

---

## Continuación 2026-07-24 - Preparación estática de PostgreSQL

Docker continuó ausente. Sin omitir ese bloqueo, se completó la parte verificable de
FR-PH02-TASK-007:

- imagen oficial `postgres:18.4-alpine3.24` fijada;
- volumen compatible con el cambio de `PGDATA` de PostgreSQL 18;
- puerto limitado a `127.0.0.1`;
- healthcheck con `pg_isready`;
- variables locales y DSN PostgreSQL tipado;
- validador estático incorporado a `pnpm check`;
- FR-DEC-012 registrada.

`pnpm check` pasó completo: validación Compose, formato, lint, tipos, seis pruebas, cobertura base
100% y builds. Permanecen pendientes `docker compose config`, arranque y confirmación `healthy`.

---

## Continuación 2026-07-24 - Auditoría final del bloqueo Docker

Se repitió la comprobación por tercera vez y se inspeccionaron:

- resolución del comando mediante `PATH` y `where`;
- rutas habituales de Docker Desktop y Docker CLI;
- registro de aplicaciones instaladas;
- servicios y procesos de Docker;
- disponibilidad de Podman como runtime alternativo.

Todos los resultados fueron negativos. Las tareas 008 a 011 dependen de PostgreSQL/migraciones o de
la puerta completa que las incluye, por lo que no existe otro avance seguro que respete dependencias.
El proyecto queda detenido hasta instalar/iniciar Docker Desktop.

---

## Reanudación 2026-07-24 - SQLite autorizado para el MVP

El propietario indicó que PostgreSQL no está disponible para el MVP y autorizó SQLite. Se registró
FR-DEC-013, que sustituye FR-DEC-012 para el alcance actual. FR-ISSUE-005 queda resuelto por cambio de
alcance y FR-PH02-TASK-007 vuelve a `IN_PROGRESS`.

PostgreSQL permanece como evolución futura; no es requisito para continuar las fases del MVP.

---

## Continuación 2026-07-24 - SQLite, migraciones, hooks y CI

Se sustituyó la preparación PostgreSQL/Docker por una base SQLite local conforme a FR-DEC-013:

- configuración tipada y resolución reproducible de la ruta de la base;
- conexión SQLAlchemy con claves foráneas activas y sesiones aisladas;
- Alembic con migración base, upgrade/downgrade probado y una sola cabeza;
- scripts de instalación, migración y calidad compatibles con Windows/CI;
- pre-commit verificable que ejecuta `pnpm check:fast` sin modificar archivos;
- workflow de GitHub Actions con permisos mínimos, versiones declaradas y puerta equivalente;
- documentación de instalación, variables, operación y límites de SQLite.

La migración y `pnpm check` pasaron en `C:\Projects\FollowRead`; la API alcanzó 100% de cobertura.
Pytest requirió usar `.pytest-temp/` dentro del checkout porque la carpeta temporal global de
Windows no era accesible en el entorno de validación. FR-PH02-TASK-009 y 010 quedaron completadas.
FR-PH02-TASK-011 pasó a `READY_FOR_REVIEW` para ejecutar la auditoría limpia final.

---

## Continuación 2026-07-24 - Cierre de Fase 2 e inicio de Fase 3

La auditoría final se ejecutó sobre un clon Git limpio del commit `c348ca1`. Se instalaron
dependencias Node/Python, se configuraron hooks, se aplicó Alembic sobre SQLite y `pnpm check` pasó.

El primer clon reveló una discrepancia real de saltos de línea: Git convertía texto a CRLF en
Windows mientras Prettier exige LF. Se corrigió `.gitattributes`, se creó `c348ca1` y un segundo clon
pasó la puerta completa. La evidencia quedó en `PHASE_2_REVIEW.md`.

FR-PH02-TASK-011 quedó `COMPLETED`, la Fase 2 quedó cerrada y se prepararon 12 tareas para la Fase 3.
FR-PH03-TASK-001 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-24 - Modelos de lectura y migración funcional

- Se implementaron ReadingProgress, Favorite, VocabularyWord y DownloadRecord con propiedad,
  versión, anclajes estables e idempotencia.
- Se corrigió la referencia de continuación obsoleta en PROJECT_STATUS.
- La revisión inicial de migración descubrió que AuditLog aún no tenía modelo; se añadió antes de
  aceptar el esquema.
- Alembic `2bf6cf5e1177` materializa el modelo funcional completo sobre la base de Fase 2.
- La prueba de migración aplica, inspecciona tablas/FKs, revierte y vuelve a aplicar una sola cabeza.
- `pnpm check` pasó con 19 pruebas Python y cobertura 100%.

FR-PH03-TASK-006 y 007 quedaron `COMPLETED`; FR-PH03-TASK-008 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-24 - Repositorios y unidad de trabajo

- Se creó un repositorio base tipado que prepara altas, consultas por UUID y eliminaciones sin
  confirmar transacciones.
- Se implementó el catálogo publicado con filtros por idioma, tipo, audiencia, nivel y categoría,
  total independiente de la página y orden estable.
- El detalle carga el árbol editorial completo y excluye borradores, publicaciones inactivas y
  paquetes incompletos.
- `SqlAlchemyUnitOfWork` concentra sesión, commit, rollback y cierre.
- Las pruebas cubren filtros, paginación, detalle/not-found, duplicados, commit, rollback explícito
  y rollback al salir del contexto; la API conserva 100% de cobertura.

FR-PH03-TASK-008 quedó `COMPLETED`; FR-PH03-TASK-009 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-24 - Servicios, validaciones y errores

- Se implementó `CatalogService` mediante un protocolo de lectura desacoplado de SQLAlchemy.
- El servicio valida límite 1..100, desplazamiento no negativo y slugs canónicos.
- Se definieron códigos estables `catalog.invalid_query` y `content.not_found`.
- El manejador global traduce errores de dominio a un contenedor JSON documentado sin exponer
  detalles internos.
- Las pruebas cubren entradas válidas e inválidas, contenido presente/ausente y estados HTTP
  404/422; la API conserva 100% de cobertura.

FR-PH03-TASK-009 quedó `COMPLETED`; FR-PH03-TASK-010 quedó `IN_PROGRESS`.
