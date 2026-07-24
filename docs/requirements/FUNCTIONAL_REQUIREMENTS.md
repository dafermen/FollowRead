# Requisitos funcionales

**Estado del documento:** Validado para Fase 0 - FR-PH00-TASK-005 COMPLETED.  
**Estados de requisitos:** `PROPOSED`, `APPROVED`, `DEFERRED`, `REMOVED`.

`MVP` indica implementación en el corte vertical. `Contract` indica que el contrato debe permitirlo,
pero sólo se implementa primero la variante necesaria.

## Contenido y publicación

| ID | Requisito | Prioridad | MVP | Fuente | Verificación |
|---|---|---|---|---|---|
| FR-CONTENT-001 | El sistema soportará `story`, `article`, `book` y `lesson` | Must | Contract | Prompt §8; FR-DEC-007 | Crear/consultar `story`; validar enum completo |
| FR-CONTENT-002 | Un contenido podrá tener representaciones en inglés, español o ambos | Must | Yes | Prompt §2/8 | Consultar idiomas independientemente |
| FR-CONTENT-003 | El contenido tendrá audiencia y nivel de lectura | Must | Yes | Prompt §8 | Validar valores permitidos |
| FR-CONTENT-004 | Cada versión tendrá ID, número, estado, fechas, checksum, URL y compatibilidad | Must | Yes | Prompt §7 | Serializar contrato completo |
| FR-CONTENT-005 | Las transiciones seguirán una máquina de estados validada | Must | Yes | Prompt §13 | Aceptar válidas y rechazar inválidas |
| FR-CONTENT-006 | Toda transición registrará actor, fecha y comentario opcional | Must | Yes | Prompt §13 | Revisar auditoría persistida |
| FR-CONTENT-007 | Una corrección publicada creará una nueva versión | Must | Yes | Prompt §6/7 | Verificar inmutabilidad |

## FollowRead Admin

| ID | Requisito | Prioridad | MVP | Fuente | Verificación |
|---|---|---|---|---|---|
| FR-ADMIN-001 | Un administrador autorizado podrá iniciar y cerrar sesión | Must | Yes | Prompt §3.1/4 | Éxito, credencial inválida y logout |
| FR-ADMIN-002 | Un editor podrá crear y editar contenido, capítulos y párrafos | Must | Yes | Prompt §3.1 | CRUD con validaciones |
| FR-ADMIN-003 | Un editor podrá asociar texto y traducción por unidad editorial | Must | Yes | Prompt §3.1; FR-DEC-008 | Guardar y recuperar par bilingüe |
| FR-ADMIN-004 | Un editor podrá asignar audiencia, nivel, categorías y voces | Must | Yes | Prompt §3.1/8/12 | Persistencia y valores inválidos |
| FR-ADMIN-005 | Un editor podrá subir portada e ilustraciones | Should | Yes | Prompt §3.1 | Tipo, tamaño y error |
| FR-ADMIN-006 | El editor tendrá borrador, autoguardado y recuperación | Must | Yes | Prompt Fase 5 | Simular salida y recuperación |
| FR-ADMIN-007 | Un usuario autorizado podrá solicitar procesamiento de audio | Must | Yes | Prompt §3.1/12 | Crear trabajo trazable |
| FR-ADMIN-008 | Un revisor podrá previsualizar texto, audio y sincronización | Must | Yes | Prompt §3.1/12 | Vista equivalente a Reader |
| FR-ADMIN-009 | Un publicador podrá aprobar, publicar, despublicar y archivar | Must | Yes | Prompt §3.1/13 | Permisos y transiciones |
| FR-ADMIN-010 | Un operador podrá consultar errores y reintentar trabajos | Must | Yes | Prompt §3.1/12 | Error visible y reintento idempotente |
| FR-ADMIN-011 | El historial mostrará versiones y cambios auditados | Should | Yes | Prompt §3.1 | Consulta cronológica |

## Audio y procesamiento

| ID | Requisito | Prioridad | MVP | Fuente | Verificación |
|---|---|---|---|---|---|
| FR-AUDIO-001 | API procesará mediante servicios independientes de HTTP | Must | Yes | Prompt §12; FR-DEC-004 | Regla de dependencias |
| FR-AUDIO-002 | El backend dividirá texto respetando límites del proveedor | Must | Yes | Prompt §12 | Longitud, Unicode y límites |
| FR-AUDIO-003 | El sistema generará audio y Speech Marks para la misma versión | Must | Yes | Prompt §12 | IDs/metadatos coinciden |
| FR-AUDIO-004 | El parser normalizará Speech Marks a un contrato interno | Must | Yes | Prompt §10/12 | Fixtures conocidos |
| FR-AUDIO-005 | El procesamiento validará correspondencia texto-marcas | Must | Yes | Prompt §12 | Detectar omisiones, duplicados y orden |
| FR-AUDIO-006 | Errores parciales, cancelación y reintentos serán explícitos | Must | Yes | Prompt §12 | Pruebas por estado |
| FR-AUDIO-007 | Admin verá progreso y costo estimado | Should | Yes | Prompt Fase 6 | Presentación con adaptador falso |

## FollowRead Reader y Reader Engine

