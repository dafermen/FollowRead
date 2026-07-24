# Criterios de aceptación

**Estado:** Validado para Fase 0 - FR-PH00-TASK-008 COMPLETED.

## FR-AC-001 - Palabra activa

**Relaciona:** FR-READER-004, FR-US-READER-001, FR-UC-002

- Dada una lista ordenada de marcas válidas, cuando el tiempo entra en el intervalo de una palabra,
  entonces Reader Engine devuelve esa palabra.
- En un límite exacto, la regla de inclusión es determinista y está documentada.
- Antes de la primera marca o después del final, no se devuelve una palabra incorrecta.

## FR-AC-002 - Mano animada accesible

**Relaciona:** FR-READER-006, FR-READER-015

- La mano se ubica debajo de la palabra activa y no cubre el glifo.
- Se realinea después de scroll, salto de línea, resize u orientación.
- Al ocultarla o activar reducción de movimiento, no se anima.

## FR-AC-003 - Recuperación de progreso

**Relaciona:** FR-READER-009, FR-US-READER-003

- Al cerrar y abrir la misma versión, Reader ofrece continuar en la última posición confirmada.
- Una falla de red no elimina el progreso local.
- La sincronización repetida no duplica ni retrocede progreso sin una regla de conflicto visible.

## FR-AC-004 - Descarga íntegra

**Relaciona:** FR-OFFLINE-003 a FR-OFFLINE-005, FR-UC-003

- Un checksum válido permite activar el paquete.
- Un checksum inválido produce error y elimina o aísla el temporal.
- Si existe una versión local válida, permanece disponible después del fallo.

## FR-AC-005 - Publicación válida

**Relaciona:** FR-CONTENT-005 a FR-CONTENT-007, FR-UC-001

- Sólo `approved` puede pasar a `published`.
- La acción requiere permiso.
- La transición registra actor y fecha.
- Una versión publicada no se modifica en sitio.

## FR-AC-006 - Procesamiento con error

**Relaciona:** FR-AUDIO-005, FR-AUDIO-006, FR-US-ADMIN-006

- Un error del proveedor termina en `processing_failed`.
- El error conserva un código seguro, etapa y correlation ID.
- Reintentar no crea publicaciones duplicadas.
- Las pruebas usan un adaptador falso.

## FR-AC-007 - Uso offline

**Relaciona:** FR-OFFLINE-001, FR-OFFLINE-007, FR-UC-003

- Sin red, el usuario abre contenido descargado, reproduce audio y guarda progreso.
- La interfaz comunica modo offline sin interrumpir la lectura.
- Al regresar la red, los cambios pendientes se sincronizan de forma idempotente.

## FR-AC-008 - Navegación accesible

**Relaciona:** NFR-ACCESSIBILITY-001 a 006

- Todas las acciones críticas son alcanzables con teclado.
- El foco es visible y lógico.
- Los controles tienen nombre y estado anunciables.
- La lectura no depende sólo de color o movimiento.

## FR-AC-009 - Seguridad de AWS

**Relaciona:** NFR-SECURITY-001, FR-AUDIO-001

- Los bundles de Admin y Reader no contienen credenciales ni variables secretas.
- Sólo el backend configura el SDK o adaptador AWS.
- El análisis de secretos no detecta valores reales.

## FR-AC-010 - Cambio de versión

**Relaciona:** FR-CONTENT-004, FR-OFFLINE-002

- Reader ignora o explica una versión incompatible.
- Una versión nueva se descarga sin rebuild.
- El catálogo local sólo cambia tras validación completa.

## FR-AC-011 - Visión medible

**Relaciona:** FR-OV-001 a FR-OV-008, FR-PH00-TASK-002

- Cada resultado de visión tiene un identificador, un indicador, una meta inicial y un método.
- Cada resultado se relaciona con al menos un requisito, historia o criterio verificable.
- Las metas de pruebas con usuarios se identifican como hipótesis de piloto.
- Las decisiones diferidas no se presentan como aprobadas por implicación.
- La visión incluye explícitamente contenido dinámico, continuidad offline y accesibilidad.

## FR-AC-012 - Contrato y ciclo de contenido

**Relaciona:** FR-CONTENT-001 a 007, FR-BR-001 a 006, FR-BR-014 a 020

- Los enums rechazan valores desconocidos y permiten los valores documentados.
- Una versión contiene todos los metadatos obligatorios.
- Sólo transiciones permitidas cambian estado y toda transición se audita.
- Una versión publicada es inmutable y una corrección crea otra.
- Sólo contenido publicado y compatible aparece en el catálogo.

## FR-AC-013 - Edición y conservación de borrador

**Relaciona:** FR-ADMIN-001 a 006

