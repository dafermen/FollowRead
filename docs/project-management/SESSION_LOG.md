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

---

## Continuación 2026-07-24 - API pública de catálogo

- Se añadieron schemas tipados para resumen, paginación, traducciones, capítulos y párrafos.
- `GET /catalog` admite filtros por idioma, tipo, audiencia, nivel y categoría.
- `GET /catalog/{slug}` devuelve el árbol editorial publicado o un 404 estable.
- La integración excluye borradores y comprueba 200, 404 y 422.
- Las pruebas detectaron aislamiento de SQLite `:memory:` entre hilos; `StaticPool` lo corrige sin
  alterar bases SQLite de archivo.
- La API pasó 39 pruebas y mantiene 100% de cobertura.

FR-PH03-TASK-010 quedó `COMPLETED`; FR-PH03-TASK-011 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-24 - Observabilidad, readiness y OpenAPI

- Se separó liveness (`/health`) de readiness (`/ready`) con una consulta real a SQLite.
- Cada respuesta incorpora `X-Request-ID`; valores entrantes inválidos se reemplazan.
- Los eventos de solicitud se emiten en JSON sin query, cuerpos ni secretos.
- Fallos inesperados se registran con correlación y devuelven un 500 genérico.
- OpenAPI verifica rutas operativas, catálogo, detalle y schemas 404/503.
- Las pruebas cubren éxito/fallo de SQLite, logs, request ID, 500 seguro y contrato OpenAPI.

FR-PH03-TASK-011 quedó `COMPLETED`; FR-PH03-TASK-012 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-24 - Auditoría de Fase 3

- Una base SQLite desechable se creó desde cero con Alembic.
- Se confirmó una sola cabeza/current: `2bf6cf5e1177`.
- Downgrade a base y segundo upgrade a head pasaron.
- `pnpm check` pasó con 44 pruebas Python, 5 JavaScript, cobertura 100% y todos los builds.
- Los ocho criterios de salida quedaron documentados en `PHASE_3_REVIEW.md`.
- La base desechable se eliminó y no quedaron bloqueadores.

FR-PH03-TASK-012 y la Fase 3 pasaron a `READY_FOR_REVIEW`.

---

## Continuación 2026-07-24 - Cierre de Fase 3

El commit de evidencia `a32c6ca` ejecutó nuevamente el pre-commit completo sin discrepancias. Se
confirmó la transición obligatoria `IN_PROGRESS -> READY_FOR_REVIEW -> COMPLETED`.

FR-PH03-TASK-012 quedó `COMPLETED` y la Fase 3 quedó cerrada. El siguiente paso es preparar y
activar el desglose de Fase 4 antes de implementar autenticación o autorización.

---

## Continuación 2026-07-24 - Preparación de Fase 4

Se contrastó la estrategia con guías actuales de OWASP. FR-DEC-014 selecciona contraseña Argon2id y
sesión opaca revocable en cookie HttpOnly, sin JWT ni almacenamiento web de credenciales. También
fija TTL, CSRF/origen, no-store, bootstrap local y exclusión de recuperación/cuentas infantiles.

Se definieron 10 tareas y ocho criterios de salida. FR-PH04-TASK-001 quedó `COMPLETED`;
FR-PH04-TASK-002 quedó `IN_PROGRESS` para modelar credenciales y sesiones antes de endpoints.

---

## Continuación 2026-07-25 - Persistencia, criptografía y bootstrap de autenticación

- Se añadieron `UserCredential` y `UserSession` con hashes separados, expiración, revocación,
  restricciones e índices, junto con una migración Alembic reversible.
- SQLite normaliza fechas de sesión a UTC al evaluar vigencia.
- Las contraseñas usan Argon2id mediante `pwdlib`; los tokens opacos usan aleatoriedad criptográfica,
  SHA-256 para persistencia y comparación de tiempo constante.
- `pnpm admin:bootstrap` crea el primer superadministrador de forma local, idempotente y sin
  contraseña seed ni contraseña en argumentos.
- La API alcanzó 60 pruebas con 100% de cobertura antes de la verificación integral.

