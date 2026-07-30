# Workspace conventions

## Boundaries

- `apps/admin-web` and `apps/reader` are independent React applications.
- `apps/api` is a Python application and does not belong to the pnpm workspace.
- Packages in `packages/` do not import code from `apps/`.
- `reader-engine`, `shared-types`, and `content-models` do not depend on React or the DOM.
- `shared-ui` contains primitives, not screens or Admin-specific permissions.
- AWS credentials and SDK may only appear in adapters of `apps/api`.

## TypeScript

All packages extend `tsconfig.base.json`. The common configuration enables `strict`,
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and return and control-flow checks. Packages publish ESM from `dist/` and their internal imports include the extension `.js` to be valid after compilation.

## Dependencies

- Internal dependencies use `workspace:*`.
- External versions are pinned in manifests or in the root catalog.
- Do not add a package without immediate use and an associated task.
- Any additional orchestrator requires an architectural decision based on evidence.

## Commands

Root scripts iterate only over projects that implement the requested command. The full gate
will be consolidated in FR-PH02-TASK-005 and FR-PH02-TASK-009.
