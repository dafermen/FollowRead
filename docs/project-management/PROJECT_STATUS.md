# Estado del proyecto FollowRead

**Última actualización:** 2026-07-26  
**Fase activa:** Fase 12 - Calidad, seguridad y rendimiento
**Estado de la fase:** NOT_STARTED  
**Tarea activa:** Descomponer y activar la Fase 12
**Estado de la tarea:** NEXT

## Resumen ejecutivo

Fases 0 a 11 están completadas y auditadas. Reader ya es una aplicación web/PWA/Android/iOS con
descubrimiento, preferencias, voz local, descargas verificadas, lectura sin conexión,
sincronización, proyectos Capacitor y un modo aprender inglés completo. La siguiente fase estabiliza
calidad, seguridad y rendimiento.
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
| Tareas de Fase 9 completadas | 11 de 11 |
| Tareas de Fase 10 completadas | 12 de 12 |
| Tareas de Fase 11 completadas | 12 de 12 |
| Tareas en progreso | 0 |
| Tareas bloqueadas | 0 |
| Decisiones aceptadas | 15 |
| Decisiones abiertas | 1 |
| Riesgos abiertos | 8 |
| Problemas conocidos abiertos | 0 |

## Estado por componente

| Área | Estado | Observación |
|---|---|---|
| FollowRead Admin | PHASE_5_COMPLETED | Recorrido editorial y publicación completos |
| FollowRead Reader | PHASE_11_COMPLETED | Web/PWA/móvil con aprendizaje y offline |
| FollowRead API | PHASE_9_COMPLETED | Paquete canónico y sincronización idempotente |
| Reader Engine | PHASE_7_COMPLETED | Motor determinista sin React ni DOM |
| AWS / Polly / S3 | POLLY_BOUNDARY_READY | Fake local por defecto; AWS opcional y desacoplado |
| Modo offline | PHASE_9_COMPLETED | Descarga, actualización, recuperación y sync verificadas |
| Móvil / Capacitor | PHASE_10_COMPLETED | Android compilado/probado; iOS listo para Xcode |

## Entregables cerrados de Fases 5 a 10

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
- Capacitor 8 empaquetando únicamente Reader;
- proyectos Android/iOS, iconos y splash claro/oscuro versionados;
- conectividad y ciclo de vida nativos sin permisos sensibles;
- APK Android compilado, instalado y rotado en API 35;
- safe areas y progreso verificados en vertical/horizontal;
- checklist de revisión y transiciones auditadas hasta publicación, despublicación y archivo;
- documentación integrada conservada y rediseñada;
- 13 pruebas Admin, 33 Reader, 6 Reader Engine, 3 de configuración y 98 pruebas API;
- cobertura superior al 90% en Reader y 99% en Reader Engine/backend, con builds en verde.

## Bloqueadores

No hay bloqueadores activos. SQLite y los adaptadores locales permiten continuar sin PostgreSQL,
Docker ni AWS. iOS requiere macOS/Xcode sólo antes de compilar/publicar en TestFlight. La licencia
sigue abierta, pero no se necesita hasta Fase 14.

## Regla de continuación

Descomponer la Fase 12 antes de iniciar optimización o cambios de seguridad.
