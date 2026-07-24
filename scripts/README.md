# Scripts

- `setup-python.mjs`: crea el entorno Python 3.12 e instala la API.
- `run-python.mjs`: ejecuta siempre el Python aislado de la API.
- `setup-hooks.mjs`: configura `.githooks` y registra dentro de `.git` la ruta local de pnpm.
- `verify-hooks.mjs`: comprueba que el hook esperado está activo.
- `validate_workflow.py`: valida permisos, acciones y comandos de CI.

Los mismos scripts se usan desde Windows y GitHub Actions; no duplican la puerta de calidad.
