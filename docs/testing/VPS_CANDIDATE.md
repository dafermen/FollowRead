# VPS candidate validation - 2026-09-12

Scope: single-server web Reader, Admin, API and audio worker for
`followread.innovalogic.tech`. Base source commit: `6632238`; the new local commit contains
this record and its exact SHA is in the owner's review report. No changes have been pushed.
Local staging used the actual Linux production images with synthetic data and a disposable
localhost certificate. The VPS was inspected read-only. Physical iOS is a separate release.

## Authorized test rollout update

The owner accepted GitHub publication and the public web test deployment on 2026-09-12.
Main and the release environment now enforce the approved policies. The public certificate
was issued and its renewal dry run passed. Same-server daily backups with seven-copy retention
were explicitly selected for this demonstration VPS; final-production off-server storage and
SMTP delivery remain deferred. Initial access uses a private operator-issued recovery link.

Local validation now covers 130 API, 17 Admin, 44 Reader, 9 shared-package and 3 service-worker
tests. The API reports 94% line coverage including the new optional email paths. Dependencies
report no known vulnerabilities. CI run `34708307219` passed quality, production containers,
TLS recovery/session checks, queue processing, restoration/restart and runtime image scans.

PR review then identified a downloaded-image cache migration defect. The correction preserves
public `/stories/` downloads in a dedicated stable cache and removes private legacy entries.
A regression simulates activation with old cached data, then serves the image without network.
The final correction must pass the required CI checks before merging and releasing.

The following original preparation record is historical and its pending-authorization statements
are superseded by this approved test rollout. External deployment evidence will follow.

## Evidence and limits

| # | Category | Candidate evidence | State |
|---:|---|---|---|
| 1 | Acceptance | Automated product walkthroughs pass; owner review of this candidate remains required | PENDING_OWNER |
| 2 | Unit | 126 API, 44 Reader, 15 Admin, 9 shared tests; two SW security tests | PASS_LOCAL |
| 3 | Properties and invariants | 500 seeded generated Unicode texts preserve chunks and bounds; package checksums/idempotency tests | PASS_LOCAL, bounded corpus |
| 4 | Mutation testing | Two deliberate mutations in origin enforcement and metric normalization are detected (2/2) | PASS_LOCAL, selected controls only |
| 5 | Fuzzing | 1,500 generated malicious slug inputs plus duplicate-language rejection and existing malformed-input tests | PASS_LOCAL, schema corpus only |
| 6 | Integration | SQLite/Alembic, queue, TLS proxy, secure login, API/worker and web containers | PASS_LOCAL |
| 7 | Contract | Required consumer response fields, existing package/schema validators and actual browser/API interaction | PASS_LOCAL, current consumers |
| 8 | End-to-end | Chrome Reader/bilingual/Admin login/catalog/docs at HTTPS production paths; local offline/mobile/learning | PASS_LOCAL |
| 9 | Regression | Full check plus every product regression subcommand executed and recorded; docs browser checks | PASS_LOCAL |
| 10 | Security | Dependency and image audits, secret patterns, CSRF, secure cookies, roles, private paths, CSP, login throttling | PASS_LOCAL |
| 11 | Concurrency and resilience | Eight simultaneous queue submissions yield one job; exclusive worker lock; cancel/restart/recovery; offline resync | PASS_LOCAL |
| 12 | Performance and resources | Bundle budget; local load 120 requests/concurrency 12, p95 192.2 ms; container CPU/RAM/log limits | PASS_LOCAL, not a VPS benchmark |
| 13 | Compatibility and deployment | Three Linux runtime builds; actual Compose/TLS; verified SQLite/media snapshot and restart; staged runbook | PASS_LOCAL; public rollout pending |

These results do not claim exhaustive fuzzing, a project-wide mutation score, physical mobile
testing or a production traffic benchmark. Review the bounded test scope with acceptance.
No `WAIVED` exception has been granted. Public rollout remains pending approval and operational
readiness; `PASS_LOCAL` is evidence, not authorization. The existing mandatory matrix is retained.

## Commands

```text
pnpm check
pnpm security:audit
pnpm security:mutations
pnpm reader:e2e
pnpm reader:offline-e2e
pnpm reader:mobile-e2e
pnpm reader:learning-e2e
pnpm quality:a11y
pnpm quality:budget
pnpm quality:load
pnpm docs:e2e
pnpm deploy:smoke
python3 scripts/verify_vps.py
bash scripts/scan-image.sh <candidate image> <component>
```

The initial simultaneous documentation builds conflicted in VitePress's temporary directory.
The complete check was rerun with a single local documentation build. A local API reload was
restarted before browser tests. The offline regression exposed missing development-module cache
coverage; localhost-only module handling and an explicit controlled-page reload corrected it.
Private routes and unknown public resources remain excluded from caching.

The initial JS audit found 30 advisories. Updated dependency resolution reports zero known
vulnerabilities. Runtime image review replaced the initial Debian image and patched Alpine
libuuid; all three final images report zero HIGH/CRITICAL vulnerabilities and zero secret matches.
This is a dated vulnerability-database result. Python's local project package is not a PyPI audit
target; its code is covered by the code review and tests, and its third-party dependencies are audited.

## Pending external work

- Owner acceptance of the reviewed local commit, then permission to update GitHub.
- Enable and verify repository rules and the protected release environment; run updated CI on GitHub.
- Agree initial catalog/account handling and off-server encrypted backups, retention and restore drills.
- Approve VPS changes, issue the public certificate, check renewal, install approved image digests
  and record external HTTPS smoke and recovery against the released version.

No SSH key contents, application secrets, development database or real customer data are included
in the candidate. No GitHub or VPS write has occurred. Phase 13 remains open until external
acceptance and rollout evidence are recorded.

See the [VPS deployment and recovery runbook](../deployment/VPS_DEPLOYMENT.md).
