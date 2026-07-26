# Próximos pasos

## Siguiente tarea exacta

**FR-PH12-TASK-001 - Descomponer y activar la Fase 12**

### Objetivo

Convertir calidad, seguridad y rendimiento de la página 24 del prompt maestro en una secuencia
medible que estabilice el producto completo sin introducir optimizaciones especulativas.

### Orden de trabajo

1. Auditar seguridad, accesibilidad y dependencias con evidencia reproducible.
2. Medir bundles, rutas, API y operaciones SQLite antes de optimizar.
3. Descomponer lazy loading, compresión, caching y manejo global de errores.
4. Definir carga, regresión, logging estructurado, métricas y observabilidad.
5. Activar únicamente la primera tarea implementable.

## No hacer todavía

- No optimizar sin una medida base y un criterio de aceptación.
- No registrar contenido personal, tokens, vocabulario ni texto completo en logs.
- No añadir servicios externos de observabilidad antes de definir su frontera de privacidad.
- No cambiar SQLite ni la arquitectura de despliegue como efecto lateral.
- No desactivar controles de seguridad para mejorar resultados de carga.

## Gate externo conservado

La validación física de iOS en macOS/Xcode sigue siendo obligatoria antes de TestFlight, pero no
bloquea la Fase 12.
