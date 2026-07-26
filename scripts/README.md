# Scripts

- `setup-python.mjs`: crea el entorno Python 3.12 e instala la API.
- `run-python.mjs`: ejecuta siempre el Python aislado de la API.
- `setup-hooks.mjs`: configura `.githooks` y registra dentro de `.git` la ruta local de pnpm.
- `verify-hooks.mjs`: comprueba que el hook esperado está activo.
- `validate_workflow.py`: valida permisos, acciones y comandos de CI.
- `validate-mobile.mjs`: bloquea Admin, permisos innecesarios o recursos móviles incompletos.
- `mobile-doctor.mjs`: detecta herramientas Android/iOS sin modificar el equipo.
- `mobile-build.mjs`: genera el APK Android debug con el JDK de Android Studio.
- `verify-reader-mobile-e2e.mjs`: prueba safe areas, reflow, rotación y progreso en Chrome.
- `verify-learning-e2e.mjs`: demuestra el modo aprendizaje, persistencia y reflow móvil.

Los mismos scripts se usan desde Windows y GitHub Actions; no duplican la puerta de calidad.