FR-PH04-TASK-002, 003 y 004 quedaron `COMPLETED`; FR-PH04-TASK-005 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Sesión HTTP y controles del navegador

- Se expusieron `POST /auth/login`, `GET /auth/session` y `POST /auth/logout`.
- Los errores de login no distinguen cuenta inexistente, deshabilitada o contraseña incorrecta.
- La sesión renueva inactividad sin superar ocho horas y logout es revocable e idempotente.
- La cookie de sesión es host-only, HttpOnly y Strict; producción añade Secure.
- Logout exige origen permitido y token CSRF verificado contra cookie y hash de servidor.
- CORS acepta credenciales únicamente desde Admin/Reader configurados y `/auth` nunca se cachea.
- La suite de API alcanzó 73 pruebas Python con 100% de cobertura antes de la puerta integral.

FR-PH04-TASK-005 y 006 quedaron `COMPLETED`; FR-PH04-TASK-007 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Autorización RBAC

- Se definieron cuatro roles y ocho permisos estables con sincronización idempotente.
- El bootstrap asigna todos los permisos MVP a `super_admin`.
- Las dependencias HTTP resuelven una sesión activa y exigen un permiso explícito.
- `/admin/access` valida el ingreso al Admin mediante `admin.access`.
- Cuentas sin permiso, inactivas, revocadas o sin sesión quedan rechazadas.
- La suite alcanzó 77 pruebas Python con cobertura 100% antes de la puerta integral.

FR-PH04-TASK-007 quedó `COMPLETED`; FR-PH04-TASK-008 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Límite de login y auditoría

- Cinco fallos en 15 minutos bloquean la credencial durante 15 minutos.
- La ventana se reinicia al vencer y el éxito limpia contadores/bloqueo.
- Login y logout generan `AuditLog` con resultado y correlation ID.
- La auditoría no contiene contraseña, token, correo solicitado ni cuerpo HTTP.
- Cuentas inexistentes conservan el mismo contrato externo y evidencia minimizada.
- La suite alcanzó 79 pruebas Python con cobertura 100%.

FR-PH04-TASK-008 quedó `COMPLETED`; FR-PH04-TASK-009 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Auditoría y cierre de Fase 4

- SQLite desechable pasó upgrade, downgrade a base y segundo upgrade hasta `20260725_0002`.
- `pnpm check` pasó con 79 pruebas Python, 5 web, cobertura 100% y todos los builds.
- Los ocho criterios quedaron en PASS en `PHASE_4_REVIEW.md`.
- FR-PH04-TASK-009 y 010 transitaron por `READY_FOR_REVIEW` antes de `COMPLETED`.

FR-PH04-TASK-009, FR-PH04-TASK-010 y la Fase 4 quedaron `COMPLETED`. El siguiente paso es preparar
el desglose de Fase 5.

---

## Continuación 2026-07-25 - Inicio visual de Fase 5

- Se descompuso Fase 5 en 12 tareas verificables y se activó el flujo de acceso.
- Se reemplazó la tarjeta provisional por un shell administrativo responsive.
- Dashboard y Contenidos muestran una vista previa identificada con datos editoriales de ejemplo.
- Login consume `/auth/login` y presenta estados de envío, credencial inválida, límite e indisponibilidad.
- La documentación integrada se adaptó al nuevo sistema visual sin perder instalación de pnpm.
- Admin pasó siete pruebas, cobertura configurada al 100%, typecheck y build de producción.

FR-PH05-TASK-001 y 002 quedaron `COMPLETED`; FR-PH05-TASK-003 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Sesión completa de Admin

- Admin restaura la sesión desde `/auth/session` y conserva identidad y permisos sólo en memoria.
- El cierre de sesión envía el token CSRF de la cookie y vuelve al acceso protegido.
- La navegación oculta áreas sin permiso, mientras la API mantiene la autorización definitiva.
- Una sesión válida muestra la identidad real; desarrollo conserva la vista previa si no hay cuenta.
- Ocho pruebas web cubren rutas, login, restauración, permiso parcial y logout con cobertura 100%.

FR-PH05-TASK-003 quedó `COMPLETED`; FR-PH05-TASK-004 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Dashboard editorial conectado

