# Arquitectura

Este documento es la entrada canónica a la arquitectura de FollowRead. Los detalles viven en
`docs/architecture/` y no se duplican aquí.

## Vista general

FollowRead es un monorepo con tres aplicaciones:

- `apps/admin-web`: administración editorial en React/Vite;
- `apps/reader`: lector React/Vite, PWA y base Capacitor para Android/iOS;
- `apps/api`: API FastAPI con SQLAlchemy, Alembic y SQLite para el MVP.

Los contratos y componentes reutilizables están en `packages/`. La infraestructura opcional de
empaquetado y despliegue está en `infrastructure/`.

## Principios vigentes

- Admin, Reader y API se despliegan como artefactos separados.
- Reader Engine no depende de React, DOM ni infraestructura.
- SQLite es la base autoritativa del MVP.
- AWS y Amazon Polly sólo pueden aparecer detrás de adaptadores de la API; el proveedor local
  `fake` debe seguir funcionando sin credenciales.
- Docker es opcional para desarrollo y obligatorio sólo cuando se valide el empaquetado.
- No se almacenan cuentas personales ni PII de menores.

## Fuentes detalladas

- [Contexto del sistema](architecture/SYSTEM_CONTEXT.md)
- [Arquitectura inicial](architecture/INITIAL_ARCHITECTURE.md)
- [Modelo de datos](architecture/DATA_MODEL.md)
- [Reader Engine](architecture/READER_ENGINE.md)
- [Modo offline](architecture/OFFLINE_MODE.md)
- [Observabilidad](architecture/OBSERVABILITY.md)
- [Modelo de amenazas](architecture/THREAT_MODEL.md)
- [Registro de decisiones](project-management/DECISIONS.md)
- [ADR](adr/README.md)

## Regla de cambio

Un cambio de límites, persistencia, seguridad, proveedores o despliegue requiere actualizar el
documento detallado correspondiente y registrar una decisión o ADR antes de considerarse cerrado.
