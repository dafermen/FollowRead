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

- [Workspace conventions](development/WORKSPACE_CONVENTIONS.md)
- [Quality commands](development/QUALITY_COMMANDS.md)
- [Environment variables](development/ENVIRONMENT_VARIABLES.md)
- [Contribution guide](../CONTRIBUTING.md)
- [Troubleshooting](TROUBLESHOOTING.md)
