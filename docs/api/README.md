# Documentación de API

OpenAPI generado por FastAPI en `/docs` es la referencia de contratos ejecutables.

## Catálogo público

### `GET /catalog`

Devuelve `items`, `total`, `limit` y `offset`. Acepta:

- `language`: `en` o `es`;
- `content_type`: `story`, `article`, `book` o `lesson`;
- `audience`: `children`, `teenager`, `adult` o `all`;
- `reading_level`: código de nivel;
- `category`: slug de categoría;
- `limit`: 1 a 100;
- `offset`: entero no negativo.

Cada resumen incluye versión, idiomas, checksum, URL de paquete y versión mínima de la aplicación.
La lista sólo expone publicaciones activas con versión `published` y paquete completo.

### `GET /catalog/{slug}`

Devuelve el resumen más traducciones, capítulos y párrafos ordenados. Un slug inexistente, borrador,
inactivo o incompleto responde como `content.not_found`.

Los errores estables están documentados en `docs/api/ERRORS.md`. Autenticación y endpoints
administrativos permanecen fuera de esta fase.
