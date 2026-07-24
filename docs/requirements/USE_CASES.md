# Casos de uso

**Estado:** Validado para Fase 0 - FR-PH00-TASK-007 COMPLETED.

## FR-UC-001 - Publicar contenido bilingüe

- **Actor principal:** Editor / Revisor / Publicador
- **Precondiciones:** Usuarios autenticados; permisos adecuados; contenido en draft.
- **Disparador:** El editor decide preparar una versión.
- **Flujo principal:**
  1. El editor estructura capítulos y párrafos.
  2. Asocia idiomas, audiencia, nivel, categorías y voces.
  3. Solicita procesamiento.
  4. API valida, crea trabajo y genera audio/marcas mediante servicios.
  5. El revisor previsualiza la sincronización.
  6. El revisor aprueba.
  7. El publicador publica una versión inmutable.
  8. El catálogo remoto expone la nueva versión.
- **Alternos:** Validación fallida; procesamiento parcial; revisión rechazada; permiso insuficiente.
- **Postcondición:** Existe una versión publicada auditada o el estado conserva una explicación.
- **Historias:** FR-US-ADMIN-001, 003, 004, 005, 006.

## FR-UC-002 - Reproducir lectura sincronizada

- **Actor principal:** Lector
- **Precondiciones:** Contenido, audio y Speech Marks válidos disponibles.
- **Disparador:** El lector selecciona reproducir.
- **Flujo principal:**
  1. Reader carga la versión y el progreso.
  2. Reader Engine inicia audio.
  3. Cada cambio temporal resuelve una palabra activa.
  4. La interfaz resalta la palabra y posiciona la mano si está habilitada.
  5. El texto se desplaza sólo cuando la palabra sale del área segura.
  6. El progreso se guarda periódicamente y en eventos relevantes.
- **Alternos:** Audio ausente; marcas inválidas; resize; orientación; pausa; interrupción.
- **Postcondición:** La lectura continúa o muestra un error recuperable sin perder progreso.
- **Historias:** FR-US-READER-001, 002, 003, 005.

## FR-UC-003 - Descargar y leer offline

- **Actor principal:** Lector
- **Precondiciones:** Conexión disponible para descargar; almacenamiento suficiente.
- **Disparador:** El lector elige descargar.
- **Flujo principal:**
  1. Reader obtiene metadatos y compatibilidad.
  2. Descarga a un área temporal.
  3. Verifica checksum y contenido requerido.
  4. Activa el paquete atómicamente.
  5. Sin conexión, abre texto, imágenes, audio y marcas locales.
  6. Guarda cambios locales para sincronización posterior.
- **Alternos:** Red interrumpida; checksum inválido; versión incompatible; espacio insuficiente.
- **Postcondición:** Existe un paquete completo válido o se conserva la versión anterior.
- **Historias:** FR-US-READER-004, FR-US-READER-009.

## FR-UC-004 - Actualizar contenido descargado

- **Actor principal:** Reader
- **Precondiciones:** Catálogo local presente; backend disponible.
- **Disparador:** Inicio, refresco o tarea programada apropiada.
- **Flujo principal:**
  1. Compara IDs y versiones.
  2. Filtra versiones incompatibles.
  3. Descarga sólo cambios.
  4. Valida y activa la nueva versión.
  5. Migra o ancla progreso cuando sea posible.
- **Alternos:** Actualización corrupta; contenido retirado; conflicto de progreso.
- **Postcondición:** Reader conserva una versión válida y comunica el resultado.
- **Historias:** FR-US-READER-003, 004, 009.

## FR-UC-005 - Aprender inglés durante la lectura

- **Actor principal:** Estudiante
- **Precondiciones:** Contenido inglés con apoyos editoriales disponibles.
- **Disparador:** Activa modo aprender inglés.
- **Flujo principal:**
  1. Ve texto inglés y traducción opcional.
  2. Toca una palabra para escucharla.
  3. Consulta significado contextual.
  4. Repite palabra u oración y reduce velocidad.
  5. Guarda la palabra en vocabulario.
- **Alternos:** Traducción no disponible; offline; palabra ya guardada.
- **Postcondición:** La lectura no pierde posición y el vocabulario queda local o sincronizado.
- **Historias:** FR-US-READER-007, 008.

## FR-UC-006 - Rechazar una acción sin permiso

- **Actor principal:** Usuario autenticado sin permiso
- **Precondiciones:** Sesión válida con rol insuficiente.
- **Disparador:** Intenta aprobar, publicar o administrar.
- **Flujo principal:**
  1. API evalúa la autorización.
  2. Deniega sin ejecutar efectos secundarios.
  3. Registra el evento apropiado.
  4. El cliente presenta un mensaje seguro.
- **Postcondición:** Datos y estado permanecen sin cambios.
- **Historias:** FR-US-SECURITY-001.

## FR-UC-007 - Configurar una sesión accesible

