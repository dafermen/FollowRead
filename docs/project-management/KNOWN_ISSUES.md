# Problemas conocidos

## FR-ISSUE-001 - Proyecto sin repositorio Git

- **Estado:** RESOLVED
- **Severidad:** Medium
- **Síntoma:** `C:\Projects\FollowRead` sólo contiene el PDF maestro y no tiene `.git`.
- **Impacto:** No hay historial, ramas ni mecanismo seguro de reversión.
- **Resolución:** Repositorio inicializado sobre `main` en FR-PH02-TASK-001. Estructura y estado
  fueron comprobados con la identidad propietaria del directorio.

## FR-ISSUE-002 - Inconsistencia en tipos de contenido

- **Estado:** RESOLVED
- **Severidad:** Low
- **Síntoma:** La descripción incluye "documentos", pero los tipos enumerados son `story`,
  `article`, `book` y `lesson`.
- **Resolución:** FR-DEC-007 representa documentos como `article` hasta que exista una diferencia
  funcional.

## FR-ISSUE-003 - Funciones adultas sin modelo de datos explícito

- **Estado:** RESOLVED
- **Severidad:** Medium
- **Síntoma:** El modo adulto requiere notas y marcadores, pero las entidades iniciales no incluyen
  `Note` ni `Bookmark`.
- **Resolución:** FR-DEC-010 mantiene favoritos/progreso en MVP y aplaza notas libres.

## FR-ISSUE-004 - Reglas de cuentas infantiles no definidas

- **Estado:** RESOLVED_FOR_MVP
- **Severidad:** High
- **Síntoma:** Existe modo infantil, pero no se define si un niño posee cuenta o cómo consiente un
  adulto.
- **Resolución:** FR-DEC-009 prohíbe cuentas personales y datos identificables de menores en el MVP.
  Una capacidad futura requerirá revisión nueva.

## FR-ISSUE-005 - Docker no disponible

- **Estado:** RESOLVED_BY_SCOPE_CHANGE
- **Severidad:** Medium
- **Síntoma:** PowerShell no reconoce `docker` ni puede consultar `docker compose version`.
- **Impacto:** No se puede validar PostgreSQL local, healthcheck ni migraciones.
- **Acción requerida:** Instalar o iniciar Docker Desktop y asegurar que el CLI esté en `PATH`.
- **Tarea bloqueada:** FR-PH02-TASK-007.
- **Progreso seguro:** Compose, variables, DSN y validación estática están completos y pasan
  `pnpm check`; sólo quedan pruebas que requieren el runtime.
- **Auditoría repetida:** Confirmado en tres intentos. No existe `docker` en `PATH`, rutas habituales,
  registro de aplicaciones instaladas, procesos o servicios; tampoco existe Podman como runtime
  compatible disponible.
- **Resolución:** El propietario autorizó FR-DEC-013: SQLite reemplaza PostgreSQL/Docker en el MVP.