| ID | Requisito | Prioridad | MVP | Fuente | Verificación |
|---|---|---|---|---|---|
| FR-READER-001 | Reader mostrará biblioteca, categorías, búsqueda y filtros | Must | Yes | Prompt §3.2 | Flujos con catálogo |
| FR-READER-002 | Reader mostrará detalles, idiomas, nivel y disponibilidad offline | Must | Yes | Prompt §3.2 | Vista por contenido |
| FR-READER-003 | Reader reproducirá audio de la versión seleccionada | Must | Yes | Prompt §2/3.2 | Controles, recurso ausente y error |
| FR-READER-004 | Reader Engine calculará la palabra activa por tiempo | Must | Yes | Prompt §10 | Límites temporales |
| FR-READER-005 | La interfaz resaltará la palabra activa | Must | Yes | Prompt §2/10 | Componente sincronizado |
| FR-READER-006 | Una mano SVG opcional señalará sin tapar texto | Must | Yes | Prompt §11 | Líneas, scroll, resize y reduced motion |
| FR-READER-007 | El usuario podrá pausar, reanudar, avanzar, retroceder y repetir | Must | Yes | Prompt §2/10 | Controles y límites |
| FR-READER-008 | El usuario podrá cambiar velocidad | Must | Yes | Prompt §2/9/10 | Rango y persistencia |
| FR-READER-009 | Reader guardará y recuperará progreso | Must | Yes | Prompt §2/10 | Cierre, reanudación y fallo |
| FR-READER-010 | Reader ofrecerá favoritos, historial y configuración | Should | Yes | Prompt §3.2 | Persistencia local/remota |
| FR-READER-011 | Reader adaptará presentación a modo infantil o adulto | Must | Yes | Prompt §9 | Escenarios de ambos modos |
| FR-READER-012 | Reader soportará español, inglés y aprender inglés | Must | Yes | Prompt §9 | Contenido y controles por modo |
| FR-READER-013 | Aprender inglés permitirá repetir palabra y oración | Must | Yes | Prompt §9.3 | Precisión de segmentos |
| FR-READER-014 | Aprender inglés permitirá traducción y vocabulario | Should | Yes | Prompt §9.3; FR-DEC-008 | Flujo editorial y offline |
| FR-READER-015 | El usuario podrá ocultar mano, reducir movimiento y ajustar texto | Must | Yes | Prompt §9/11/22 | Preferencias aplicadas |

## Offline y sincronización

| ID | Requisito | Prioridad | MVP | Fuente | Verificación |
|---|---|---|---|---|---|
| FR-OFFLINE-001 | Reader incluirá catálogo y contenido inicial en el build | Must | Yes | Prompt §6/7 | Primer inicio sin red |
| FR-OFFLINE-002 | Reader consultará catálogo remoto y comparará versiones | Must | Yes | Prompt §7 | Nuevo, igual e incompatible |
| FR-OFFLINE-003 | Reader descargará sólo contenido nuevo o modificado | Must | Yes | Prompt §7 | Inspección de solicitudes |
| FR-OFFLINE-004 | Reader validará checksum antes de activar una descarga | Must | Yes | Prompt §7 | Paquete válido y corrupto |
| FR-OFFLINE-005 | Una actualización fallida conservará la versión local válida | Must | Yes | Prompt §7 | Interrupción simulada |
| FR-OFFLINE-006 | Reader permitirá eliminar descargas sin borrar progreso remoto | Should | Yes | Prompt Fase 9 | Flujo de eliminación |
| FR-OFFLINE-007 | Cambios offline se sincronizarán al recuperar conexión | Must | Yes | Prompt Fase 9 | Cola idempotente y conflicto |
| FR-OFFLINE-008 | Reader comunicará conexión, descarga y sincronización | Must | Yes | Prompt §23 | Estados accesibles |

## API, identidad y datos de usuario

| ID | Requisito | Prioridad | MVP | Fuente | Verificación |
|---|---|---|---|---|---|
| FR-API-001 | API autenticará usuarios y emitirá sesiones/tokens seguros | Must | Yes | Prompt §3.3/Fase 4 | API y seguridad |
| FR-API-002 | API autorizará acciones por rol y permiso | Must | Yes | Prompt §3.3/Fase 4 | Matriz de permisos |
| FR-API-003 | API publicará catálogo y paquetes compatibles | Must | Yes | Prompt §6/7 | Contratos y compatibilidad |
| FR-API-004 | API almacenará progreso, favoritos y vocabulario | Must | Yes | Prompt §3.3 | CRUD con propiedad |
| FR-API-005 | API registrará auditoría y errores operativos | Must | Yes | Prompt §3.3 | Eventos consultables |
| FR-API-006 | API expondrá health checks y OpenAPI | Must | Yes | Prompt Fase 3 | Endpoints y esquema |
| FR-API-007 | API soportará sincronización idempotente | Must | Yes | Prompt §3.3/Fase 9 | Reenvío sin duplicados |

## Dependencias y decisiones

- FR-READER-014 usa contenido editorial según FR-DEC-008.
- El modo infantil cumple FR-DEC-009 y no crea cuentas personales de menores.
- Notas libres se aplazan según FR-DEC-010.
- Los requisitos permanecen `PROPOSED` hasta la revisión integral de FR-PH00-TASK-012.

## Validación

- IDs únicos: PASS.
- Cada requisito tiene prioridad, alcance MVP, fuente y verificación: PASS.
- Estados, versiones, integridad, progreso y errores están cubiertos: PASS.
- Ningún requisito autoriza llamadas frontend a AWS: PASS.