- Un editor autorizado crea un cuento bilingüe estructurado y recibe errores asociados al campo.
- Autoguardado distingue guardando, guardado, pendiente y error.
- Cerrar o perder conexión no sobrescribe silenciosamente una versión más nueva.
- Portada/ilustración inválida se rechaza sin perder el borrador.

## FR-AC-014 - Procesamiento, revisión y operación

**Relaciona:** FR-ADMIN-007 a 011, FR-AUDIO-001 a 007

- Solicitar procesamiento crea un trabajo trazable e idempotente.
- Audio, marcas, idioma y versión coinciden.
- Revisión usa una previsualización equivalente al Reader.
- Error, cancelación y reintento conservan estado y evidencia.
- Costo/progreso se muestra sin invocar AWS real en automatización.

## FR-AC-015 - Descubrimiento, modos y preferencias

**Relaciona:** FR-READER-001, 002, 010, 011, 012, 015

- Biblioteca combina catálogo local/remoto sin duplicados.
- Búsqueda/filtros funcionan con catálogo local y estado vacío.
- Modo y preferencias se aplican sin crear aplicaciones separadas.
- Mano, tamaño y movimiento se conservan localmente.
- Todas las acciones críticas permanecen disponibles sin depender sólo de color.

## FR-AC-016 - Reproducción y aprendizaje

**Relaciona:** FR-READER-003 a 009, 013, 014

- Audio faltante o inválido produce un estado recuperable.
- Pausa, reanudación, salto, repetición y velocidad respetan límites.
- Palabra/oración se repiten usando segmentos canónicos.
- Traducción/vocabulario editorial funciona offline cuando está incluido.
- Progreso confirmado se recupera tras reinicio.

## FR-AC-017 - Sincronización offline

**Relaciona:** FR-OFFLINE-001 a 008, FR-BR-007 a 010, FR-BR-021 a 023

- Primer inicio puede abrir contenido incluido sin red.
- Sólo un paquete compatible e íntegro se activa.
- Interrupción conserva versión anterior y operación pendiente.
- Reenvío no duplica cambios.
- La interfaz anuncia conexión, descarga y sincronización.

## FR-AC-018 - API, identidad y datos del lector

**Relaciona:** FR-API-001 a 007

- Credenciales inválidas y permisos insuficientes no producen efectos.
- Catálogo no expone borradores ni objetos incompatibles.
- Propiedad se valida para progreso, favoritos y vocabulario.
- Health checks y OpenAPI reflejan el contrato disponible.
- Sincronización repetida es idempotente.

## FR-AC-019 - Accesibilidad verificable

**Relaciona:** NFR-ACCESSIBILITY-001 a 006

- Cero defectos críticos automatizados en flujos MVP.
- Teclado, foco, nombres/estados, tacto y señales no cromáticas pasan revisión.
- `prefers-reduced-motion` y el ajuste propio desactivan movimiento no esencial.

## FR-AC-020 - Rendimiento, fiabilidad y disponibilidad

**Relaciona:** NFR-PERFORMANCE-001 a 005, NFR-RELIABILITY-001 a 003,
NFR-AVAILABILITY-001 a 002

- Benchmarks cumplen los umbrales documentados en el entorno de referencia.
- Fallos de red/almacenamiento no activan datos parciales.
- Flujo offline crítico funciona sin backend.
- Ejercicio de recuperación demuestra RTO/RPO o registra desviación antes de producción.

## FR-AC-021 - Seguridad y privacidad

**Relaciona:** NFR-SECURITY-001 a 007, NFR-PRIVACY-001 a 003

- Escaneo no encuentra secretos reales.
- Entradas, permisos, sesiones, CORS y auditoría pasan casos positivos/negativos.
- Inventario cubre todos los campos persistidos.
- MVP no incluye PII ni analítica identificable de menores.

## FR-AC-022 - Mantenibilidad y compatibilidad

**Relaciona:** NFR-MAINTAINABILITY-001 a 004, NFR-COMPATIBILITY-001 a 002

- Type-check, análisis Python y regla arquitectónica pasan.
- Dependencias/decisiones materiales están registradas.
- Matriz de navegadores, orientación y safe areas pasa los flujos críticos.

## FR-AC-023 - Operación, costo, almacenamiento y recuperación

**Relaciona:** NFR-OBSERVABILITY-001/002, NFR-COST-001, NFR-RECOVERY-001,
NFR-STORAGE-001

- Correlation ID une solicitud, trabajo y error sin datos sensibles.
- Health checks distinguen vida y dependencias.
- Límite de costo bloquea antes de invocar proveedor.
- Paquete excedido produce advertencia/rechazo según configuración.
- Rollback se prueba en staging antes de producción.

## Cobertura

Los criterios FR-AC-012 a 023 cubren todos los requisitos por rango. Los criterios FR-AC-001 a 011
mantienen detalle adicional para riesgos críticos. La matriz de trazabilidad registra los rangos y
los métodos de prueba.
