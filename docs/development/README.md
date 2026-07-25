# Documentación de desarrollo

## Node.js y pnpm en Windows

FollowRead requiere Node.js 24 y pnpm 11.9.0.

```powershell
node --version
npm install --global pnpm@11.9.0
pnpm --version
```

Después de instalar, abre una terminal nueva. Si la política de PowerShell bloquea `pnpm.ps1`,
ejecuta `pnpm.cmd` en su lugar.

Desde la raíz:

```powershell
pnpm setup
pnpm migrate
pnpm check
```

## Iniciar todo con un comando

Después de `pnpm setup` y `pnpm migrate`:

```powershell
pnpm dev
```

Esto inicia API (`8000`), Admin (`5173`) y Reader (`5174`) en la misma terminal. `Ctrl+C` detiene
los tres procesos. Puedes validar los prerrequisitos sin iniciar servidores con `pnpm dev:check`.

## Documentación visible en las aplicaciones

- Reader: `http://localhost:5174/documentation`
- Admin: `http://localhost:5173/documentation`
- OpenAPI: `http://localhost:8000/docs`

Los enlaces “Ver documentación” de las pantallas iniciales abren la guía integrada.

## Crear el primer superadministrador

Después de migrar SQLite, ejecuta desde la raíz:

```powershell
pnpm admin:bootstrap -- --email admin@example.com --display-name "FollowRead Owner"
```

El comando solicita y confirma la contraseña sin mostrarla ni incluirla en los argumentos. Debe
tener entre 15 y 128 caracteres. Repetir el comando para el mismo superadministrador es seguro y no
cambia su contraseña. También sincroniza la matriz inicial de roles y permisos.
