# Estado del proyecto FollowRead

**Última actualización:** 2026-07-25  
**Fase activa:** Fase 4 - Autenticación y autorización  
**Estado de la fase:** IN_PROGRESS  
**Tarea activa:** FR-PH04-TASK-008 - Añadir auditoría y límite de intentos  
**Estado de la tarea:** IN_PROGRESS

## Resumen ejecutivo

Fases 0, 1, 2 y 3 están completadas y auditadas. La Fase 4 ya dispone de persistencia revocable,
Argon2id, tokens opacos, bootstrap del primer administrador, endpoints de sesión y controles de
cookie, origen, CSRF, caché, CORS y autorización RBAC deny-by-default. Continúan auditoría y límites
de intentos.

## Progreso

| Indicador | Valor |
|---|---:|
| Tareas de Fase 0 completadas | 12 de 12 |
| Tareas de Fase 1 completadas | 8 de 8 |
| Tareas de Fase 2 completadas | 11 de 11 |
| Tareas de Fase 3 completadas | 12 de 12 |
| Tareas de Fase 4 completadas | 7 de 10 |
| Tareas en progreso | 1 |
| Tareas bloqueadas | 0 |
| Decisiones aceptadas | 13 |
| Decisiones abiertas | 1 |
| Riesgos abiertos | 8 |
| Problemas conocidos abiertos | 0 |

## Estado por componente

| Área | Estado | Observación |
|---|---|---|
| FollowRead Admin | BASE_BUILDS | React/Vite independiente, test de humo en PASS |
| FollowRead Reader | BASE_BUILDS | React/Vite independiente, test de humo en PASS |
| FollowRead API | PHASE_4_IN_PROGRESS | Autenticación y RBAC listos; abuso/auditoría en curso |
| Reader Engine | BASE_COMPILES | Paquete TypeScript sin React validado |
| AWS / Polly / S3 | NOT_STARTED | Sólo arquitectura conceptual; sin integración |
| Modo offline | NOT_STARTED | Estrategia de doble catálogo aceptada |
| Móvil / Capacitor | NOT_STARTED | Se abordará en la Fase 10 |

## Entregables de Fase 0

Los entregables de Fase 0 están validados. La revisión de cierre está en
`docs/project-management/PHASE_0_REVIEW.md`.

Entregables de Fase 1 completados:

- inventario de 12 pantallas Reader y 14 Admin;
- arquitectura de información separada y flujos para 12 casos de uso;
- wireframes Reader para 12 pantallas y Admin para 14 pantallas;
- sistema visual, responsive, accesibilidad, modos y journeys;
- validación de 14 recorridos y revisión formal de fase.

## Bloqueadores

No hay bloqueadores activos. FR-ISSUE-005 quedó resuelto mediante FR-DEC-013: SQLite sustituye
PostgreSQL/Docker para el MVP. La licencia sigue abierta, pero no se necesita hasta Fase 14.

## Regla de continuación

La siguiente sesión debe comenzar leyendo los archivos de gestión indicados por el prompt maestro y
continuar FR-PH04-TASK-008 con auditoría segura y límite temporal de intentos.
