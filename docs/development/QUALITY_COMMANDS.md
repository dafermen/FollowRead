# Puerta de calidad

## Comando principal

```powershell
pnpm check
```

La puerta se detiene ante el primer error y ejecuta, en orden:

1. Estructura documental, enlaces y matriz previa al despliegue.
2. Validador estático de GitHub Actions.
3. Validador de frontera, permisos y recursos móviles.
4. Prettier para código y configuración JS/TS.
5. Ruff format para Python.
6. ESLint con reglas estrictas y tipadas.
7. Ruff lint.
8. TypeScript strict en aplicaciones y paquetes.
9. mypy strict en API y pruebas.
10. Vitest con cobertura para Admin, Reader y configuración.
11. pytest con SQLite/Alembic, cobertura y advertencias como errores.
12. builds de todas las aplicaciones y paquetes TypeScript.

## Comandos parciales

| Objetivo | Comando |
|---|---|
| Documentación | `pnpm docs:validate` |
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
| E2E modo aprendizaje | `pnpm reader:learning-e2e` |
| APK Android debug | `pnpm mobile:build:android` |

`pnpm check` no representa por sí solo una autorización de despliegue. La matriz completa de
`docs/testing/PRE_DEPLOYMENT_TESTS.md` también exige propiedades, mutation testing, fuzzing,
contratos, resiliencia y compatibilidad real.

`scripts/run-python.mjs` selecciona el ejecutable del entorno virtual en Windows o sistemas tipo Unix.
Si el entorno no existe, falla con una instrucción explícita y no usa silenciosamente otro Python.
El hook pre-commit ejecuta la puerta rápida y nunca modifica archivos automáticamente.

`pnpm reader:learning-e2e` abre Chrome y verifica traducción editorial, significado contextual,
ejemplos, guardado, favorito, historial, progreso y reflow móvil. Sus capturas quedan en
`var/e2e/`.

## Cobertura base

Los scaffolds de Admin, Reader y API exigen 100% sobre el código base intencionalmente incluido. Los
umbrales crecerán con el producto y podrán diferenciar código crítico, pero no se reducirán para
ocultar líneas sin prueba.
