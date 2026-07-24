# Inventario de pantallas y estados

**Estado:** Validado  
**Tarea responsable:** FR-PH01-TASK-001 - COMPLETED  
**Fecha:** 2026-07-24

## Reglas

- Admin y Reader son aplicaciones separadas.
- Una pantalla tiene una acción principal; acciones secundarias no compiten visualmente.
- Todos los estados comunican qué ocurrió, qué se conservó y la siguiente acción.
- Los modos Reader cambian presentación/políticas, no crean rutas duplicadas.

## Reader

| ID | Pantalla | Perfil | Acción principal | Estados específicos | Casos |
|---|---|---|---|---|---|
| FR-SCREEN-R01 | Inicio | 001-004 | Continuar/descubrir lectura | nuevo, con progreso, offline | UC-003/011 |
| FR-SCREEN-R02 | Biblioteca | 001-003 | Elegir contenido | vacía, local, remota, mixta | UC-011 |
| FR-SCREEN-R03 | Categorías | 001-003 | Filtrar categoría | vacía, seleccionada | UC-011 |
| FR-SCREEN-R04 | Búsqueda | 002-003 | Buscar | inicial, sin resultados, resultados | UC-011 |
| FR-SCREEN-R05 | Detalle | 001-004 | Leer/descargar | compatible, descargado, incompatible | UC-003/011 |
| FR-SCREEN-R06 | Lector | 001-003 | Reproducir/controlar | reproduciendo, pausa, error, offline | UC-002/005/007 |
| FR-SCREEN-R07 | Descargas | 002-004 | Gestionar descarga | progreso, pausada, corrupta, completa | UC-003/004 |
| FR-SCREEN-R08 | Favoritos | 002-003 | Abrir favorito | vacío, local, pendiente | UC-012 |
| FR-SCREEN-R09 | Historial | 002-003 | Reanudar | vacío, progreso local/sincronizado | UC-009/012 |
| FR-SCREEN-R10 | Vocabulario | 002 | Estudiar palabra | vacío, filtrado, pendiente | UC-005/012 |
| FR-SCREEN-R11 | Configuración | 001-004 | Aplicar preferencias | sistema, personalizado, error local | UC-007 |
| FR-SCREEN-R12 | Perfil | 002-004 | Elegir/gestionar perfil | local, invitado, cuenta futura | UC-007/012 |

## Admin

| ID | Pantalla | Perfil | Acción principal | Estados específicos | Casos |
|---|---|---|---|---|---|
| FR-SCREEN-A01 | Login | 005-007 | Iniciar sesión | inicial, inválido, bloqueado | UC-006 |
| FR-SCREEN-A02 | Dashboard | 005-007 | Continuar trabajo | vacío, alertas, trabajos activos | UC-001/010 |
| FR-SCREEN-A03 | Lista de contenido | 005-006 | Abrir/crear contenido | vacío, filtros, permiso | UC-001 |
| FR-SCREEN-A04 | Crear contenido | 005 | Crear borrador | limpio, inválido, guardando | UC-001/008 |
| FR-SCREEN-A05 | Editar contenido | 005 | Guardar cambios | guardado, pendiente, conflicto, error | UC-001/008 |
| FR-SCREEN-A06 | Capítulos/párrafos | 005 | Editar estructura | vacío, reordenando, inválido | UC-001 |
| FR-SCREEN-A07 | Traducciones | 005-006 | Asociar traducción | faltante, desalineada, completa | UC-001 |
| FR-SCREEN-A08 | Voz | 005 | Elegir voces | no elegida, incompatible, válida | UC-001 |
| FR-SCREEN-A09 | Procesamiento | 005-007 | Procesar/reintentar | cola, progreso, fallo, cancelado | UC-001/010 |
| FR-SCREEN-A10 | Revisión | 006 | Aprobar/rechazar | pendiente, defecto, válida | UC-001 |
| FR-SCREEN-A11 | Previsualización | 005-006 | Reproducir versión | audio faltante, desalineada, válida | UC-001/002 |
| FR-SCREEN-A12 | Publicación | 006 | Publicar | bloqueada, confirmación, publicada | UC-001/006 |
| FR-SCREEN-A13 | Historial/auditoría | 006-007 | Investigar cambio | vacío, filtrado, detalle | UC-001/010 |
| FR-SCREEN-A14 | Errores/trabajos | 007 | Diagnosticar/reintentar | activo, fallido, límite, resuelto | UC-010 |

## Estados globales obligatorios

| Estado | Comportamiento mínimo |
|---|---|
| Inicial | Explica acción posible sin contenido fantasma |
| Vacío | Razón y acción apropiada |
| Cargando | Conserva contexto; permite cancelar cuando corresponda |
| Éxito | Confirma resultado sin bloquear siguiente acción |
| Error recuperable | Explica conservación y ofrece reintento |
| Error no recuperable | Ruta segura y correlation ID cuando aplique |
| Offline | Mantiene funciones locales y señala pendientes |
| Sincronización pendiente | No se presenta como guardado remoto |
| Permiso insuficiente | No ejecuta efectos ni revela información |
| Incompatible/retirado | No activa paquete y ofrece alternativa |

## Cobertura

- Pantallas Reader mínimas: 12 de 12.
- Pantallas Admin mínimas: 14 de 14.
- Casos cubiertos: FR-UC-001, FR-UC-002, FR-UC-003, FR-UC-004, FR-UC-005, FR-UC-006,
  FR-UC-007, FR-UC-008, FR-UC-009, FR-UC-010, FR-UC-011 y FR-UC-012.
- Perfiles cubiertos: FR-PERSONA-001, FR-PERSONA-002, FR-PERSONA-003, FR-PERSONA-004,
  FR-PERSONA-005, FR-PERSONA-006 y FR-PERSONA-007.
- Estados globales aplicables definidos: 10.
- Separación Admin/Reader: PASS.
