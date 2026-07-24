# Historias de usuario

**Estado:** Validado para Fase 0 - FR-PH00-TASK-007 COMPLETED.

## Reader

### FR-US-CHILD-001 - Iniciar una lectura segura

Como lector infantil, quiero iniciar una historia con pocos controles y sin acceso a administración
para poder concentrarme y evitar acciones accidentales.

- **Prioridad:** Must
- **Perfil:** FR-PERSONA-001
- **Requisitos:** FR-READER-011, FR-READER-015, NFR-PRIVACY-002

### FR-US-TUTOR-001 - Preparar una sesión acompañada

Como tutor, quiero elegir modo, idioma, tamaño y movimiento antes de entregar el dispositivo para
ofrecer una experiencia apropiada sin crear una cuenta infantil.

- **Prioridad:** Should
- **Perfil:** FR-PERSONA-004
- **Requisitos:** FR-READER-011, FR-READER-015, FR-DEC-009

### FR-US-ADULT-001 - Adaptar una lectura larga

Como lector adulto, quiero usar una presentación sobria, ocultar la mano y ajustar texto/tema para
leer durante sesiones largas.

- **Prioridad:** Must
- **Perfil:** FR-PERSONA-003
- **Requisitos:** FR-READER-011, FR-READER-015

### FR-US-READER-001 - Seguir una narración

Como lector, quiero ver qué palabra se pronuncia para mantener mi atención y relacionar sonido con
texto.

- **Prioridad:** Must
- **Requisitos:** FR-READER-003 a FR-READER-006

### FR-US-READER-002 - Controlar la reproducción

Como lector, quiero pausar, continuar, retroceder, repetir y cambiar velocidad para adaptar la lectura
a mi ritmo.

- **Prioridad:** Must
- **Requisitos:** FR-READER-007, FR-READER-008

### FR-US-READER-003 - Reanudar donde quedé

Como lector, quiero recuperar mi posición para no buscar manualmente el último punto.

- **Prioridad:** Must
- **Requisitos:** FR-READER-009, FR-API-004

### FR-US-READER-004 - Leer sin conexión

Como lector, quiero descargar contenido y abrirlo sin red para leer en cualquier lugar.

- **Prioridad:** Must
- **Requisitos:** FR-OFFLINE-001 a FR-OFFLINE-005

### FR-US-READER-005 - Ajustar la experiencia

Como lector, quiero ocultar la mano, reducir movimiento y ajustar texto para leer cómodamente.

- **Prioridad:** Must
- **Requisitos:** FR-READER-015

### FR-US-READER-006 - Explorar la biblioteca

Como lector, quiero buscar y filtrar contenido por categoría, idioma y nivel para encontrar algo
apropiado.

- **Prioridad:** Must
- **Requisitos:** FR-READER-001, FR-READER-002

### FR-US-READER-007 - Aprender una palabra

Como estudiante de inglés, quiero tocar, escuchar, traducir y guardar una palabra para estudiarla
después.

- **Prioridad:** Should
- **Requisitos:** FR-READER-013, FR-READER-014

### FR-US-READER-008 - Repetir una oración

Como estudiante de inglés, quiero repetir una oración lentamente para mejorar comprensión y
pronunciación.

- **Prioridad:** Must
- **Requisitos:** FR-READER-008, FR-READER-013

### FR-US-READER-009 - Conocer el estado de sincronización

Como lector, quiero saber si mi descarga o progreso están pendientes para confiar en la aplicación.

- **Prioridad:** Must
- **Requisitos:** FR-OFFLINE-007, FR-OFFLINE-008

## Admin

### FR-US-ADMIN-001 - Crear contenido bilingüe

Como editor, quiero estructurar texto en inglés y español para publicar una experiencia relacionada.

- **Prioridad:** Must
- **Requisitos:** FR-ADMIN-002, FR-ADMIN-003

### FR-US-ADMIN-002 - Evitar pérdida de borradores

Como editor, quiero autoguardado e indicadores claros para no perder trabajo.

- **Prioridad:** Must
- **Requisitos:** FR-ADMIN-006

### FR-US-ADMIN-003 - Procesar audio

Como editor, quiero seleccionar voces y solicitar audio para preparar el contenido.

- **Prioridad:** Must
- **Requisitos:** FR-ADMIN-004, FR-ADMIN-007, FR-AUDIO-001 a FR-AUDIO-006

### FR-US-ADMIN-004 - Revisar sincronización

Como revisor, quiero previsualizar texto, audio y palabras activas para detectar errores.

- **Prioridad:** Must
- **Requisitos:** FR-ADMIN-008, FR-AUDIO-005

### FR-US-ADMIN-005 - Publicar con seguridad

Como publicador, quiero aprobar y publicar sólo una versión válida para proteger a los lectores.

- **Prioridad:** Must
- **Requisitos:** FR-ADMIN-009, FR-CONTENT-005 a FR-CONTENT-007

### FR-US-ADMIN-006 - Recuperar un procesamiento fallido

Como operador, quiero conocer el error y reintentar sin duplicar contenido.

- **Prioridad:** Must
- **Requisitos:** FR-ADMIN-010, FR-AUDIO-006

## Operación y seguridad

### FR-US-SECURITY-001 - Administrar por permisos

Como propietario, quiero que cada rol realice sólo acciones autorizadas.

- **Prioridad:** Must
- **Requisitos:** FR-API-001, FR-API-002

### FR-US-OPS-001 - Diagnosticar un fallo

Como operador, quiero relacionar solicitudes, trabajos y errores sin exponer datos sensibles.

- **Prioridad:** Must
- **Requisitos:** FR-API-005, NFR-OBSERVABILITY-001

## Cobertura por perfil

| Perfil | Historias principales | Cobertura |
|---|---|---|
| FR-PERSONA-001 | FR-US-CHILD-001, FR-US-READER-001/002/003/004/005 | COVERED |
| FR-PERSONA-002 | FR-US-READER-001/002/003/007/008 | COVERED |
| FR-PERSONA-003 | FR-US-ADULT-001, FR-US-READER-002/003/004/005/006 | COVERED |
| FR-PERSONA-004 | FR-US-TUTOR-001 | COVERED |
| FR-PERSONA-005 | FR-US-ADMIN-001/002/003 | COVERED |
| FR-PERSONA-006 | FR-US-ADMIN-004/005 | COVERED |
| FR-PERSONA-007 | FR-US-ADMIN-006, FR-US-OPS-001, FR-US-SECURITY-001 | COVERED |

## Validación

- Cada perfil tiene al menos una historia: PASS.
- Lectura, publicación, offline, aprendizaje, accesibilidad y permisos están cubiertos: PASS.
- Todas las historias enlazan requisitos o decisiones: PASS.
