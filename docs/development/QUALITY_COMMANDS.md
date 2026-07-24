# Puerta de calidad

## Comando principal

```powershell
pnpm check
```

La puerta se detiene ante el primer error y ejecuta, en orden:

1. Prettier para código y configuración JS/TS.
2. Ruff format para Python.
3. ESLint con reglas estrictas y tipadas.
4. Ruff lint.
5. TypeScript strict en aplicaciones y paquetes.
6. mypy strict en API y pruebas.
7. Vitest con cobertura para Admin y Reader.
8. pytest con cobertura y advertencias como errores.
9. builds de todas las aplicaciones y paquetes TypeScript.

## Comandos parciales

| Objetivo | Comando |
|---|---|
| Formato | `pnpm format:check` |
| Lint | `pnpm lint` |
| Tipos | `pnpm typecheck` |
| Pruebas y cobertura | `pnpm test` |
| Builds | `pnpm build` |

`scripts/run-python.mjs` selecciona el ejecutable del entorno virtual en Windows o sistemas tipo Unix.
Si el entorno no existe, falla con una instrucción explícita y no usa silenciosamente otro Python.

## Cobertura base

Los scaffolds de Admin, Reader y API exigen 100% sobre el código base intencionalmente incluido. Los
umbrales crecerán con el producto y podrán diferenciar código crítico, pero no se reducirán para
ocultar líneas sin prueba.
