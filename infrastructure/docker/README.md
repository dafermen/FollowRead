# Docker local

`compose.yaml` define PostgreSQL 18.4 para desarrollo. El puerto se enlaza sólo a `127.0.0.1`, los
datos usan un volumen nombrado y el servicio informa salud mediante `pg_isready`.

## Uso

```powershell
Copy-Item .env.example .env
docker compose config
docker compose up -d postgres
docker compose ps
```

El servicio debe mostrar `healthy` antes de ejecutar migraciones o pruebas de integración.

Para detenerlo sin borrar datos:

```powershell
docker compose down
```

`docker compose down --volumes` elimina datos locales y sólo debe utilizarse conscientemente. La
validación estática se ejecuta con `pnpm validate:compose`.
