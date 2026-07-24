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

## Instalación

Con Node.js 24, pnpm 11 y Python 3.12 disponibles:

```powershell
pnpm setup
pnpm migrate
pnpm check
```

`pnpm setup` instala dependencias JavaScript, crea `apps/api/.venv`, instala la API y configura los
hooks Git. SQLite se crea en `var/followread.db` al conectarse o migrar.

## Seguridad y licencia

No añadas secretos al repositorio. Las integraciones AWS sólo se realizarán desde adaptadores de la
API. La estrategia de licencia está pendiente de decisión; por eso el repositorio no incluye todavía
un archivo `LICENSE`.