- Se añadió un resumen administrativo protegido por `admin.access`.
- La API calcula métricas, prioridades, contenido reciente y actividad desde SQLite.
- El Dashboard autenticado consume datos reales y presenta estados de carga, vacío y error.
- La vista previa de desarrollo sigue identificada y separada de la información real.
- Los permisos de navegación se alinearon con los permisos efectivos de la API.
- La puerta integral pasó con 81 pruebas Python, ocho pruebas web y cobertura configurada en 100%.

FR-PH05-TASK-004 quedó `COMPLETED`; FR-PH05-TASK-005 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Catálogo editorial conectado

- Se añadió una lista administrativa protegida con búsqueda, estado, tipo, orden y paginación.
- Cada resultado usa la versión editorial más reciente y muestra título, audiencia e idiomas.
- La API calcula acciones visibles de edición, procesamiento, revisión y publicación por permiso.
- La pantalla conserva datos de demostración interactivos cuando no existe una sesión local.
- Se incorporaron estados de carga, error y catálogo vacío en composiciones desktop y compactas.
- La puerta pasó con 83 pruebas Python, nueve pruebas web, cobertura 100% y todos los builds.

FR-PH05-TASK-005 quedó `COMPLETED`; FR-PH05-TASK-006 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Creación visual de borradores

- Se añadió una pantalla responsive de creación con título, slug automático, tipo y audiencia.
- El formulario incluye nivel lector, uno o dos idiomas y categorías editoriales.
- `POST /admin/content` exige `content.create`, origen permitido, cookie de sesión y token CSRF.
- SQLite crea o reutiliza niveles y categorías, registra la versión 1 en borrador y deja auditoría.
- La vista previa simula el resultado para demostraciones sin cuenta; la sesión real persiste datos.
- La puerta pasó con 85 pruebas Python, diez pruebas web, cobertura 100% y todos los builds.

FR-PH05-TASK-006 quedó `COMPLETED`; FR-PH05-TASK-007 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Editor estructural y recuperación

- Se añadió lectura y guardado protegido de documentos editoriales por contenido.
- El editor visual organiza idiomas, capítulos y párrafos y permite reordenar con controles accesibles.
- Los cambios se autoguardan, muestran estado y se conservan localmente hasta confirmar persistencia.
- Una fecha esperada detecta ediciones concurrentes y presenta conflicto recuperable.
- El guardado exige `content.edit`, origen permitido y CSRF, y genera auditoría.
- La puerta pasó con 86 pruebas Python, once pruebas web y cobertura 100%.

FR-PH05-TASK-007 quedó `COMPLETED`; FR-PH05-TASK-008 quedó `IN_PROGRESS`.

---

## Continuación 2026-07-25 - Cierre visual de Admin y Fase 6

- El editor completó traducciones, selección compatible de voces y carga validada de ilustraciones.
- La pantalla Procesamiento muestra costo, progreso, idioma, voz, diagnóstico, cancelación y reintento.
- La API divide texto, calcula costo, genera audio local y vincula Speech Marks con cada párrafo.
- El límite Amazon Polly quedó desacoplado, configurable y probado con un cliente simulado sin red.
- Revisión y publicación incorporaron checklist, aprobación, rechazo, publicación, despublicación,
  archivo e historial auditado.
- Las composiciones responsive cubren 320 px, etiquetas, alertas, progreso ARIA y movimiento reducido.
- La puerta rápida pasó con 91 pruebas Python, 13 pruebas Admin y cobertura backend de 100%.

FR-PH05-TASK-008 a 012 y FR-PH06-TASK-001 a 010 quedaron `COMPLETED`. Fases 5 y 6 quedaron
cerradas en PASS; el siguiente paso es descomponer la Fase 7.

---

## Continuación 2026-07-26 - Motor de lectura y primer cuento

- Se implementó `@followread/reader-engine` sin React ni DOM, con línea de tiempo validada,
  búsqueda binaria, reproducción, pausa, seek, repetición, velocidad, capítulos y progreso.
- La API expone un paquete de lectura publicado con traducciones, párrafos, ilustración, audio y
  Speech Marks vinculados.
