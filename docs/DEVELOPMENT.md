# Development

This is the canonical entry for preparing and modifying FollowRead.

## Requirements

- Node.js 24;
- pnpm 11.9.0;
- Python 3.12;
- Git;
- Docker only to validate containers and deployments.

## Setup

```powershell
npm install --global pnpm@11.9.0
pnpm setup
pnpm migrate
pnpm demo:seed
pnpm dev
```

Admin is at `http://localhost:5173`, Reader at `http://localhost:5174` and API at
`http://localhost:8000`.

`pnpm demo:seed` is idempotent and publishes four bilingual readings: **El zorro y la luna**,
**The River Between Us**, **El jardín secreto** and **La casa de los sonidos**. Each contains two
chapters. Without external configuration it uses simulated audio; with OpenAI enabled it generates and saves natural audio
for both languages for reuse in future playbacks.

## Optional OpenAI voice

Natural narration is configured only in the backend:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Then edit `C:\Projects\FollowRead\apps\api\.env`:

```dotenv
FOLLOWREAD_POLLY_PROVIDER=openai
OPENAI_API_KEY=your_key_here
```

Restart `pnpm dev` and run `pnpm demo:seed` again, or generate the audio from Admin >
Processing. Use `marin` for Spanish and `cedar` for English. `apps/api/.env` is ignored by
Git; never use a `VITE_*` variable for this key.

The MP3 is generated only once. The API stores a fingerprint of the text, language, voice and models in SQLite,
and reuses the file for all subsequent playbacks and requests without calling OpenAI again. Regeneration happens automatically only when one of those data points changes or the saved
file is missing.

## Contribution flow

1. Read `AGENTS.md`, `CURRENT_STATUS.md` and `docs/project-management/NEXT_STEPS.md`.
2. Work on a traceable task and preserve other people's changes.
3. Add or update tests and documentation.
4. Run `pnpm check`.
5. If the change affects a critical flow, run `pnpm quality:regression`.
6. Before deploying, apply the full matrix of `docs/TESTING.md`.

## Detailed sources

The complete local documentation portal is available at `http://localhost:5173/docs/` while
`pnpm dev` is running. Use `pnpm docs:dev` to run only the documentation service, or
`pnpm docs:preview` after a production build.

- [Workspace conventions](development/WORKSPACE_CONVENTIONS.md)
- [Quality commands](development/QUALITY_COMMANDS.md)
- [Environment variables](development/ENVIRONMENT_VARIABLES.md)
- [Contribution guide](https://github.com/dafermen/FollowRead/blob/main/docs/CONTRIBUTING.md)
- [Troubleshooting](TROUBLESHOOTING.md)


## Persistent audio processing and VPS paths

`pnpm dev` now starts the audio worker with the other local services. After updating an
existing installation, run `pnpm migrate` and restart `pnpm dev`. Admin remains on 5173,
Reader on 5174 and the API on 8000. Audio requests return a queued job immediately;
Admin polls its progress while the worker processes it. A restarted worker preserves queued
jobs and marks interrupted running jobs as failed; review provider charges before retrying.

The planned public Reader is at `/`, Admin at `/admin/` and the API at `/api/` on
`followread.innovalogic.tech`. API interactive documentation is disabled in production;
product documentation remains at `/admin/docs/`. The VPS runbook is available in the
documentation portal under Delivery → FollowRead VPS. Publication requires owner approval.