- **Actor principal:** Lector o tutor.
- **Precondiciones:** Reader disponible; no se requiere cuenta.
- **Disparador:** Abre configuración o preparación de sesión.
- **Flujo principal:**
  1. Elige modo infantil/adulto/aprender inglés.
  2. Ajusta idioma, tamaño, velocidad, mano y movimiento.
  3. Reader presenta una vista previa comprensible.
  4. Guarda preferencias en perfil local.
  5. Inicia la lectura con las preferencias aplicadas.
- **Alternos:** Preferencias del sistema contradicen animación; almacenamiento local no disponible.
- **Accesibilidad:** Todo funciona con teclado, foco visible y anuncios de estado.
- **Postcondición:** La lectura es utilizable aunque la mano esté oculta.
- **Historias:** FR-US-CHILD-001, FR-US-TUTOR-001, FR-US-ADULT-001, FR-US-READER-005.

## FR-UC-008 - Recuperar un borrador editorial

- **Actor principal:** Editor.
- **Precondiciones:** Borrador iniciado y permiso de edición.
- **Disparador:** Regresa tras cierre, caída o pérdida de red.
- **Flujo principal:**
  1. Admin detecta cambios locales o remotos recuperables.
  2. Informa qué versión y hora se recuperarán.
  3. El editor acepta o compara cuando existe conflicto.
  4. Admin restaura y vuelve a indicar estado de guardado.
- **Alternos:** Borrador corrupto; sesión expirada; edición por otro usuario.
- **Postcondición:** No se sobrescribe silenciosamente una versión más nueva.
- **Historias:** FR-US-ADMIN-002.

## FR-UC-009 - Resolver progreso pendiente

- **Actor principal:** Reader.
- **Precondiciones:** Existe progreso local pendiente y vuelve la conexión.
- **Disparador:** Evento de conectividad o sincronización manual.
- **Flujo principal:**
  1. Reader envía operación con ID idempotente.
  2. API valida propiedad y versión.
  3. Aplica política de anclaje sin retroceder silenciosamente.
  4. Confirma y Reader elimina sólo la operación confirmada.
- **Alternos:** Token expirado; versión retirada; conflicto; reenvío.
- **Postcondición:** El usuario ve estado sincronizado o pendiente explicable.
- **Historias:** FR-US-READER-003, FR-US-READER-009.

## FR-UC-010 - Operar un trabajo fallido

- **Actor principal:** Operador.
- **Precondiciones:** Trabajo en `processing_failed`.
- **Disparador:** Abre detalle del error.
- **Flujo principal:**
  1. Admin muestra etapa, código seguro, correlation ID y recursos conservados.
  2. El operador corrige configuración o solicita reintento.
  3. API usa clave idempotente y registra la acción.
  4. El trabajo progresa o falla con nueva evidencia.
- **Alternos:** Sin permiso; límite de costo; contenido cambió; proveedor no disponible.
- **Postcondición:** No hay publicación o costo duplicado silencioso.
- **Historias:** FR-US-ADMIN-006, FR-US-OPS-001.

## FR-UC-011 - Explorar y abrir contenido

- **Actor principal:** Lector.
- **Precondiciones:** Existe catálogo local o remoto válido.
- **Disparador:** Abre biblioteca.
- **Flujo principal:**
  1. Reader combina catálogos sin duplicar contenido.
  2. Muestra categorías, idioma, nivel y disponibilidad.
  3. El lector busca o filtra.
  4. Abre detalle y elige idioma/modo compatible.
  5. Inicia lectura o descarga.
- **Alternos:** Sin red; catálogo vacío; versión incompatible; contenido retirado.
- **Postcondición:** Se abre un recurso válido o se explica una acción posible.
- **Historias:** FR-US-READER-004, FR-US-READER-006.

## FR-UC-012 - Gestionar datos personales de lectura

- **Actor principal:** Lector.
- **Precondiciones:** Perfil local o cuenta autorizada.
- **Disparador:** Guarda favorito/vocabulario, consulta historial o elimina una descarga.
- **Flujo principal:**
  1. Reader aplica cambio local inmediatamente.
  2. Registra operación sincronizable cuando corresponde.
  3. Comunica estado local/pendiente.
  4. API confirma de forma idempotente cuando hay cuenta y conexión.
- **Alternos:** Sin cuenta; sin red; elemento duplicado; token expirado; eliminación local.
- **Postcondición:** El dato queda local, sincronizado o pendiente sin pérdida silenciosa.
- **Historias:** FR-US-READER-003, FR-US-READER-007, FR-US-READER-009.

## Walkthrough documental

| Riesgo/alterno | Casos | Resultado |
|---|---|---|
| Offline/descarga corrupta | FR-UC-003/004/009 | PASS |
| Audio/marcas inválidas | FR-UC-001/002/010 | PASS |
| Permiso insuficiente | FR-UC-001/006/010 | PASS |
| Accesibilidad/preferencias | FR-UC-002/007 | PASS |
| Pérdida de borrador/progreso | FR-UC-008/009 | PASS |
| Cuenta infantil | FR-UC-007 + FR-DEC-009 | PASS |
| Catálogo vacío/incompatible | FR-UC-011 | PASS |
| Datos locales/sincronizados | FR-UC-009/012 | PASS |
