# Política inicial de datos

**Estado:** Aprobada para diseño de MVP  
**Tarea responsable:** FR-PH00-TASK-006 - COMPLETED

## Principios

1. Recopilar lo mínimo.
2. Definir propósito antes de crear un campo.
3. Separar contenido editorial, datos operativos y datos de usuario.
4. No almacenar PII de menores en el MVP.
5. Permitir lectura local sin cuenta.
6. No incluir datos sensibles en logs.
7. Diseñar exportación y eliminación antes de habilitar cuentas Reader.

## Inventario inicial

| Categoría | Datos | Propósito | Ubicación | Retención inicial |
|---|---|---|---|---|
| Admin | email/identificador, hash, roles | Acceso editorial | API/SQLite | Mientras esté activa + política |
| Contenido | texto, traducción, metadatos | Publicación/lectura | SQLite/S3/local | Por versión/política editorial |
| Recursos | audio, marcas, imágenes | Lectura sincronizada | S3/local | Por versión |
| Auditoría | actor, acción, objetivo, resultado | Seguridad/trazabilidad | SQLite/logs | >=365 días |
| Trabajo | etapa, error seguro, costo estimado | Procesamiento/diagnóstico | SQLite/logs | 90 días tras terminar |
| Perfil local | preferencias y alias no identificable | Personalización | Dispositivo | Hasta borrar app/datos |
| Progreso | contenido, versión, anclaje, fecha | Reanudar/sincronizar | Local/API opcional | Hasta eliminación |
| Favoritos | IDs de contenido | Biblioteca personal | Local/API opcional | Hasta eliminación |
| Vocabulario | palabra, contexto, contenido | Aprendizaje | Local/API opcional | Hasta eliminación |

## Menores

El MVP:

- no solicita nombre legal, email, fecha de nacimiento, escuela o ubicación de un menor;
- no crea una cuenta personal infantil;
- no envía analítica identificable de uso infantil;
- permite un perfil local no identificable o una sesión supervisada;
- no presenta el perfil local como mecanismo legal de consentimiento.

Antes de cambiar estas reglas se requiere una decisión con jurisdicciones, edad, consentimiento,
relación tutor-menor, exportación, eliminación, retención y respuesta a solicitudes.

## Logs y telemetría

Permitido: correlation ID, identificadores internos, etapa, duración, código de error y conteos.

Prohibido por defecto: contraseñas, tokens, claves, texto completo privado, vocabulario personal,
correo en texto libre, datos de menores y URLs firmadas completas.

## Derechos y eliminación

- Los datos locales se pueden borrar desde configuración o datos de la plataforma.
- Una cuenta futura debe ofrecer solicitud de exportación y eliminación.
- Auditoría legalmente requerida puede conservarse separada y minimizada.
- Eliminar una descarga no elimina progreso remoto; el usuario debe distinguir ambas acciones.

## Validación

- Cada categoría tiene propósito, ubicación y retención: PASS.
- La política cumple FR-DEC-009: PASS.
- Logs tienen lista permitida/prohibida: PASS.
- La lectura local no depende de cuenta: PASS.
