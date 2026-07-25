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
| `FOLLOWREAD_DATABASE_URL` | API | No | `sqlite:///./var/followread.db` | DSN SQLite |
| `FOLLOWREAD_ALLOWED_ORIGINS` | API | No | `["http://localhost:5173","http://localhost:5174"]` | lista JSON de orígenes exactos |

## Configuración futura

SQLite no requiere credenciales. El directorio y archivo de base quedan fuera de Git. AWS no se
configura hasta su fase de integración. Producción usará un gestor de secretos para cualquier valor
sensible, no archivos `.env` versionados.
