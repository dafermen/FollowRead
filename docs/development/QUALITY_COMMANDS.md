# Puerta de calidad

## Comando principal

```powershell
pnpm check
```

La puerta se detiene ante el primer error y ejecuta, en orden:

1. Validador estático de GitHub Actions.
2. Prettier para código y configuración JS/TS.
3. Ruff format para Python.
4. ESLint con reglas estrictas y tipadas.
5. Ruff lint.
6. TypeScript strict en aplicaciones y paquetes.
7. mypy strict en API y pruebas.
8. Vitest con cobertura para Admin, Reader y configuración.
9. pytest con SQLite/Alembic, cobertura y advertencias como errores.
10. builds de todas las aplicaciones y paquetes TypeScript.

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

`scripts/run-python.mjs` selecciona el ejecutable del entorno virtual en Windows o sistemas tipo Unix.
Si el entorno no existe, falla con una instrucción explícita y no usa silenciosamente otro Python.
El hook pre-commit ejecuta la puerta rápida y nunca modifica archivos automáticamente.

## Cobertura base

Los scaffolds de Admin, Reader y API exigen 100% sobre el código base intencionalmente incluido. Los
umbrales crecerán con el producto y podrán diferenciar código crítico, pero no se reducirán para
ocultar líneas sin prueba.