- Se creó **El zorro y la luna**, cuento original bilingüe con dos capítulos e ilustración propia.
- `pnpm demo:seed` crea y publica el cuento idempotentemente en SQLite sin API keys ni servicios.
- Reader adelantó un corte visual de Fase 8 con biblioteca, resaltado, mano, auto-scroll, controles,
  cambio de idioma y recuperación local.
- El audio del MVP simula duración y marcas; la narración audible queda trazada para Fase 8.
- `pnpm check` pasó en el proyecto final con 95 pruebas API, 24 pruebas de aplicaciones y paquetes,
  coberturas redondeadas de 99% y todos los builds.

FR-PH07-TASK-001 a 010 quedaron `COMPLETED`. La Fase 7 quedó cerrada en PASS; el siguiente paso es
descomponer la Fase 8.

---

## Continuación 2026-07-26 - Reader Web y PWA

- Se completaron inicio, biblioteca filtrable, categorías, búsqueda y detalle publicado.
- Favoritos, progreso, historial, preferencias y vocabulario se guardan localmente sin PII.
- Infantil, adulto y aprendizaje comparten componentes con defaults y controles adecuados.
- Web Speech aporta narración audible local; sin voz disponible continúa el seguimiento visual.
- El modo aprendizaje alinea palabras editoriales entre español e inglés y permite repetir/guardar.
- Manifest, icono y service worker hacen instalable el shell sin adelantar las descargas de Fase 9.
- Navegación amplia/compacta, safe areas, 320 px, foco y reduced motion quedaron implementados.
- Se añadieron 22 pruebas Reader y un recorrido Chrome headless contra API/Reader reales.

FR-PH08-TASK-001 a 012 quedaron `COMPLETED`. La Fase 8 quedó cerrada en PASS; el siguiente paso es
descomponer la Fase 9.

---

## Continuación 2026-07-26 - Descargas, offline y sincronización

- La API entrega JSON canónico y persiste su SHA-256 exacto al publicar o sembrar.
- Reader combina catálogo remoto e IndexedDB con estados de descarga y actualización.
- **El zorro y la luna** forma parte del build como paquete offline inicial verificable.
- Descarga y actualización validan compatibilidad, integridad, 100 MB, 250 MB y cuota.
- La pantalla Descargas permite leer, actualizar y eliminar sin borrar progreso.
- Biblioteca, detalle, lector, voz local y marcas operan cuando la API no está disponible.
- El progreso se agrupa por contenido y `POST /reader/sync` confirma operaciones idempotentes.
- Chrome verificó contenido incluido, red bloqueada, cola local y sincronización al reconectar.
- La puerta final pasó con 98 pruebas API y 31 pruebas Reader.

FR-PH09-TASK-001 a 011 quedaron `COMPLETED`. La Fase 9 quedó cerrada en PASS; el siguiente paso es
descomponer la Fase 10.

---

## Continuación 2026-07-26 - Capacitor, Android e iOS

- Se fijó Capacitor 8.4.2 y `com.followread.reader` con `apps/reader/dist` como única fuente.
- Android API 24/36 e iOS 15/SPM quedaron generados, sincronizados y versionados bajo Reader.
- Iconos adaptativos y splash claro/oscuro se generaron desde fuentes 1024/2732 verificadas.
- Network y App integran conexión, reconexión, pausa en segundo plano y restauración de layout.
- IndexedDB y `localStorage` conservan offline/progreso sin permisos de archivos ni PII.
- Android sólo usa Internet/estado de red; iOS no pide permisos sensibles.
- No se activó audio en segundo plano porque Web Speech no garantiza reproducción continua.
- Safe areas y orientación pasaron en Chrome 390×844 y 844×390 conservando progreso.
- El APK debug compiló, se instaló y abrió en un emulador Android API 35; la actividad sobrevivió
  rotación.
- El proyecto iOS pasó sync/auditoría; build y dispositivo quedan como gate de macOS/Xcode antes de
  TestFlight.
- Se añadieron doctor, validador, E2E, guías de build/publicación y troubleshooting Android/iOS.
- La puerta final pasó con 98 pruebas API y 33 pruebas Reader.

