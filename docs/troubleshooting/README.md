# Solución de problemas

Los documentos específicos se crearán cuando exista una implementación verificable. Cada guía
incluirá síntoma, causa probable, confirmación, archivos, diagnóstico, solución, validación y
prevención.

Áreas previstas: audio, Speech Marks, AWS, base de datos, autenticación, sincronización del Reader,
Capacitor Android/iOS, offline y despliegue.
# Solución de problemas

## `/health` responde pero `/ready` devuelve 503

El proceso está vivo, pero SQLite no acepta consultas. Revisar:

1. que `FOLLOWREAD_DATABASE_URL` empiece por `sqlite:///`;
2. que el directorio de la base exista y sea escribible por el proceso;
3. que `pnpm migrate` haya aplicado la cabeza de Alembic;
4. que no se haya movido o bloqueado `var/followread.db`.

No sustituir readiness por health en una comprobación de despliegue.

## Correlacionar un error 500

Copiar el valor `X-Request-ID` de la respuesta o `error.details.request_id` y buscarlo en los logs
JSON. La respuesta no contiene trazas ni detalles de base de datos por diseño.

## El catálogo está vacío

Confirmar que la publicación esté activa, la versión tenga estado `published`, y existan `checksum`
y `package_url`. Borradores, publicaciones inactivas y paquetes incompletos se excluyen.
