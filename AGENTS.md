# Instrucciones obligatorias para sesiones de Codex

Estas reglas aplican a todo el repositorio `C:\Projects\FollowRead`.

## Inicio de cada sesión

1. Leer este archivo completo.
2. Leer `CURRENT_STATUS.md`.
3. Ejecutar `git status --short` y `git log -1 --oneline`.
4. Revisar `docs/project-management/NEXT_STEPS.md` y la revisión de la fase activa.
5. Si el alcance de una fase es dudoso, consultar `docs/FollowRead Project Prompt.pdf`.
6. No repetir trabajo marcado y validado como terminado.

## Decisiones vigentes

- El MVP usa SQLite; no introducir PostgreSQL ni Docker como requisito de desarrollo.
- `pnpm dev` sigue siendo la ruta local principal. Docker es sólo empaquetado/despliegue opcional.
- Amazon Polly/AWS son opcionales; el adaptador local `fake` debe seguir funcionando sin API keys.
- No existen cuentas personales de menores ni se registran texto, vocabulario, tokens o PII.
- Admin usa 5173, Reader 5174 y API 8000.
- No seleccionar proveedor cloud, crear recursos externos, publicar releases o desplegar producción
  sin autorización explícita del propietario.
- iOS físico/TestFlight requiere macOS/Xcode y continúa como gate externo.

## Forma de trabajar

- Conversar con el propietario en español y explicar resultados en lenguaje no técnico.
- Preservar cambios ajenos y evitar comandos destructivos.
- Mantener las fases trazables en `docs/project-management/`.
- Añadir pruebas para cambios funcionales y ejecutar una validación proporcional.
- La puerta completa es `pnpm check`; la regresión de producto es `pnpm quality:regression`.
- Para despliegue usar `pnpm deploy:validate`, auditorías y smoke tests. Nunca incluir secretos.
- Antes de un despliegue externo, completar las trece categorías de
  `docs/testing/PRE_DEPLOYMENT_TESTS.md`; `pnpm check` no sustituye esa aprobación.
- Actualizar `CURRENT_STATUS.md` después de todo avance material, bloqueo o cambio de fase.
- Actualizar documentación online de Admin/Reader cuando cambien comandos que el usuario necesita.
- Dejar el árbol Git limpio y crear un commit descriptivo sólo después de validar el alcance.

## Cierre de cada sesión

Registrar en `CURRENT_STATUS.md`:

- fase y estado reales;
- funcionalidades entregadas;
- comandos ejecutados y resultado;
- bloqueos externos;
- siguiente acción exacta;
- commit más reciente relevante.

No marcar una fase como completada si falta una validación que sí puede alterar la implementación.
