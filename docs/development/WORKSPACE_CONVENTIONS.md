# Convenciones del workspace

## Límites

- `apps/admin-web` y `apps/reader` son aplicaciones React independientes.
- `apps/api` es una aplicación Python y no pertenece al workspace pnpm.
- Los paquetes de `packages/` no importan código desde `apps/`.
- `reader-engine`, `shared-types` y `content-models` no dependen de React ni del DOM.
- `shared-ui` contiene primitivas, no pantallas ni permisos propios de Admin.
- Credenciales y SDK de AWS sólo pueden aparecer en adaptadores de `apps/api`.

## TypeScript

Todos los paquetes extienden `tsconfig.base.json`. La configuración común activa `strict`,
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` y comprobaciones de retorno y control de
flujo. Los paquetes publican ESM desde `dist/` y sus imports internos incluyen extensión `.js` para
ser válidos después de compilar.

## Dependencias

- Las dependencias internas usan `workspace:*`.
- Las versiones externas se fijan en los manifiestos o en el catálogo raíz.
- No se añade un paquete sin uso inmediato y una tarea asociada.
- Un orquestador adicional requiere una decisión arquitectónica basada en evidencia.

## Comandos

Los scripts raíz recorren sólo los proyectos que implementan el comando solicitado. La puerta
completa se consolidará en FR-PH02-TASK-005 y FR-PH02-TASK-009.
