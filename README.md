# FollowRead

FollowRead es una plataforma de lectura sincronizada y accesible. Combina texto, audio, resaltado
por palabra y modos adaptados para niñas y niños, personas adultas y estudiantes de inglés.

## Estado

Las fases 0 a 12 están cerradas. Admin permite gestionar y publicar contenido; Reader ofrece
biblioteca, búsqueda, detalle, favoritos, historial, vocabulario, modos de lectura, PWA y cuatro
lecturas bilingües con sincronización por palabra. El catálogo puede leerse sin red y el progreso se
sincroniza al reconectar. La voz del dispositivo no requiere credenciales ni servicios externos. La Fase 13
tiene CI, releases y contenedores preparados; su validación externa espera Docker y un remote
GitHub.

## Estructura

- `apps/admin-web`: aplicación web editorial y administrativa.
- `apps/reader`: lector web/PWA y futura base de Capacitor.
- `apps/api`: API FastAPI y adaptadores de infraestructura.
- `packages`: contratos, componentes, modelos, validación y Reader Engine compartidos.
- `infrastructure`: archivos de base de datos, contenedores, AWS y despliegue.
- `docs`: requisitos, arquitectura, UX/UI, pruebas, despliegue y gestión.
- `test`: inventario transversal y fixtures compartidas; las unitarias permanecen junto al código.
- `scripts`: comandos multiplataforma de desarrollo y validación.

Los documentos canónicos son `docs/ARCHITECTURE.md`, `API.md`, `DEVELOPMENT.md`, `TESTING.md`,
`DEPLOYMENT.md`, `OPERATIONS.md`, `SECURITY.md` y `TROUBLESHOOTING.md`. Cada uno enlaza las fuentes
detalladas existentes.

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
pnpm demo:seed
pnpm check
```

`pnpm setup` instala dependencias JavaScript, crea `apps/api/.venv`, instala la API y configura los
hooks Git. SQLite se crea en `var/followread.db` al conectarse o migrar.

`pnpm demo:seed` crea o actualiza idempotentemente las cuatro lecturas bilingües incluidas. Con el
adaptador local genera tiempos simulados sin credenciales; si `apps/api/.env` configura OpenAI,
genera audio natural una sola vez y lo reutiliza desde la caché persistente.

Para iniciar API, Admin y Reader al mismo tiempo:

```powershell
pnpm dev
```

El comando muestra las tres direcciones y las detiene juntas con `Ctrl+C`.

Con los servicios activos, el recorrido del Reader se verifica en Chrome o Edge con:

```powershell
pnpm reader:e2e
pnpm reader:offline-e2e
```

Después de modificar o publicar contenido, `pnpm offline:bootstrap` regenera el catálogo incluido en
el build y verifica sus checksums contra la API activa.

Si PowerShell bloquea `pnpm.ps1`, usa `pnpm.cmd` en los comandos. Reader y Admin incluyen una
página de ayuda en `/documentation`; la API ofrece su contrato interactivo en
`http://localhost:8000/docs`.

## Continuidad y despliegue

Toda sesión de Codex debe comenzar leyendo `AGENTS.md` y `CURRENT_STATUS.md`. Para revisar los
artefactos de despliegue sin Docker:

```powershell
pnpm deploy:validate
```

Docker es opcional. Cuando esté instalado, `pnpm deploy:local` levanta las tres imágenes y
`pnpm deploy:smoke` comprueba el resultado. Release, backup y rollback están documentados en
`docs/deployment/`.

Antes de desplegar en un entorno compartido deben quedar en `PASS` o contar con excepción aprobada
las trece categorías de `docs/testing/PRE_DEPLOYMENT_TESTS.md`: aceptación, unitarias, propiedades,
mutation testing, fuzzing, integración, contrato, E2E, regresión, seguridad, concurrencia,
rendimiento y compatibilidad/despliegue. El estado actual sigue bloqueado para despliegue externo.

## Seguridad y licencia

No añadas secretos al repositorio. Las integraciones AWS sólo se realizarán desde adaptadores de la
API. `LICENSE` deja constancia de que el proyecto continúa `UNLICENSED`; la licencia definitiva y
el inventario legal de terceros siguen pendientes antes de una distribución externa.
