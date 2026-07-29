# Inventario de pruebas

FollowRead es un monorepo y conserva las pruebas unitarias cerca del código que validan. Esta
carpeta es el índice transversal; no se moverán pruebas sólo para imitar una estructura genérica.

| Categoría | Ubicación actual |
|---|---|
| Unitarias y componentes web | `apps/*/src/**/*.test.ts(x)` y `packages/*/src/**/*.test.ts` |
| API e integración | `apps/api/tests/` |
| Contratos | OpenAPI, schemas API, package integrity y pruebas de catálogo |
| E2E | `scripts/verify-*-e2e.mjs` |
| Regresión | `scripts/run-regression.mjs` |
| Seguridad | pruebas de auth/permisos, auditorías y `docs/architecture/PHASE_12_SECURITY_AUDIT.md` |
| Rendimiento | `scripts/load-test.mjs` y `scripts/verify-quality-budget.mjs` |
| Fixtures | datos dentro de cada suite y `apps/reader/public/offline/bootstrap.json` |

Las brechas y el estado de las trece categorías obligatorias se controlan en
[`docs/testing/PRE_DEPLOYMENT_TESTS.md`](../docs/testing/PRE_DEPLOYMENT_TESTS.md).

Si una fixture es compartida por varias aplicaciones, debe crearse en `test/fixtures/` con
procedencia, licencia, contenido esperado y política de actualización documentadas.
