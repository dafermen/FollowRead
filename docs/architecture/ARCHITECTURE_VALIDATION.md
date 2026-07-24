# Validación de arquitectura inicial

**Estado:** PASS  
**Tarea responsable:** FR-PH00-TASK-009 - COMPLETED  
**Fecha:** 2026-07-24

## Matriz de responsabilidades

| Componente | Responsabilidad | Dependencias permitidas | Dependencias prohibidas |
|---|---|---|---|
| Admin web | Flujo editorial y previsualización | API, shared UI/types | AWS SDK, DB, Reader móvil |
| Reader | Catálogo, lectura, preferencias, offline | API, Reader Engine, almacenamiento local | AWS SDK, DB, Admin |
| API routers | HTTP, autenticación y traducción de errores | Servicios de aplicación | SQLAlchemy/AWS directos |
| Servicios API | Casos de uso y transacciones | Dominio, puertos | Componentes frontend |
| Dominio API | Estados y reglas | Tipos propios | FastAPI, SQLAlchemy, AWS |
| Adaptadores API | SQLite/SQLAlchemy, Polly, S3, cola | SDKs/infraestructura | UI |
| Reader Engine | Tiempo, segmentos, controles y progreso lógico | Tipos puros | React, DOM, Capacitor, red, AWS |
| Shared types/models | Contratos estables | Ninguna app concreta | Lógica privilegiada |

## Componentes de infraestructura

- **SQLite:** fuente autoritativa del MVP para contenido, identidades, trabajos, auditoría y datos
  remotos; sólo la API abre el archivo.
- **PostgreSQL futuro:** sustituirá el adaptador cuando haya una necesidad operativa y una migración
  probada, sin cambiar dominio ni routers.
- **S3:** objetos grandes e inmutables; nunca fuente única de relaciones de negocio.
- **Polly:** proveedor detrás de `PollyService`; falso durante automatización.
- **Almacenamiento local:** catálogo, paquetes, preferencias y operaciones pendientes.
- **Redis/Celery futuro:** implementa el puerto de ejecución de trabajos; no cambia routers ni dominio.

## Walkthroughs

### Publicación

Admin -> API router -> autorización -> servicio -> máquina de estados -> trabajo -> adaptadores
Polly/S3 -> validación -> revisión -> publicación -> catálogo.

**Resultado:** PASS. No existe llamada directa Admin/AWS ni salto de estado.

### Reproducción

Reader -> paquete validado -> adaptador de audio -> Reader Engine -> posición lógica -> adaptador UI
DOM/mano -> guardado local/API.

**Resultado:** PASS. Reader Engine permanece puro y la posición visual queda en Reader.

### Offline y actualización

Reader -> catálogo remoto -> descarga temporal -> checksum/compatibilidad -> activación atómica ->
catálogo local -> operación pendiente -> API idempotente.

**Resultado:** PASS. Una falla conserva paquete previo y progreso local.

### Recuperación de procesamiento

Admin -> detalle de trabajo -> API -> autorización/costo/idempotencia -> ejecutor -> adaptadores ->
auditoría/correlation ID.

**Resultado:** PASS. Un reintento no depende del controlador HTTP ni duplica silenciosamente.

## Reglas arquitectónicas verificables

1. `reader-engine` no importa React, DOM, Capacitor ni red.
2. Routers API no importan SDK AWS.
3. Frontends no contienen variables secretas ni clientes AWS.
4. Admin no forma parte del build Capacitor.
5. Los paquetes publicados son inmutables.
6. La cola se consume mediante una interfaz reemplazable.
7. Los contratos de catálogo/paquete tienen versión.
8. Escrituras offline usan IDs idempotentes.

Estas reglas se convertirán en pruebas arquitectónicas/CI en Fase 2 o en la fase que cree el
componente.

## Decisiones cubiertas

- FR-DEC-001: separación de aplicaciones.
- FR-DEC-002: doble catálogo.
- FR-DEC-003: Reader Engine puro.
- FR-DEC-004: AWS detrás de API.
- FR-DEC-007/008/009/010: alcance y datos.

## Riesgos residuales

- elección de gestor de monorepo y almacenamiento local;
- proveedor de identidad;
- implementación inicial del ejecutor de trabajos;
- estrategia concreta de URLs/entrega S3.

Son decisiones de fases posteriores y no alteran los límites validados.
