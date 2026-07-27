# Contenedores de despliegue

Docker sigue siendo opcional para desarrollo: `pnpm dev` usa procesos locales y SQLite sin
contenedores. La Fase 13 añade imágenes reproducibles para despliegue:

- `api.Dockerfile`: FastAPI como usuario sin privilegios y volumen `/data`;
- `admin.Dockerfile`: build Vite y Nginx para la SPA administrativa;
- `reader.Dockerfile`: build Reader/PWA y Nginx;
- `compose.yaml`: migración Alembic previa, salud, capacidades mínimas y volumen SQLite.

Las imágenes base están fijadas a versiones explícitas. CI construye las tres imágenes sin
publicarlas; un tag SemVer publica en GHCR cuando el repositorio disponga de remote GitHub.

Uso local opcional:

```powershell
pnpm deploy:local
pnpm deploy:smoke
```

Requiere Docker Desktop o Docker Engine. No cambia la ruta de desarrollo normal.
