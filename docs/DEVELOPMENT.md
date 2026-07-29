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

`pnpm demo:seed` es idempotente y deja publicadas cuatro lecturas bilingües: **El zorro y la luna**,
**The River Between Us**, **El jardín secreto** y **La casa de los sonidos**. Cada una contiene dos
capítulos. Sin configuración externa usa audio simulado; con OpenAI activo genera y guarda el audio
natural de ambos idiomas para reutilizarlo en reproducciones futuras.

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

Reinicia `pnpm dev` y ejecuta de nuevo `pnpm demo:seed`, o genera el audio desde Admin >
Procesamiento. Usa `marin` para español y `cedar` para inglés. `apps/api/.env` está ignorado por
Git; nunca uses una variable `VITE_*` para esta clave.

El MP3 se genera una sola vez. La API guarda una huella del texto, idioma, voz y modelos en SQLite,
y reutiliza el archivo en todas las reproducciones y solicitudes posteriores sin llamar de nuevo a
OpenAI. La regeneración ocurre automáticamente sólo cuando cambia uno de esos datos o falta el
archivo guardado.

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
