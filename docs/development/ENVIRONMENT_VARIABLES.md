# Environment Variables

## Rules

- Real `.env` files are ignored and never versioned.
- `VITE_*` names are public because Vite includes them in the browser; they never contain
  credentials, tokens, or keys.
- `FOLLOWREAD_*` variables belong to the API.
- `OPENAI_API_KEY` is an API-only secret and is only stored in `apps/api/.env` during
  local development.
- Future AWS credentials will only be read by API adapters and will not appear in examples
  with real values.
- Tests configure isolated values and do not read secrets from the machine.

## Initial catalog

| Variable | Application | Required | Local value | Validation |
|---|---|---:|---|---|
| `VITE_APP_ENV` | Admin/Reader | Yes | `development` | `development`, `test` or `production` |
| `VITE_API_BASE_URL` | Admin/Reader | Yes | `http://localhost:8000` | Absolute HTTP(S) URL |
| `FOLLOWREAD_ENVIRONMENT` | API | No | `development` | `development`, `test` or `production` |
| `FOLLOWREAD_APP_NAME` | API | No | `FollowRead API` | non-empty text |
| `FOLLOWREAD_API_PREFIX` | API | No | empty | empty or a path that begins with `/` |
| `FOLLOWREAD_DATABASE_URL` | API | No | `sqlite:///./var/followread.db` | SQLite DSN |
| `FOLLOWREAD_ALLOWED_ORIGINS` | API | No | local web + Capacitor origins | JSON list of exact origins |
| `FOLLOWREAD_POLLY_PROVIDER` | API | No | `fake` | `fake`, `aws` or `openai` |
| `FOLLOWREAD_AUDIO_OUTPUT_DIR` | API | No | `./var/audio` | local directory outside Git |
| `FOLLOWREAD_ILLUSTRATION_OUTPUT_DIR` | API | No | `./var/illustrations` | local directory outside Git |
| `FOLLOWREAD_MAXIMUM_PROCESSING_COST` | API | No | `1.00` | decimal greater than or equal to zero |
| `FOLLOWREAD_POLLY_CHUNK_CHARACTERS` | API | No | `1500` | integer between 100 and 3000 |
| `OPENAI_API_KEY` | API | with OpenAI provider | absent | valid secret, never `VITE_*` |
| `FOLLOWREAD_OPENAI_TTS_MODEL` | API | No | `gpt-4o-mini-tts-2025-12-15` | available TTS model |
| `FOLLOWREAD_OPENAI_ALIGNMENT_MODEL` | API | No | `whisper-1` | model with word timestamps |
| `FOLLOWREAD_IMAGE_NAMESPACE` | Compose | No | `followread` | OCI namespace without credentials |
| `FOLLOWREAD_IMAGE_VERSION` | Compose | No | `local` | SemVer tag in shared environments |
| `FOLLOWREAD_DATA_VOLUME` | Compose | No | `followread-data` | explicit volume name |
| `FOLLOWREAD_DEPLOY_APPROVED` | Local script | staging/production | absent | must be `YES` |

On mobile, `VITE_API_BASE_URL` is fixed at compile time and must be HTTPS/reachable from the device.
For the local Android emulator you can temporarily use `http://10.0.2.2:8000`. Default native origins are
`capacitor://localhost` (iOS) and `https://localhost` (Android).

## Local audio, OpenAI and optional AWS

The MVP uses `FOLLOWREAD_POLLY_PROVIDER=fake`: it generates deterministic audio and Speech Marks without network,
account, or cost. `FOLLOWREAD_POLLY_PROVIDER=aws` enables the real Amazon Polly limit on the API and
requires the deployment environment to provide the `boto3` SDK and credentials via the standard
AWS chain. Credentials are never added to the `.env.example` file, the browser, or Git.

For OpenAI, copy `apps/api/.env.example` to `apps/api/.env`, change the provider to `openai`, and
fill in `OPENAI_API_KEY`. The API uses TTS for audio and word alignment for highlighting.
The Reader receives only the published MP3 and displays that the voice is AI-generated.

SQLite does not require credentials. The database and local audio are kept out of Git. Production will use a
secret manager for any sensitive value, not versioned `.env` files.

## GitHub Actions

`FOLLOWREAD_API_BASE_URL` is a **Repository Variable**, not a secret, because its value ends up in
public JavaScript. Production must use HTTPS. `GITHUB_TOKEN` is ephemeral and limited per job to
content/packages. Provider credentials, SSH, stores, or signing are not defined until a platform is chosen;
they should be stored as secrets in a protected GitHub Environment.
