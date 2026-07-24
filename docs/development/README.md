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

## Documentación visible en las aplicaciones

- Reader: `http://localhost:5174/documentation`
- Admin: `http://localhost:5173/documentation`
- OpenAPI: `http://localhost:8000/docs`

Los enlaces “Ver documentación” de las pantallas iniciales abren la guía integrada.
