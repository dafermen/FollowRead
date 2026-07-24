# Variables de entorno

## Reglas

- Los archivos `.env` reales están ignorados y nunca se versionan.
- Los nombres `VITE_*` son públicos porque Vite los incluye en el navegador; nunca contienen
  credenciales, tokens ni claves.
- Las variables `FOLLOWREAD_*` pertenecen a la API.
- Credenciales AWS futuras sólo serán leídas por adaptadores de la API y no aparecerán en ejemplos
  con valores reales.
- Tests configuran valores aislados y no leen secretos de la máquina.

## Catálogo inicial

| Variable | Aplicación | Requerida | Valor local | Validación |
|---|---|---:|---|---|
| `VITE_APP_ENV` | Admin/Reader | Sí | `development` | `development`, `test` o `production` |
| `VITE_API_BASE_URL` | Admin/Reader | Sí | `http://localhost:8000` | URL absoluta HTTP(S) |
| `FOLLOWREAD_ENVIRONMENT` | API | No | `development` | `development`, `test` o `production` |
| `FOLLOWREAD_APP_NAME` | API | No | `FollowRead API` | texto no vacío |
| `FOLLOWREAD_API_PREFIX` | API | No | vacío | vacío o ruta que comienza con `/` |
| `FOLLOWREAD_DATABASE_URL` | API | No | PostgreSQL local | DSN PostgreSQL |
| `FOLLOWREAD_POSTGRES_DB` | Compose | No | `followread` | nombre local |
| `FOLLOWREAD_POSTGRES_USER` | Compose | No | `followread` | usuario local |
| `FOLLOWREAD_POSTGRES_PASSWORD` | Compose | No | sólo desarrollo | secreto local no reutilizable |
| `FOLLOWREAD_POSTGRES_PORT` | Compose | No | `5432` | puerto enlazado a loopback |

## Configuración futura

Las credenciales PostgreSQL del ejemplo son exclusivamente locales y no pueden reutilizarse en
entornos compartidos. AWS no se configura hasta su fase de integración. Producción usará un gestor
de secretos, no archivos `.env` versionados.
