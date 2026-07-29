# Variables de entorno

## Reglas

- Los archivos `.env` reales están ignorados y nunca se versionan.
- Los nombres `VITE_*` son públicos porque Vite los incluye en el navegador; nunca contienen
  credenciales, tokens ni claves.
- Las variables `FOLLOWREAD_*` pertenecen a la API.
- `OPENAI_API_KEY` es un secreto exclusivo de la API y sólo se guarda en `apps/api/.env` durante
  desarrollo local.
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
| `FOLLOWREAD_ALLOWED_ORIGINS` | API | No | web local + orígenes Capacitor | lista JSON de orígenes exactos |
| `FOLLOWREAD_POLLY_PROVIDER` | API | No | `fake` | `fake`, `aws` u `openai` |
| `FOLLOWREAD_AUDIO_OUTPUT_DIR` | API | No | `./var/audio` | directorio local fuera de Git |
| `FOLLOWREAD_ILLUSTRATION_OUTPUT_DIR` | API | No | `./var/illustrations` | directorio local fuera de Git |
| `FOLLOWREAD_MAXIMUM_PROCESSING_COST` | API | No | `1.00` | decimal mayor o igual a cero |
| `FOLLOWREAD_POLLY_CHUNK_CHARACTERS` | API | No | `1500` | entero entre 100 y 3000 |
| `OPENAI_API_KEY` | API | con proveedor OpenAI | ausente | secreto válido, nunca `VITE_*` |
| `FOLLOWREAD_OPENAI_TTS_MODEL` | API | No | `gpt-4o-mini-tts-2025-12-15` | modelo TTS disponible |
| `FOLLOWREAD_OPENAI_ALIGNMENT_MODEL` | API | No | `whisper-1` | modelo con timestamps de palabra |
| `FOLLOWREAD_IMAGE_NAMESPACE` | Compose | No | `followread` | namespace OCI sin credenciales |
| `FOLLOWREAD_IMAGE_VERSION` | Compose | No | `local` | tag SemVer en entornos compartidos |
| `FOLLOWREAD_DATA_VOLUME` | Compose | No | `followread-data` | nombre de volumen explícito |
| `FOLLOWREAD_DEPLOY_APPROVED` | Script local | staging/production | ausente | debe ser `YES` |

En móvil, `VITE_API_BASE_URL` se fija al compilar y debe ser HTTPS/alcanzable desde el dispositivo.
Para el emulador Android local puede usarse temporalmente `http://10.0.2.2:8000`. Los orígenes
nativos predeterminados son `capacitor://localhost` (iOS) y `https://localhost` (Android).

## Audio local, OpenAI y AWS opcional

El MVP usa `FOLLOWREAD_POLLY_PROVIDER=fake`: genera audio determinista y Speech Marks sin red,
cuenta ni costo. `FOLLOWREAD_POLLY_PROVIDER=aws` activa el límite real de Amazon Polly en la API y
requiere que el entorno de despliegue proporcione el SDK `boto3` y credenciales mediante la cadena
estándar de AWS. Las credenciales nunca se agregan al archivo `.env.example`, al navegador ni a Git.

Para OpenAI, copia `apps/api/.env.example` como `apps/api/.env`, cambia el proveedor a `openai` y
completa `OPENAI_API_KEY`. La API usa TTS para el audio y alineación de palabra para el resaltado.
El Reader recibe sólo el MP3 publicado y muestra que la voz es generada por IA.

SQLite no requiere credenciales. La base y el audio local quedan fuera de Git. Producción usará un
gestor de secretos para cualquier valor sensible, no archivos `.env` versionados.

## GitHub Actions

`FOLLOWREAD_API_BASE_URL` es una **Repository Variable**, no un secreto, porque su valor termina en
el JavaScript público. Producción debe usar HTTPS. `GITHUB_TOKEN` es efímero y se limita por job a
contenido/paquetes. Credenciales de proveedor, SSH, tiendas o firma no están definidas hasta elegir
plataforma; deberán almacenarse como secretos de un GitHub Environment protegido.
