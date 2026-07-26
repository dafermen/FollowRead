# Estado del proyecto FollowRead

**Última actualización:** 2026-07-26  
**Fase activa:** Fase 9 - Descargas y modo offline  
**Estado de la fase:** NOT_STARTED  
**Tarea activa:** Preparar desglose de Fase 9  
**Estado de la tarea:** NOT_STARTED

## Resumen ejecutivo

Fases 0 a 8 están completadas y auditadas. Reader ya es una aplicación web completa con
descubrimiento, preferencias, PWA, voz local y ayudas de lectura. La siguiente fase implementará
descargas verificadas y modo offline.
FollowRead Admin ya ofrece el recorrido visual y
funcional de acceso, Dashboard, catálogo, creación, editor bilingüe, ilustraciones, generación de
audio, revisión y publicación. Reader dispone del cuento original bilingüe **El zorro y la luna**,
un motor determinista, resaltado por palabra, mano, auto-scroll, controles y recuperación de
progreso. Todo funciona con SQLite; la voz audible usa el dispositivo y no necesita API key.

## Progreso

| Indicador | Valor |
|---|---:|
| Tareas de Fase 0 completadas | 12 de 12 |
| Tareas de Fase 1 completadas | 8 de 8 |
| Tareas de Fase 2 completadas | 11 de 11 |
| Tareas de Fase 3 completadas | 12 de 12 |
| Tareas de Fase 4 completadas | 10 de 10 |
| Tareas de Fase 5 completadas | 12 de 12 |
| Tareas de Fase 6 completadas | 10 de 10 |
| Tareas de Fase 7 completadas | 10 de 10 |
| Tareas de Fase 8 completadas | 12 de 12 |
| Tareas en progreso | 0 |
| Tareas bloqueadas | 0 |
| Decisiones aceptadas | 13 |
| Decisiones abiertas | 1 |
| Riesgos abiertos | 8 |
| Problemas conocidos abiertos | 0 |

## Estado por componente

| Área | Estado | Observación |
|---|---|---|
| FollowRead Admin | PHASE_5_COMPLETED | Recorrido editorial y publicación completos |
| FollowRead Reader | PHASE_8_COMPLETED | Web/PWA completa con biblioteca y lector audible |
| FollowRead API | PHASE_7_COMPLETED | Paquete publicado y cuento demo en SQLite |
| Reader Engine | PHASE_7_COMPLETED | Motor determinista sin React ni DOM |
| AWS / Polly / S3 | POLLY_BOUNDARY_READY | Fake local por defecto; AWS opcional y desacoplado |
| Modo offline | NOT_STARTED | Estrategia de doble catálogo aceptada |
| Móvil / Capacitor | NOT_STARTED | Se abordará en la Fase 10 |

## Entregables cerrados de Fases 5 a 8

- desglose de 12 tareas con dependencias y criterios de aceptación;
- shell administrativo responsive con navegación amplia y compacta;
- Dashboard y catálogo visual con estados editoriales realistas;
- login, restauración y logout conectados a la API sin persistir tokens en almacenamiento web;
- navegación filtrada por permisos recibidos del servidor;
- resumen editorial protegido con métricas, atención, contenido reciente y auditoría desde SQLite;
- catálogo editorial protegido con búsqueda, filtros, orden, paginación y acciones por permiso;
- formulario responsive para crear borradores reales con idiomas, nivel y categorías;
- editor estructural responsive con capítulos, párrafos, autoguardado y recuperación local;
- carga local validada de ilustraciones con descripción alternativa obligatoria;
- procesamiento visual con voces, costo, progreso, errores, cancelación y reintentos;
- generación local de audio y Speech Marks vinculados a cada párrafo;
- límite Amazon Polly implementado y probado exclusivamente con cliente simulado;
- paquete de lectura publicado con texto, recursos y Speech Marks;
- cuento bilingüe original, ilustración propia y siembra idempotente en SQLite;
- Reader Engine reusable con búsqueda temporal, reproducción y progreso;
- biblioteca y lector visual con palabra activa, mano, auto-scroll, capítulos e idiomas;
- biblioteca filtrable, detalle, favoritos, historial, vocabulario y preferencias locales;
- modos infantil, adulto y aprendizaje con voz audible del dispositivo y fallback visual;
- PWA instalable con cache exclusivo del shell;
- checklist de revisión y transiciones auditadas hasta publicación, despublicación y archivo;
- documentación integrada conservada y rediseñada;
- 13 pruebas Admin, 22 Reader, 6 Reader Engine, 3 de configuración y 95 pruebas API;
- cobertura superior al 90% en Reader y 99% en Reader Engine/backend, con builds en verde.

## Bloqueadores

No hay bloqueadores activos. SQLite y los adaptadores locales permiten continuar sin PostgreSQL,
Docker ni AWS. La licencia sigue abierta, pero no se necesita hasta Fase 14.

## Regla de continuación

Descomponer la Fase 9 antes de implementarla. Las descargas de contenido, checksum, activación de
versiones y sincronización posterior permanecen en esa fase.
