# Architecture Decision Records

Los ADR registran decisiones arquitectónicas con contexto, consecuencias y estado. El historial
completo y sus IDs canónicos permanece en
[`docs/project-management/DECISIONS.md`](../project-management/DECISIONS.md).

## Registros

- [ADR-0001: SQLite para el MVP](0001-sqlite-mvp.md), corresponde a FR-DEC-013.
- [ADR-0002: contenedores opcionales](0002-optional-containers.md), corresponde a FR-DEC-019.

## Regla

Crear un ADR cuando una decisión cambie límites, persistencia, seguridad, contratos, proveedores,
operación o despliegue. No reescribir decisiones aceptadas: crear un ADR nuevo que las sustituya y
enlazar ambos estados.
