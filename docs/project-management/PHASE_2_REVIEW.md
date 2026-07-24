# Revisión de cierre de Fase 2

**Fecha:** 2026-07-24  
**Resultado:** PASS  
**Tarea:** FR-PH02-TASK-011  
**Commit auditado:** `c348ca1`

## Criterios de salida

| # | Criterio | Evidencia | Resultado |
|---:|---|---|---|
| 1 | Admin, Reader y API separados y ejecutables | workspaces, builds y pruebas de humo | PASS |
| 2 | Tipos, lint y formato configurados | TypeScript strict, mypy, ESLint, Ruff y Prettier | PASS |
| 3 | Pruebas base y builds pasan | 12 pruebas y 100% de cobertura base | PASS |
| 4 | SQLite y migraciones funcionan sin servicios | conexión real y Alembic upgrade/downgrade | PASS |
| 5 | Variables documentadas sin secretos | ejemplos raíz/API y catálogo de variables | PASS |
| 6 | Scripts, hooks y CI usan la misma puerta | `check`, `check:fast`, pre-commit y `ci` | PASS |
| 7 | Instalación limpia documentada y verificada | clon Git de `c348ca1`, instalación y puerta completa | PASS |

## Evidencia de clon limpio

1. Se clonó el repositorio en un directorio sin dependencias ni entorno virtual.
2. `pnpm install --frozen-lockfile` instaló los nueve proyectos del workspace.
3. `pnpm setup:python` creó `apps/api/.venv` e instaló la API editable.
4. `pnpm hooks:install` y `pnpm hooks:verify` pasaron.
5. `pnpm migrate` creó SQLite y aplicó la cabeza `20260724_0001`.
6. `pnpm check` pasó formato, lint, tipos, pruebas, cobertura y builds.

La auditoría detectó y corrigió dos problemas reales antes del cierre:

- Pytest usaba una carpeta temporal global sin permisos; ahora usa `.pytest-temp/`.
- Git convertía archivos a CRLF en clones Windows aunque Prettier exige LF; `.gitattributes`
  fuerza LF para texto y conserva CRLF únicamente para PowerShell.

## Evidencia cuantitativa

- 9 proyectos en el workspace.
- 5 pruebas JavaScript/TypeScript aprobadas.
- 7 pruebas Python aprobadas.
- 100% de cobertura en los scaffolds actuales.
- 1 cabeza Alembic con upgrade, downgrade y upgrade probados.
- 0 servicios externos, credenciales o contenedores requeridos.
- 0 bloqueadores críticos abiertos.

## Deuda permitida

- PostgreSQL queda como evolución posterior al MVP conforme a FR-DEC-013.
- La ejecución real de GitHub Actions ocurrirá al publicar el repositorio remoto.
- Los modelos y tablas funcionales pertenecen a Fase 3.

Esta deuda no impide modelar datos ni construir la API base.

## Secuencia

1. FR-PH02-TASK-011 pasó de `NOT_STARTED` a `READY_FOR_REVIEW`.
2. La auditoría limpia detectó y resolvió la política de saltos de línea.
3. El clon final pasó instalación, migración y puerta completa.
4. FR-PH02-TASK-011 cambia a `COMPLETED`.
5. Fase 3 se activa después de registrar sus tareas y criterios.
