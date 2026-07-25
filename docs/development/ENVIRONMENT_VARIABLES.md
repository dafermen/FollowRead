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
| `FOLLOWREAD_POLLY_PROVIDER` | API | No | `fake` | `fake` o `aws` |
| `FOLLOWREAD_AUDIO_OUTPUT_DIR` | API | No | `./var/audio` | directorio local fuera de Git |
| `FOLLOWREAD_ILLUSTRATION_OUTPUT_DIR` | API | No | `./var/illustrations` | directorio local fuera de Git |
| `FOLLOWREAD_MAXIMUM_PROCESSING_COST` | API | No | `1.00` | decimal mayor o igual a cero |
| `FOLLOWREAD_POLLY_CHUNK_CHARACTERS` | API | No | `1500` | entero entre 100 y 3000 |

## Audio local y AWS opcional

El MVP usa `FOLLOWREAD_POLLY_PROVIDER=fake`: genera audio determinista y Speech Marks sin red,
cuenta ni costo. `FOLLOWREAD_POLLY_PROVIDER=aws` activa el límite real de Amazon Polly en la API y
requiere que el entorno de despliegue proporcione el SDK `boto3` y credenciales mediante la cadena
estándar de AWS. Las credenciales nunca se agregan al archivo `.env.example`, al navegador ni a Git.

SQLite no requiere credenciales. La base y el audio local quedan fuera de Git. Producción usará un
gestor de secretos para cualquier valor sensible, no archivos `.env` versionados.