FR-PH10-TASK-001 a 012 quedaron `COMPLETED`. La Fase 10 quedó cerrada en PASS; el siguiente paso es
descomponer la Fase 11.

---

## Continuación 2026-07-26 - Modo aprender inglés

- Se revisó textual y visualmente la página 24 del prompt maestro.
- `learningDomain.ts` construye significado y ejemplos desde el paquete bilingüe editorial.
- El lector muestra una toolbar educativa y traducción por párrafo visible u oculta.
- El panel contextual permite repetir palabra/oración, guardar, marcar favorita y cambiar estado.
- Vocabulario conserva contexto, favorito, nueva/aprendiendo/dominada, repasos e historial.
- Mi vocabulario se rediseñó con meta, métricas, búsqueda, filtros, tarjetas y actividad reciente.
- No se incorporó IA, diccionario externo, PII ni dependencia de red para funciones esenciales.
- Se añadieron pruebas de dominio/storage/React y `reader:learning-e2e` con capturas desktop/móvil.
- El recorrido Chrome confirmó persistencia, filtro Favoritas y ausencia de overflow a 390 × 844.
- La puerta final pasó con la cobertura y builds completos del monorepo.

FR-PH11-TASK-001 a 012 quedaron `COMPLETED`. La Fase 11 quedó cerrada en PASS; el siguiente paso es
descomponer la Fase 12.

---

## Continuación 2026-07-26 - Calidad, seguridad y rendimiento

- API añadió GZip, ETag/revalidación, políticas de caché y cabeceras defensivas.
- Request IDs, logs JSON y errores seguros ahora alimentan métricas Prometheus agregadas.
- Admin y Reader contienen errores React/globales sin registrar mensajes privados.
- AdminExperience y StoryReaderPage se cargan de forma diferida con presupuestos gzip.
- El service worker separa navegación, assets y contenido mediante tres estrategias de caché.
- La auditoría móvil comprobó ocho rutas críticas a 390 × 844.
- La carga SQLite pasó 120 solicitudes, concurrencia 12 y p95 final 107.9 ms sin fallos.
- La auditoría corrigió avisos transitivos de Capacitor y actualizó el `pip` vulnerable.
- JavaScript quedó con cero vulnerabilidades conocidas moderadas o superiores; Python con cero.
- La regresión quedó automatizada con calidad, seguridad, cuatro E2E y la puerta completa.

FR-PH12-TASK-001 a 010 quedaron `COMPLETED`. La Fase 12 quedó cerrada en PASS; el siguiente paso es
descomponer la Fase 13.

---

## Continuación 2026-07-26 - Automatización y continuidad de Fase 13

- Se verificó visualmente la página 25 del prompt maestro.
- API, Admin y Reader obtuvieron imágenes separadas con versiones base explícitas.
- Compose coordina Alembic, salud, volumen SQLite, filesystem read-only y capacidades mínimas.
- CI añade auditoría, artefactos web y builds de las tres imágenes.
- Tags SemVer preparan GHCR, paquetes web, release notes y GitHub Release.
- GitHub Environments protegen el smoke test de development/staging/production.
- Backup/restore SQLite valida integridad y checksum; rollback conserva datos y no hace downgrade.
- Se documentaron entornos, secretos, releases, migraciones, backup y rollback.
- `AGENTS.md` y `CURRENT_STATUS.md` quedaron como entrada obligatoria para futuras sesiones.
- Docker no está instalado, Git no tiene remote y no existe proveedor; la validación externa queda
  explícita y no se simula.

La puerta local pasó con `pnpm check` y `pnpm quality:regression`: 103 pruebas API, pruebas web,
builds, auditorías de seguridad, accesibilidad, recorridos offline/móvil/aprendizaje, presupuestos y
carga quedaron en verde. El smoke local confirmó API, Admin y Reader. Las pruebas de backup/restore
también verificaron integridad y corrigieron la liberación explícita de conexiones SQLite en
Windows.

FR-PH13-TASK-001 a 011 quedaron `COMPLETED`; TASK-012 permanece `BLOCKED` hasta disponer de Docker,
remote GitHub y staging autorizado.

