# Mandatory Instructions for Codex Sessions

These rules apply to the entire repository `C:\Projects\FollowRead`.

## Start of each session

1. Read this file in full.
2. Read `CURRENT_STATUS.md`.
3. Run `git status --short` and `git log -1 --oneline`.
4. Review `docs/project-management/NEXT_STEPS.md` and the review for the active phase.
5. If a phase's scope is unclear, consult `docs/FollowRead Project Prompt.pdf`.
6. Do not repeat work marked and validated as finished.

## Current decisions

- The MVP uses SQLite; do not introduce PostgreSQL or Docker as a development requirement.
- `pnpm dev` remains the primary local path. Docker is only optional packaging/deployment.
- Amazon Polly/AWS are optional; the local `fake` adapter must continue to work without API keys.
- There are no minor personal accounts and no text, vocabulary, tokens, or PII are recorded.
- Admin uses 5173, Reader 5174 and API 8000.
- Do not choose a cloud provider, create external resources, publish releases, or deploy to production
  without the owner's explicit authorization.
- Physical iOS/TestFlight requires macOS/Xcode and remains an external gate.

## Way of working

- Converse with the owner in Spanish and explain results in non-technical language.
- Preserve others' changes and avoid destructive commands.
- Keep phases traceable in `docs/project-management/`.
- Add tests for functional changes and run a proportionate validation.
- The full gate is `pnpm check`; product regression is `pnpm quality:regression`.
- For deployment use `pnpm deploy:validate`, audits and smoke tests. Never include secrets.
- Before an external deployment, complete the thirteen categories in
  `docs/testing/PRE_DEPLOYMENT_TESTS.md`; `pnpm check` does not replace that approval.
- Update `CURRENT_STATUS.md` after any material progress, blocker, or phase change.
- Update online Admin/Reader documentation when commands that users need change.
- Leave the Git tree clean and create a descriptive commit only after validating the scope.

## End of each session

Record in `CURRENT_STATUS.md`:

- actual phase and status;
- delivered features;
- commands run and results;
- external blockers;
- exact next action;
- most recent relevant commit.

Do not mark a phase as completed if a validation is missing that could change the implementation.
