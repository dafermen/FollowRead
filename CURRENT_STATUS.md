# Current status of FollowRead

**Updated:** 2026-07-30
**Phase:** 13 - CI/CD and deployment  
**Status:** IN_PROGRESS - implementation finished, external validations pending  
**Previous base:** `9ce61e5` - close of Phase 12
**Phase 13 implementation:** `f18762b`
**Documentation structure and pre-deploy gate:** `6346673`
**OpenAI voice and stable tracking:** `f0777da`
**Persistent audio cache:** `ecc5c1f`
**Published audio fix:** `232b6a0`
**Bilingual change with OpenAI marks:** `5d68a06`
**Chapter illustrations:** `010bcae`
**Stable Reader highlighting:** `6266a14`
**Clear reading indicator:** `a9e3f62`
**Complete demo catalog:** `5fdd785`
**Natural audio for complete catalog:** `d838334`

## What is finished

- Phases 0 to 12 closed and documented.
- Complete editorial admin: access, dashboard, catalog, editor, assets, processing, review and
  publication.
- Web/PWA/Android/iOS Reader: library, bilingual story, local audio, word-level sync,
  downloads, offline, progress, vocabulary and English learning mode.
- FastAPI API with SQLite, migrations, security, observability, metrics and 111 tests.
- Cross-cutting quality: global errors, GZip, caching, lazy loading, accessibility audit,
  load, dependency and regression.
- Phase 13 implemented locally: Dockerfiles, Compose, backup/restore, smoke test, expanded CI,
  SemVer/GHCR releases, release notes and artifact rollback.
- Canonical documentation completed with architecture, API, development, testing, deployment,
  operations, security, troubleshooting, ADR, contribution, changelog and GitHub templates.
- Mandatory matrix of thirteen categories of pre-deployment tests documented and verifiable.
- The public repository `dafermen/FollowRead` was authorized and the original code is published under
  the MIT license. `.env`, SQLite, logs, caches and local artifacts remain excluded.
- The repository documentation, contribution templates, continuity files and original project
  prompt are available in American English.
- The public README includes a reproducible product tour with four verified screenshots of Reader
  and Admin. `pnpm screenshots:readme` refreshes them while the services are active.
- Reader avoids playing before the timeline for the active story/language is loaded.
- The API has an optional OpenAI TTS adapter, word alignment with `whisper-1`,
  safe MP3 publication and idempotent regeneration on SQLite.
- Reader plays editorial audio when present, keeps highlighting always forward and
  shows a hand `👆` beneath the active word.
- Admin and Reader document online the file `apps/api/.env`, `OPENAI_API_KEY`, the recommended voices
  and the prohibition against exposing the secret in `VITE_*` variables.
- SQLite stores a fingerprint of the text, language, voice and models to reuse the MP3 without calling
  the provider again. Content/configuration changes or a missing file invalidate the cache.
- Admin tests force the simulated local adapter and cannot inherit an OpenAI key from `.env`.
- The published story has real OpenAI narration in Spanish (`marin`) and English (`cedar`), with
  MP3s served by the API and 73/74 timestamps respectively.
- Publication recalculates its checksum after generating audio and the Reader replaces an included
  obsolete bootstrap without altering packages downloaded by the user.
- The service worker fetches the offline manifest with network priority and a new version of its
  caches so editorial packages are not retained.
- The ES/EN change tolerates small overlaps of external timestamps and the API normalizes those
  marks before publishing them or reusing them from cache.
- The Reader package supports an optional illustration per chapter; when absent, the interface
  reuses the story cover.
- El zorro y la luna includes an additional original illustration for chapter 2, available
  in both languages and in the offline package.
- The active word preserves the same typographic flow during narration and the hand remains
  overlaid without altering the line's width or height.
- Auto-scrolling only centers the reading when the active word is outside the
  visible window, avoiding continuous movement while the user reads the same block.
- The demo catalog contains four bilingual published readings with two chapters each:
  El zorro y la luna, The River Between Us, El jardín secreto and
  La casa de los sonidos.
- The three new readings have original covers and the offline bootstrap includes all four
  complete packages.
- `pnpm demo:seed` prepares the entire catalog idempotently. With OpenAI configured it ensures
  real narration in Spanish (`marin`) and English (`cedar`) and reuses already generated MP3s.
- Admin shows the four readings as published and allows opening each one directly in
  Reader.

## Last local validation

- `pnpm check`: PASS on 2026-07-30 after the English documentation migration, with
  documentation/workflow/deployment/mobile validation, formatting, lint, types, 111 API tests,
  42 Reader tests, 14 Admin tests, shared-package tests and production builds.
- `pnpm docs:validate`: PASS on 2026-07-29.
- `pnpm migrate`: PASS; SQLite remained at revision `20260729_0003`.
- `pnpm check`: PASS on 2026-07-29 with 111 API tests, 42 Reader and 14 Admin.
- `pnpm reader:e2e`: PASS; Chrome opened the four readings in ES/EN and confirmed the chapter 2
  specific illustration.
- `pnpm quality:regression`: PASS on 2026-07-28 with services active.
- `pnpm deploy:smoke`: PASS against local API, Admin and Reader.
- 103 API tests, web tests, builds, security, accessibility, offline, mobile, learning,
  budgets and load: PASS.
- Admin 5173, Reader 5174 and API 8000 remained active after validation.

## Pending validations

1. Run `docker build` and `pnpm deploy:local` on a machine with Docker. Docker is not installed
   on this machine.
2. Correct the Python dependency-audit setup in `ci.yml` after explicit owner approval. The first
   real GitHub run completed every preceding job and failed only because the workflow-created
   environment retained vulnerable `pip 25.0.1`. `release.yml` will be validated when the first
   authorized SemVer tag is created.
3. Choose provider, domains and backup storage before development/staging/production.
4. Run smoke, migration and rollback in staging.
5. Validate physical iOS with macOS/Xcode before TestFlight.
6. Complete properties/invariants, mutation testing, fuzzing, formal contracts and resilience tests;
   record acceptance of the candidate artifact.
7. Confirm audibly in the browser the quality and synchronization of the real MP3 already generated.
   HTTP technical validation, timestamps and reuse with zero cost are completed.

## Exact next action

Approve and apply the narrow CI correction that upgrades the workflow's packaging tools before
the Python dependency audit, then confirm the rerun on GitHub.
After that, continue closing the gaps in `docs/testing/PRE_DEPLOYMENT_TESTS.md` and the
Docker/staging gates.
Do not start Phase 14 or mark Phase 13 `COMPLETED` before closing the entire matrix or approving
explicit exceptions.

## Useful commands

```powershell
pnpm dev
pnpm docs:validate
pnpm check
pnpm quality:regression
pnpm security:audit
pnpm deploy:validate
pnpm deploy:local
pnpm deploy:smoke
```

The detailed source is in `docs/project-management/PROJECT_STATUS.md`,
`docs/project-management/NEXT_STEPS.md` and `docs/deployment/`.
