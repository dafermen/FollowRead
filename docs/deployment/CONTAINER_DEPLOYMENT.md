# Despliegue con contenedores

## Alcance

FollowRead puede desplegar API, Admin y Reader como tres imágenes separadas. Docker es una opción
de empaquetado y no se necesita para desarrollar. SQLite sigue siendo la fuente autoritativa del
MVP y vive en el volumen `followread-data`.

## Imágenes

| Imagen | Base | Puerto | Persistencia |
|---|---|---:|---|
| API | `python:3.12.13-slim-bookworm` | 8000 | `/data` |
| Admin | `nginx:1.28.3-alpine3.23` | 8080 | ninguna |
| Reader | `nginx:1.28.3-alpine3.23` | 8080 | ninguna |

Los builds web usan `node:24.18.0-bookworm-slim` y pnpm 11.9.0. Admin/Reader reciben
`VITE_API_BASE_URL` al compilar; por ello un cambio de endpoint exige reconstruir esos dos
artefactos, nunca insertar secretos.

## Desarrollo local con Docker

Docker Desktop/Engine es opcional y actualmente no está instalado en la estación Windows del
proyecto.

```powershell
pnpm deploy:validate
pnpm deploy:local
pnpm deploy:smoke
```

`deploy:local` usa `infrastructure/deployment/local.example.env`, construye imágenes, ejecuta
Alembic antes de la API y espera los health checks. Los puertos continúan siendo 8000, 5173 y 5174.

## Entornos compartidos

1. Copiar el ejemplo a un archivo fuera de Git.
2. Definir dominios HTTPS, orígenes exactos, namespace OCI y tag SemVer.
3. Crear el volumen persistente y un backup probado.
4. Ejecutar con aprobación:

```powershell
$env:FOLLOWREAD_DEPLOY_APPROVED = "YES"
node scripts/deploy-compose.mjs --environment staging --env-file C:\secure\followread-staging.env
pnpm deploy:smoke
```

Producción necesita además proxy TLS/CDN, acceso restringido a `/metrics`, backup programado,
retención, alertas y aprobación del GitHub Environment. Ningún proveedor concreto se supone en el
repositorio.

## Controles

- imágenes de versión explícita;
- procesos sin privilegios y `cap_drop: ALL`;
- filesystem de sólo lectura y `/tmp` efímero;
- migración terminada antes de iniciar API;
- health checks para los tres servicios;
- HTML sin caché, assets con caché inmutable;
- volumen único de datos, fuera de la imagen;
- credenciales ausentes de Dockerfiles, Compose y ejemplos.

## Limitación actual

La definición pasa validación estática y CI está preparada para construirla. La prueba local real de
`docker build/compose` permanece pendiente porque Docker no está instalado; la publicación externa
también requiere remote GitHub, dominios y proveedor elegidos por el propietario.

