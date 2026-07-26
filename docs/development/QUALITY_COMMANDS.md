# Puerta de calidad

## Comando principal

```powershell
pnpm check
```

La puerta se detiene ante el primer error y ejecuta, en orden:

1. Validador estático de GitHub Actions.
2. Validador de frontera, permisos y recursos móviles.
3. Prettier para código y configuración JS/TS.
4. Ruff format para Python.
5. ESLint con reglas estrictas y tipadas.
6. Ruff lint.
7. TypeScript strict en aplicaciones y paquetes.
8. mypy strict en API y pruebas.
9. Vitest con cobertura para Admin, Reader y configuración.
10. pytest con SQLite/Alembic, cobertura y advertencias como errores.
11. builds de todas las aplicaciones y paquetes TypeScript.

## Comandos parciales

| Objetivo | Comando |
|---|---|
| Formato | `pnpm format:check` |
| Lint | `pnpm lint` |
| Tipos | `pnpm typecheck` |
| Pruebas y cobertura | `pnpm test` |
| Builds | `pnpm build` |
| Migrar SQLite | `pnpm migrate` |
| Puerta rápida del hook | `pnpm check:fast` |
| Verificar hooks | `pnpm hooks:verify` |
| Validar móvil | `pnpm mobile:validate` |
| Diagnosticar SDKs | `pnpm mobile:doctor` |
| E2E móvil web | `pnpm reader:mobile-e2e` |
| APK Android debug | `pnpm mobile:build:android` |

`scripts/run-python.mjs` selecciona el ejecutable del entorno virtual en Windows o sistemas tipo Unix.
Si el entorno no existe, falla con una instrucción explícita y no usa silenciosamente otro Python.
El hook pre-commit ejecuta la puerta rápida y nunca modifica archivos automáticamente.

## Cobertura base

Los scaffolds de Admin, Reader y API exigen 100% sobre el código base intencionalmente incluido. Los
umbrales crecerán con el producto y podrán diferenciar código crítico, pero no se reducirán para
ocultar líneas sin prueba.