---

## Continuación 2026-07-28 - Estructura documental y gate predespliegue

- Se añadieron entradas canónicas para arquitectura, API, desarrollo, pruebas, despliegue,
  operaciones, seguridad y troubleshooting sin mover las fuentes detalladas.
- Se añadieron ADR para SQLite y contenedores opcionales, changelog, contribución, aviso
  `UNLICENSED`, estado de licencias de terceros y plantillas GitHub.
- `test/` quedó como inventario transversal; las pruebas unitarias permanecen junto al código.
- Se definieron trece categorías obligatorias antes de desplegar y un acta de evidencia.
- La matriz conserva honestamente como parciales/no implementadas las propiedades, mutación,
  fuzzing, contratos, resiliencia y compatibilidad externa.
- `pnpm docs:validate` comprueba estructura, enlaces y presencia de las trece categorías.
- La primera puerta detectó una carrera intermitente: el lector podía mostrar Reproducir antes de
  cargar su timeline. Se bloqueó la interfaz hasta que el timeline corresponda al cuento, versión e
  idioma activos.
- `pnpm check` y `pnpm quality:regression` pasaron completos después de levantar los tres servicios;
  la regresión cubrió E2E, offline, móvil, aprendizaje, accesibilidad, seguridad, presupuestos y
  carga.

TASK-012 continúa `BLOCKED`; la estructura documental no sustituye las pruebas ni los gates
externos pendientes.

---

## Continuación 2026-07-29 - Voz OpenAI y seguimiento visual

- Se añadió un adaptador TTS OpenAI en la API con voces `marin`, `coral`, `cedar` y `verse`.
- La clave se lee únicamente desde `OPENAI_API_KEY` en `apps/api/.env`; nunca llega al navegador.
- El MP3 se alinea por palabra con `whisper-1`, se publica en `/audio` y puede regenerarse sin
  duplicar assets ni Speech Marks en SQLite.
- Reader reproduce audio editorial real cuando está publicado y conserva Web Speech como fallback.
- Los eventos tardíos o desordenados ya no pueden hacer retroceder el resaltado.
- La flecha se reemplazó por una mano `☝️` situada debajo de la palabra activa.
- Admin, Reader y la documentación canónica explican cómo activar OpenAI y recomiendan
  `marin`/`cedar`.
- `pnpm check` pasó completo: 106 pruebas API, 40 pruebas Reader, 14 pruebas Admin, lint, tipos,
  documentación, seguridad estática y builds en verde.

Queda pendiente la prueba auditiva real porque el repositorio no contiene una clave. El siguiente
paso es crear `apps/api/.env`, generar ambos idiomas desde Admin y validar voz/sincronización.

---

## Continuación 2026-07-29 - Caché persistente para audio de pago

- La API guarda `source_checksum`, una huella SHA-256 del texto, idioma, voz, proveedor y modelos.
- Una nueva solicitud con la misma huella reutiliza el MP3 y sus Speech Marks, termina como
  `cached` y registra costo cero sin llamar al proveedor.
- La caché se invalida cuando cambia el contenido o configuración, o cuando falta el archivo.
- Admin crea una clave de solicitud por acción y muestra
  `Audio reutilizado · sin costo API` cuando corresponde.
- La migración SQLite `20260729_0003` quedó aplicada a la base local.
- La suite administrativa quedó aislada explícitamente con `FakePollyAdapter`, por lo que un
  `.env` real nunca puede convertir una prueba automatizada en una llamada de pago.
- El archivo local y la configuración OpenAI se verificaron sin exponer el secreto.
- `pnpm check` pasó completo con 107 pruebas API, 40 Reader y 14 Admin, además de lint, tipos,
  documentación y builds.

Falta generar el cuento real desde Admin, escucharlo y repetir la acción para validar visualmente el
estado de caché con el servicio activo.

---

## Continuación 2026-07-29 - Reparación del audio publicado

- Se diagnosticó que el Reader prefería un bootstrap offline antiguo que contenía rutas locales del
  adaptador simulado y las marcaba incorrectamente como audio publicado.
