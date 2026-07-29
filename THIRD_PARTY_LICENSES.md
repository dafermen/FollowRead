# Licencias de terceros

**Estado:** PENDING_BEFORE_EXTERNAL_DISTRIBUTION

Las dependencias exactas están fijadas por `pnpm-lock.yaml` y `apps/api/pyproject.toml`. Antes de una
distribución externa se debe:

1. generar el inventario completo de dependencias JavaScript y Python del artefacto candidato;
2. registrar nombre, versión, licencia, copyright y texto exigido;
3. revisar compatibilidad con la licencia definitiva de FollowRead;
4. incluir avisos y textos completos requeridos en el artefacto distribuido;
5. aprobar el inventario como parte de compatibilidad y despliegue.

Este archivo no afirma que la revisión legal esté terminada. `package.json` permanece
`UNLICENSED` y FR-DEC-OPEN-004 continúa abierta.
