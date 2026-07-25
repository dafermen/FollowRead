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
| 5 | FollowRead Admin | Crear la administración de contenido | IN_PROGRESS |
| 6 | Integración con Amazon Polly | Generar audio y Speech Marks con seguridad | NOT_STARTED |
| 7 | Motor de lectura | Implementar sincronización audio-texto reusable | NOT_STARTED |
| 8 | FollowRead Reader Web | Crear biblioteca, lector y PWA accesible | NOT_STARTED |
| 9 | Sincronización y modo offline | Descargar, validar y sincronizar contenido | NOT_STARTED |
| 10 | Capacitor, Android e iOS | Empaquetar sólo Reader para dispositivos | NOT_STARTED |
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

## Fase activa: Fase 5

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
