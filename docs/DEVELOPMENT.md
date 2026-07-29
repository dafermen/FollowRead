# Desarrollo

Esta es la entrada canónica para preparar y modificar FollowRead.

## Requisitos

- Node.js 24;
- pnpm 11.9.0;
- Python 3.12;
- Git;
- Docker sólo para validar contenedores y despliegues.

## Preparación

```powershell
npm install --global pnpm@11.9.0
pnpm setup
pnpm migrate
pnpm demo:seed
pnpm dev
```

Admin queda en `http://localhost:5173`, Reader en `http://localhost:5174` y API en
`http://localhost:8000`.

## Voz OpenAI opcional

La narración natural se configura sólo en el backend:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Después edita `C:\Projects\FollowRead\apps\api\.env`:

```dotenv
FOLLOWREAD_POLLY_PROVIDER=openai
OPENAI_API_KEY=tu_clave_aqui
```

Reinicia `pnpm dev` y genera el audio desde Admin > Procesamiento. Usa `marin` para español y
`cedar` para inglés. `apps/api/.env` está ignorado por Git; nunca uses una variable `VITE_*` para
esta clave.

## Flujo de contribución

1. Leer `AGENTS.md`, `CURRENT_STATUS.md` y `docs/project-management/NEXT_STEPS.md`.
2. Trabajar sobre una tarea trazable y preservar cambios ajenos.
3. Añadir o actualizar pruebas y documentación.
4. Ejecutar `pnpm check`.
5. Si el cambio afecta un flujo crítico, ejecutar `pnpm quality:regression`.
6. Antes de desplegar, aplicar la matriz completa de `docs/TESTING.md`.

## Fuentes detalladas

- [Convenciones del workspace](development/WORKSPACE_CONVENTIONS.md)
- [Comandos de calidad](development/QUALITY_COMMANDS.md)
- [Variables de entorno](development/ENVIRONMENT_VARIABLES.md)
- [Guía de contribución](../CONTRIBUTING.md)
- [Solución de problemas](TROUBLESHOOTING.md)
