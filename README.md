# FollowRead

FollowRead es una plataforma de lectura sincronizada y accesible. Combina texto, audio, resaltado
por palabra y modos adaptados para niñas y niños, personas adultas y estudiantes de inglés.

## Estado

Las fases de definición y diseño UX/UI están cerradas. La Fase 2 prepara la base técnica; todavía no
hay funcionalidad de producto implementada.

## Estructura

- `apps/admin-web`: aplicación web editorial y administrativa.
- `apps/reader`: lector web/PWA y futura base de Capacitor.
- `apps/api`: API FastAPI y adaptadores de infraestructura.
- `packages`: contratos, componentes, modelos, validación y Reader Engine compartidos.
- `infrastructure`: archivos de base de datos, contenedores, AWS y despliegue.
- `docs`: requisitos, arquitectura, UX/UI, pruebas, despliegue y gestión.
- `scripts`: comandos multiplataforma de desarrollo y validación.

## Herramientas

- Node.js 24 y pnpm 11 para JavaScript/TypeScript.
- Python 3.12 para la API.
- React/Vite para Admin y Reader.
- FastAPI para la API.
- SQLite para persistencia del MVP; PostgreSQL queda como evolución futura.

## Instalación en Windows

1. Instala Node.js 24 y confirma `node --version`.
2. Instala la versión de pnpm declarada por el proyecto:

```powershell
npm install --global pnpm@11.9.0
```

3. Cierra y abre PowerShell, y confirma `pnpm --version`. Debe responder `11.9.0`.
4. Desde `C:\Projects\FollowRead`:

```powershell
pnpm setup
pnpm migrate
pnpm check
```

`pnpm setup` instala dependencias JavaScript, crea `apps/api/.venv`, instala la API y configura los
hooks Git. SQLite se crea en `var/followread.db` al conectarse o migrar.

Para iniciar API, Admin y Reader al mismo tiempo:

```powershell
pnpm dev
```

El comando muestra las tres direcciones y las detiene juntas con `Ctrl+C`.

Si PowerShell bloquea `pnpm.ps1`, usa `pnpm.cmd` en los comandos. Reader y Admin incluyen una
página de ayuda en `/documentation`; la API ofrece su contrato interactivo en
`http://localhost:8000/docs`.

## Seguridad y licencia

No añadas secretos al repositorio. Las integraciones AWS sólo se realizarán desde adaptadores de la
API. La estrategia de licencia está pendiente de decisión; por eso el repositorio no incluye todavía
un archivo `LICENSE`.
