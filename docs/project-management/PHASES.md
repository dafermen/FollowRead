# Plan de fases de FollowRead

## Convenciones

- Una fase sólo puede cerrarse cuando sus entregables críticos existen, se revisaron y cumplen sus
  criterios de salida.
- Una tarea usa uno de estos estados: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`,
  `READY_FOR_REVIEW`, `COMPLETED`, `CANCELLED` o `DEFERRED`.
- Las decisiones arquitectónicas que cambien este plan deben registrarse en `DECISIONS.md`.

## Fases

| Fase | Nombre | Objetivo principal | Estado |
|---:|---|---|---|
| 0 | Descubrimiento, definición y planificación | Definir el producto y el plan verificable | COMPLETED |
| 1 | Diseño UX/UI y sistema visual | Diseñar flujos, pantallas y accesibilidad | COMPLETED |
| 2 | Monorepo y entorno de desarrollo | Preparar proyectos, herramientas y CI base | COMPLETED |
| 3 | Modelado de datos y API base | Crear la base funcional del backend | COMPLETED |
| 4 | Autenticación y autorización | Proteger Admin y preparar usuarios Reader | COMPLETED |
| 5 | FollowRead Admin | Crear la administración de contenido | COMPLETED |
| 6 | Integración con Amazon Polly | Generar audio y Speech Marks con seguridad | COMPLETED |
| 7 | Motor de lectura | Implementar sincronización audio-texto reusable | COMPLETED |
| 8 | FollowRead Reader Web | Crear biblioteca, lector y PWA accesible | COMPLETED |
| 9 | Sincronización y modo offline | Descargar, validar y sincronizar contenido | COMPLETED |
| 10 | Capacitor, Android e iOS | Empaquetar sólo Reader para dispositivos | COMPLETED |
| 11 | Modo aprender inglés | Agregar funciones educativas | NOT_STARTED |
| 12 | Calidad, seguridad y rendimiento | Endurecer el sistema para uso estable | NOT_STARTED |
| 13 | CI/CD y despliegue | Automatizar validaciones y entregas | NOT_STARTED |
| 14 | Documentación final y GitHub | Preparar evaluación, contribución y portafolio | NOT_STARTED |

## Fase 0 - Cerrada

### Objetivo

Transformar el prompt maestro en un conjunto coherente, priorizado y trazable de decisiones,
requisitos, riesgos y estrategias antes de escribir código.

### Entregables críticos

- `docs/requirements/PRODUCT_VISION.md`
- `docs/requirements/PROJECT_SCOPE.md`
- `docs/requirements/FUNCTIONAL_REQUIREMENTS.md`
- `docs/requirements/NON_FUNCTIONAL_REQUIREMENTS.md`
- `docs/requirements/USER_STORIES.md`
- `docs/requirements/USE_CASES.md`
- `docs/requirements/ACCEPTANCE_CRITERIA.md`
- `docs/requirements/TRACEABILITY_MATRIX.md`
- `docs/architecture/SYSTEM_CONTEXT.md`
- `docs/architecture/INITIAL_ARCHITECTURE.md`
- `docs/architecture/SECURITY_STRATEGY.md`
- `docs/ux-ui/UX_STRATEGY.md`
- `docs/testing/TEST_STRATEGY.md`
- `docs/deployment/DEPLOYMENT_STRATEGY.md`
- los archivos de `docs/project-management/`

### Criterios de salida

1. Todos los requisitos tienen identificador, prioridad y criterio verificable.
2. Las historias, casos de uso y pruebas planeadas pueden rastrearse a requisitos.
3. El alcance de MVP y lo que queda fuera están explícitos.
4. Los límites entre Admin, Reader, API y Reader Engine están definidos.
5. Privacidad infantil, autenticación, datos, AWS, offline y accesibilidad tienen estrategia.
6. Las decisiones abiertas tienen dueño y fecha objetivo.
7. Los riesgos altos tienen mitigación y tarea asociada.
8. El plan fue revisado como un conjunto sin contradicciones críticas.
9. La tarea de cierre de Fase 0 está `COMPLETED`.

### Prohibiciones mientras la Fase 0 esté activa

- No crear pantallas definitivas.
- No instalar dependencias.
- No integrar servicios AWS.
- No crear el monorepo de aplicaciones.
- No marcar requisitos provisionales como aprobados.

### Resultado

Fase 0 cerrada el 2026-07-24. Evidencia: `PHASE_0_REVIEW.md`.

## Fase 1 - Cerrada

### Objetivo

Diseñar la experiencia, navegación, wireframes, sistema visual, responsive y accesibilidad antes de
implementar pantallas.

### Criterios de salida

1. Flujos Reader y Admin cubren casos críticos y alternos.
2. Todas las pantallas mínimas tienen wireframe y estados.
3. Sistema visual define tipografía, color, espaciado, iconos y componentes.
4. Infantil, adulto y aprendizaje están resueltos como modos coherentes.
5. Responsive, teclado, foco, movimiento y tacto tienen especificación.
6. Prototipos críticos pasan walkthrough y revisión de accesibilidad.
7. Todos los entregables de Fase 1 están validados.

### Resultado

Fase 1 cerrada el 2026-07-24. Evidencia: `PHASE_1_REVIEW.md`.

## Fase 2 - Cerrada

### Objetivo

Crear el monorepo, aplicaciones base, herramientas, entorno local, pruebas y CI sin implementar aún
funcionalidad de producto.

### Criterios de salida

1. Admin, Reader y API existen separados y arrancan.
2. TypeScript strict, Python type hints, lint y formato están configurados.
3. Pruebas base y builds pasan.
4. SQLite y migraciones base funcionan sin Docker ni servicios externos.
5. Variables de entorno están documentadas sin secretos.
6. Scripts, hooks y CI ejecutan la misma validación.
7. Instalación limpia está documentada y verificada.

### Resultado

Fase 2 cerrada el 2026-07-24. Evidencia: `PHASE_2_REVIEW.md`.

## Fase 3 - Cerrada

### Objetivo

Crear la base funcional del backend mediante un modelo relacional consistente, migraciones,
repositorios, servicios, contratos HTTP, errores, logging, health checks, OpenAPI y pruebas.

### Criterios de salida

1. Las 22 entidades iniciales del prompt tienen modelo o aplazamiento explícito y trazable.
2. Relaciones, restricciones, estados, versionado y borrado preservan las reglas de negocio.
3. Una migración funcional crea y revierte el esquema SQLite desde una base vacía.
4. Repositorios y servicios mantienen la lógica de dominio fuera de las rutas HTTP.
5. Validaciones y respuestas de error usan un contrato estándar sin filtrar detalles internos.
6. Health/readiness, logging estructurado y OpenAPI reflejan el comportamiento real.
7. Un corte de catálogo/contenido funciona por API con pruebas unitarias y de integración.
8. La puerta completa pasa desde una base SQLite desechable.

### Resultado

Fase 3 cerrada el 2026-07-24. Evidencia: `PHASE_3_REVIEW.md`.

## Resumen de criterios de las fases siguientes

Cada fase posterior deberá definir, antes de comenzar, tareas completas con dependencias, archivos,
pruebas y criterios de aceptación. La descripción detallada de actividades del prompt maestro se
considera la fuente mínima; `TASKS.md` se ampliará al preparar cada fase.

## Fase 5 - Cerrada

### Objetivo

Crear una aplicación administrativa accesible que permita al equipo editorial iniciar sesión,
visualizar el trabajo prioritario y gestionar el contenido desde el borrador hasta la publicación.

### Criterios de salida

1. Login, restauración de sesión y logout usan los contratos seguros de Fase 4.
2. Shell, dashboard y navegación responden a permisos y funcionan desde 320 CSS px.
3. Lista, creación y edición de contenido persisten metadatos, estructura y traducciones válidas.
4. Borradores conservan cambios, comunican guardado y evitan sobreescritura ante conflicto.
5. Recursos, voz y procesamiento presentan estados, errores recuperables y acciones autorizadas.
6. Revisión, previsualización y publicación siguen la máquina de estados auditada.
7. Estados vacío, carga, error y permiso parcial son accesibles y conservan contexto.
8. Pruebas de componentes, integración y recorrido crítico pasan con la puerta completa.

### Resultado

Fase 5 cerrada el 2026-07-25. Evidencia: `PHASE_5_REVIEW.md`.

## Fase 6 - Cerrada

### Objetivo

Generar audio y Speech Marks desde traducciones editoriales mediante contratos desacoplados,
control de costo, almacenamiento íntegro y una experiencia administrativa recuperable.

### Resultado

Fase 6 cerrada el 2026-07-25. Evidencia: `PHASE_6_REVIEW.md`. El MVP mantiene el adaptador local
como opción predeterminada y no requiere una cuenta AWS.

## Fase 7 - Cerrada

### Objetivo

Convertir el contenido publicado y sus Speech Marks en un motor determinista, reusable y ajeno a
React que controle el tiempo, la palabra activa, capítulos, velocidad, recuperación e
interrupciones.

### Criterios de salida

1. El motor valida una línea de tiempo y encuentra la palabra activa de forma determinista.
2. Reproducir, pausar, repetir, buscar, cambiar velocidad y navegar capítulos actualizan un único
   estado observable.
3. El progreso puede serializarse y recuperarse por contenido e idioma.
4. Cambios de viewport, interrupciones y pérdida de audio tienen comportamiento explícito.
5. La API entrega texto, recursos y Speech Marks publicados en un paquete estable.
6. Existe un cuento bilingüe original sembrable en SQLite sin servicios externos.
7. Pruebas unitarias, de integración, tipos, lint y compilación pasan.
8. La arquitectura y las restricciones del audio simulado están documentadas.

### Resultado

Fase 7 cerrada el 2026-07-26. Evidencia: `PHASE_7_REVIEW.md`. Se adelantó un corte visual de Fase 8
para poder demostrar el motor desde el navegador sin cerrar todavía la PWA completa.

## Fase 8 - Cerrada

### Objetivo

Entregar FollowRead Reader Web como una aplicación responsive, accesible e instalable con
biblioteca, detalle, lector audible, áreas personales, configuración y modos de lectura.

### Criterios de salida

1. Inicio, biblioteca, búsqueda, categorías, detalle y lector consumen el catálogo publicado.
2. Favoritos, progreso, historial y vocabulario local funcionan sin guardar PII.
3. Los modos infantil, adulto y aprendizaje aplican preferencias coherentes.
4. La voz del dispositivo se integra sin API key y degrada a seguimiento visual.
5. Manifest, icono y service worker hacen instalable el shell.
6. Navegación, reflow, teclado, foco, reduced motion y safe areas cumplen la especificación.
7. Vitest y un recorrido Chrome headless cubren los recorridos críticos.
8. Documentación, revisión visual y puerta completa quedan en verde.

### Resultado

Fase 8 cerrada el 2026-07-26. Evidencia: `PHASE_8_REVIEW.md`. Las descargas verificadas de contenido
y la operación offline permanecen explícitamente en la Fase 9.

## Fase 9 - Cerrada

### Objetivo

Permitir descargar, validar, actualizar y utilizar contenido sin conexión, conservando el progreso
local y sincronizándolo de forma idempotente cuando vuelve la red.

### Criterios de salida

1. Catálogo remoto y paquetes locales se combinan y comparan por versión y checksum.
2. Sólo paquetes compatibles, completos y con SHA-256 válido se activan.
3. IndexedDB conserva contenido, metadatos y operaciones sin almacenar PII.
4. El build incluye al menos un cuento verificable para el primer inicio sin conexión.
5. Descargas, actualizaciones, eliminación, cuota y recuperación tienen estados visibles.
6. Biblioteca, detalle, lectura, voz local y progreso funcionan sin API.
7. La reconexión sincroniza operaciones idempotentes sin retroceder progreso.
8. Pruebas unitarias, API y Chrome real demuestran corrupción, offline y reconexión.

### Resultado

Fase 9 cerrada el 2026-07-26. Evidencia: `PHASE_9_REVIEW.md`.

## Fase 10 - Cerrada

### Objetivo

Convertir exclusivamente FollowRead Reader en aplicaciones Android/iOS mediante Capacitor,
preservando web/PWA, offline, accesibilidad y la separación total de Admin.

### Criterios de salida

1. Capacitor empaqueta sólo `apps/reader/dist` con identificador estable.
2. Android e iOS, iconos, splash claro/oscuro y configuración nativa están versionados.
3. Red y ciclo de vida usan plugins mínimos; IndexedDB/`localStorage` persisten sin permisos.
4. No existen permisos sensibles ni audio en segundo plano engañoso.
5. Safe areas y orientación conservan controles, tiempo, palabra y progreso.
6. Un APK Android se compila, instala y abre en un emulador API 35.
7. iOS se sincroniza y valida estructuralmente; macOS/Xcode es gate de publicación.
8. Doctor, validador, Vitest, E2E, builds y documentación cubren operación/publicación.

### Resultado

Fase 10 cerrada el 2026-07-26. Evidencia: `PHASE_10_REVIEW.md` y
`../testing/PHASE_10_MOBILE.md`. La prueba iOS física no puede ejecutarse en Windows y permanece
obligatoria antes de TestFlight, sin bloquear el desarrollo de la Fase 11.

## Fase 11 - Cerrada

### Objetivo

Implementar funciones educativas dentro del Reader sin sacar al estudiante del cuento ni depender
de inteligencia artificial para capacidades esenciales.

### Criterios de salida

1. Traducción editorial visible/oculta conserva la posición de lectura.
2. Palabra y oración pueden repetirse respetando marcas y velocidad.
3. Seleccionar palabra muestra significado y ejemplos bilingües contextuales.
4. Vocabulario, favoritas e historial persisten localmente sin PII.
5. Estados nueva/aprendiendo/dominada, repasos y métricas muestran progreso privado.
6. La pantalla Mi vocabulario permite buscar, filtrar, escuchar y eliminar.
7. Teclado, foco, idiomas, Escape, reflow y offline conservan accesibilidad.
8. Dominio, storage, React, Chrome real, móvil y puerta integral quedan en verde.

### Resultado

Fase 11 cerrada el 2026-07-26. Evidencia: `PHASE_11_REVIEW.md`,
`../architecture/LEARNING_MODE.md` y `../testing/PHASE_11_LEARNING.md`. La siguiente fase es
**Fase 12 - Calidad, seguridad y rendimiento**.
