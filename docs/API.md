# API

Esta es la entrada canónica a la API de FollowRead.

## Desarrollo local

- Base URL: `http://localhost:8000`
- Readiness: `GET /ready`
- Salud: `GET /health`
- OpenAPI interactivo: `http://localhost:8000/docs`
- Esquema OpenAPI: `http://localhost:8000/openapi.json`

La API usa FastAPI, SQLAlchemy, Alembic y SQLite en el MVP. La configuración pública de ejemplo
está en `apps/api/.env.example`.

## Contratos principales

- autenticación y sesiones administrativas;
- catálogo público y paquetes de lectura;
- administración editorial protegida por permisos;
- sincronización idempotente de progreso;
- salud, readiness, métricas y request IDs.

## Fuentes detalladas

- [Guía de la API](api/README.md)
- [Formato de errores](api/ERRORS.md)
- [Modelo de datos](architecture/DATA_MODEL.md)
- [Seguridad](SECURITY.md)
- [Variables de entorno](development/ENVIRONMENT_VARIABLES.md)
- [Pruebas previas al despliegue](testing/PRE_DEPLOYMENT_TESTS.md)

El contrato ejecutable es OpenAPI. Cualquier cambio incompatible requiere prueba de contrato,
actualización documental y una decisión explícita de versionado.
