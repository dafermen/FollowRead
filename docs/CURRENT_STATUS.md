# Current status of FollowRead

**Updated:** 2026-09-12
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
**Green GitHub CI and containers:** `faf194d`
**Navigable documentation portal:** `81ad232`

## Authorized public test rollout — 2026-09-12

The owner approved GitHub publication and deployment to `followread.innovalogic.tech`.
This VPS is a public demonstration/test environment, not the final production server.
The owner explicitly chose same-server backups for now; off-server storage is deferred.
The owner also approved main requiring PRs and passing `quality`/`containers`, with force
pushes and deletions blocked, and owner self-approval of the protected release environment.
These repository and environment protections are now enabled. PR #1 is open.

FollowRead's separate Nginx site and Let's Encrypt certificate are installed; renewal timer
and a domain-specific reload hook are active. Other sites were preserved. Application
deployment, released-image scans and external smoke/restore evidence remain pending.

Password recovery now supports hashed, expiring, single-use tokens, session revocation,
trusted-origin validation, throttling and a private operator CLI. The owner will receive a
private initial password-setting link. SMTP is intentionally disabled until the owner chooses
a provider; the UI says to contact the operator instead of claiming an email was sent.
A reminder is scheduled. Development accounts and sessions must not be imported.

Next: validate and merge the updated PR, publish the approved release, install its exact
images, import only the catalog/media, provision the owner, and verify public functionality
and same-server backup restoration. Base preparation commit: `240d688`. Follow-up recovery/portable deployment: `5946189`;
container mount restoration: `9689dbf`. CI `34708307219` passed. A PR review correction
now preserves downloaded public illustrations across cache upgrades; its final CI is pending.

The following preparation record is historical; its pending authorization statements are
superseded by this approved rollout record.

## VPS candidate reviewed on 2026-09-12

**Phase 13 remains IN_PROGRESS. Local web candidate validated; owner acceptance and external rollout are pending.**
The owner selected `followread.innovalogic.tech` and supplied an existing SSH configuration.
Server inspection was read-only. No GitHub push, tag, release, certificate issuance or VPS change
was performed. The earlier statement that Docker is unavailable is superseded: Linux images and
Compose were exercised locally through WSL Ubuntu.

Delivered: same-origin Reader/Admin/API routing, hardened Docker/Nginx configuration, persistent
single-worker audio queue with concurrent idempotency and interruption recovery, safer PWA cache,
dependency updates, image vulnerability scans, pinned GitHub Actions, protected release publication,
digest-based update helper and verified SQLite/media snapshots. The owner's documentation moves
are preserved, with a root AGENTS pointer and corrected links.

Validation: full `pnpm check`; 126 API tests (96% line coverage), 44 Reader tests, 15 Admin tests,
9 shared-package tests and two service-worker security tests. Reader, offline, mobile, learning,
accessibility and documentation browser checks passed. Load: 120 requests at concurrency 12,
p95 192.2 ms in the local measurement. JavaScript/Python audits reported no known vulnerabilities;
the three runtime images reported zero high/critical vulnerabilities and no matching secrets.
Selected mutation checks detected both weakened controls. Generated cases cover 500 Unicode
chunk invariants and 1,500 unsafe catalog inputs. These are bounded tests, not exhaustive fuzzing
or a whole-project mutation score.

The production containers passed HTTPS, authorization, cookies, CSRF, private-route blocking,
login throttling, queue processing, snapshot restoration and restart. Real Chrome loaded Reader,
bilingual content, Admin login/catalog and VitePress under production paths and CSP.

Next: owner reviews the local candidate commit and approves GitHub publication. Then configure
repository/environment protection, validate the first updated workflow run, agree initial data and
off-server backup storage, and obtain explicit approval for the VPS rollout. Record external
certificate/renewal, smoke and rollback evidence afterward. Physical iOS is outside this web release
and remains a separate gate before TestFlight. Do not mark Phase 13 completed prematurely.

Base commit: `6632238`. The exact new local commit is in the delivered review report; it has not
been pushed. See [VPS runbook](deployment/VPS_DEPLOYMENT.md) and [candidate test record](testing/VPS_CANDIDATE.md).

## Historical implementation record

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
- The complete Markdown documentation is now available at `http://localhost:5173/docs/` through a
  branded VitePress portal with responsive navigation, local search, light/dark themes, Mermaid,
  page outlines, previous/next links, and a same-tab return to Admin.
- `pnpm dev` starts the documentation service with API, Admin, and Reader. On Windows it serves a
  validated static build to avoid invalid local module paths generated by VitePress development
  mode; production Admin artifacts include the same `/docs/` output.
- GitHub Actions run `30558522375` passed the complete quality gate, JavaScript/Python dependency
  audits, deployment validation, web artifact upload and container builds for API, Admin and Reader.
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
- Published MP3 playback now clears its resumable state after an error or completion, so the next
  play action performs a clean retry instead of leaving the Reader stuck behind an interruption
  warning.

## Last local validation

- `pnpm check:fast`: PASS on 2026-08-03 with formatting, lint, JavaScript/Python types,
  44 Reader tests, 14 Admin tests, shared-package tests, and 111 API tests.
- `pnpm --filter @followread/reader test -- publishedAudioNarrator.test.ts`: PASS on 2026-08-03
  with four focused tests, including failed-playback retry and completed-playback handling.
- `pnpm reader:e2e`: PASS on 2026-08-03; real Chrome fetched and played the published OpenAI MP3
  without showing the interruption warning, then validated chapter illustrations and all four
  bilingual readings.
- `pnpm check`: PASS on 2026-08-01 after the documentation portal integration, including link and
  static-site validation, formatting, lint, types, 111 API tests, 42 Reader tests, 14 Admin tests,
  shared-package tests, and all production builds.
- `pnpm docs:e2e`: PASS on 2026-08-01 in real Chrome at desktop and mobile sizes, with local search,
  internal navigation, dark mode, responsive fit, and same-tab return to `/` verified.
- `pnpm audit --audit-level moderate`: PASS with no known vulnerabilities. VitePress uses its
  compatible patched Vite 6.4.3 internally while Admin and Reader remain on Vite 8.1.5;
  `pnpm peers check` reports no dependency conflicts.
- GitHub CI: PASS on 2026-07-30 for commit `faf194d`; all quality steps and all three container
  builds completed successfully.
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

## Current pending actions

The September VPS candidate record above supersedes the earlier Docker/domain blockers.
Owner acceptance, GitHub publication/workflow validation, the off-server backup decision and
authorized public rollout remain pending. The real existing catalog and narration must be
preserved if selected as the initial dataset. Do not import development credentials or sessions.

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