- Se generaron los MP3 reales del cuento con OpenAI: español con `marin` e inglés con `cedar`.
- La API sirve ambos archivos como `audio/mpeg`; el paquete contiene 73 marcas en español y 74 en
  inglés.
- Una segunda solicitud por idioma terminó como `cached`, con costo estimado cero y sin otra
  generación de pago.
- El servicio de procesamiento actualiza ahora el checksum de cualquier publicación activa después
  de guardar audio y Speech Marks.
- Reader reemplaza un bootstrap incluido si su checksum cambió, pero conserva cualquier descarga
  explícita del usuario.
- El service worker usa versiones nuevas de caché y obtiene el manifiesto offline con prioridad de
  red.
- `pnpm check` pasó completo con 108 pruebas API, 41 Reader y 14 Admin, además de lint, tipos,
  documentación, seguridad estática y builds.

Sólo queda la confirmación auditiva del usuario después de una recarga completa del Reader. Los
gates externos de Fase 13 (Docker, GitHub y staging) continúan pendientes.

---

## Continuación 2026-07-29 - Cambio ES/EN con timestamps OpenAI

- Se reprodujo que el botón EN recibía el clic pero no cambiaba la interfaz.
- La marca inglesa `trees.` comenzaba 220 ms antes de terminar la anterior; Reader rechazaba toda
  la línea de tiempo y el manejador terminaba antes de actualizar el idioma.
- Reader normaliza defensivamente las marcas de cualquier paquete antes de cargarlas en el motor.
- OpenAI TTS normaliza también los timestamps externos antes de persistirlos.
- La reutilización de caché repara marcas antiguas y actualiza el checksum publicado sin llamar al
  proveedor.
- La única superposición existente se corrigió en SQLite y se exportó nuevamente al bootstrap
  offline; el proceso registró cero llamadas al proveedor.
- La regresión del Reader incluye ahora una línea de tiempo inglesa superpuesta y comprueba que EN
  muestra `A Light in the Forest`.

La API publicada quedó con 74 marcas inglesas y 73 españolas, ambas con cero secuencias inválidas.

---

## Continuación 2026-07-29 - Ilustraciones por capítulo

- El contrato público de Reader añadió `image_uri` e `image_alt_text` opcionales por capítulo.
- La imagen principal sigue siendo el fallback: un cuento con una sola ilustración la repite en
  todos los capítulos sin configuración adicional.
- Las ilustraciones editoriales usan posición 0 para portada y posiciones 1..N para capítulos.
- Reader cambia la imagen junto con el capítulo y conserva texto alternativo accesible.
- Las descargas offline guardan la portada y todas las imágenes específicas disponibles.
- Se generó una ilustración original para **The Shining Path / El sendero brillante**, manteniendo
  los personajes, paleta y estilo de la portada.
- La siembra idempotente añade o actualiza el recurso del capítulo 2 sin tocar el audio OpenAI.
- El paquete real y el bootstrap exponen la imagen del capítulo 2 en español e inglés; el capítulo
  1 conserva `null` y demuestra el fallback.
- `pnpm check` pasó con 110 pruebas API, 42 Reader y 14 Admin.
- `pnpm reader:e2e` avanzó al capítulo 2 en Chrome y confirmó la URI de la imagen visible.

---

## Continuación 2026-07-29 - Resaltado sin saltos visuales

- Se reprodujo conceptualmente el cansancio visual causado por recomponer el renglón al activar
  cada palabra.
- La palabra activa conserva ahora el mismo comportamiento `inline` que las demás; el color, fondo,
  sombra y la mano no ocupan espacio adicional en el flujo del párrafo.
- El Reader comprueba la posición de la palabra antes de desplazar la página y sólo la centra si
  quedó fuera de la ventana visible.
- La regresión automatizada confirma que una palabra visible no invoca desplazamiento.
- `pnpm check` pasó con 110 pruebas API, 42 Reader y 14 Admin, además de lint, tipos,
  documentación y builds.

Queda pendiente únicamente la confirmación visual del usuario durante una reproducción real. Los
gates externos de Fase 13 (Docker, GitHub y staging) continúan pendientes.
