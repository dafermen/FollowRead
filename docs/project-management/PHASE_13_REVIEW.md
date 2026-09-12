# Phase 13 Review - CI/CD and Deployment

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
been pushed. See [VPS runbook](../deployment/VPS_DEPLOYMENT.md) and [candidate test record](../testing/VPS_CANDIDATE.md).

## Prior phase history (superseded where noted)

**Date:** 2026-07-26
**Status:** READY_FOR_EXTERNAL_VALIDATION

## Implemented outcome

Reproducible automation is finished without selecting a provider or introducing Docker as a
development requirement. API, Admin, and Reader have separate images, Compose coordinates migration
and health, CI builds the artifacts, and a SemVer tag can publish to GHCR and a GitHub Release.

## Master prompt coverage

| Activity | Evidence | Status |
|---|---|---|
| GitHub Actions | CI, release and smoke per environment | CI_PASS_REMOTE |
| lint, type-check, tests, build | `pnpm run ci` and base workflow | PASS_REMOTE |
| Docker | three Dockerfiles and secure Compose | BUILD_PASS_REMOTE |
| web/API deployment | OCI images, Nginx, Compose and health checks | IMPLEMENTED |
| migrations | Alembic service prior to API | IMPLEMENTED |
| versioning/release notes | SemVer tags and reproducible generator | IMPLEMENTED |
| rollback | tag change without automatic data downgrade | IMPLEMENTED |
| secrets/environments | examples without secrets and GitHub Environments | IMPLEMENTED |
| documentation | canonical guides, continuity files, and responsive `/docs/` portal | PASS_LOCAL |

## Closed local evidence

- `pnpm check`: CI/deployment/mobile validators, formatting, lint, types, 103 API tests, web tests,
  and full builds all green.
- `pnpm quality:regression`: security, Reader walkthroughs, offline, mobile, learning,
  accessibility, budgets and load all green.
- `pnpm deploy:smoke`: local API, Admin and Reader responded correctly.
- SQLite backup and restore passed two dedicated tests, including integrity and explicit
  release of connections on Windows.
- The responsive VitePress portal packages every Markdown source under `/docs/`, renders Mermaid,
  supports local search and theme selection, and returns to Admin without router interception.
- `pnpm docs:e2e` passed in real Chrome at 1440x900 and 390x844, including the internal-page
  sidebar and outline, dark mode, mobile navigation, touch target, horizontal fit, and same-tab
  application return.

FR-PH13-TASK-011 remains `COMPLETED`. This evidence does not replace running Compose or validating
an authorized staging environment.

## Closed remote evidence

- GitHub Actions run `30558522375` passed on commit `faf194d`.
- The runner executed documentation, workflow, deployment and mobile validation, formatting, lint,
  types, 111 API tests, 42 Reader tests, 14 Admin tests, shared-package tests and production builds.
- JavaScript and Python audits reported no known vulnerabilities.
- Admin and Reader web artifacts were uploaded with a fourteen-day retention.
- API, Admin and Reader container images built successfully on the GitHub runner.

## Gates preventing closure

1. Docker is not installed on the current workstation; running Compose and deployment smoke is missing.
2. Provider, domains, and backup storage were not chosen; staging/production cannot
   be deployed responsibly.
3. The predeployment matrix identifies gaps in acceptance, properties/invariants, mutation
   testing, fuzzing, contracts, and resilience.

These gates can reveal runtime defects, so the phase is not marked `COMPLETED`.

## Criteria to close

- `docker build` passes for API/Admin/Reader: PASS_REMOTE;
- `pnpm deploy:local` and `pnpm deploy:smoke` pass;
- `ci.yml` passes on GitHub: PASS_REMOTE;
- a development or staging deployment demonstrates migration, backup, smoke and rollback;
- `CURRENT_STATUS.md` records the evidence and the commit.
- the thirteen predeployment categories are in `PASS` or `WAIVED` explicitly approved.
