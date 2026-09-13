# Public web test rollout evidence

## Approved release and scope

- Release: [v0.1.0](https://github.com/dafermen/FollowRead/releases/tag/v0.1.0).
- Source: `9112651c1bd8d699c7418e5e6526e6046272b8cb` (merged PR #1).
- Final source CI: `34708875680`; protected release: `34725293956`, both successful.
- Activated: 2026-09-13 00:12 UTC, September 12 in the owner's New York time zone.
- Explicit owner approval covers GitHub, VPS deployment, catalog/media and the OpenAI key.
- Public demonstration/test server. Same-server backups selected; SMTP intentionally deferred.
- The bounded thirteen-category candidate evidence remains in [VPS_CANDIDATE.md](VPS_CANDIDATE.md).
  This report adds released-image and actual VPS evidence; it does not claim exhaustive fuzzing,
  a whole-project mutation score, a production-load benchmark or physical iOS testing.

## Verified outcomes

| Check | Result |
|---|---|
| Published archive checksums, exact source revision and Linux/amd64 | PASS |
| API, single worker, Reader and Admin health | PASS |
| SQLite migration 0004 to 0005 | PASS |
| Public Reader, Admin and documentation over valid HTTPS | PASS |
| Security headers and hidden metrics/OpenAPI/development paths | PASS |
| Unauthenticated Admin denied | PASS |
| Four readings, both ES/EN packages and eight existing real audio files | PASS |
| Isolated Chrome: Reader, language change, Admin catalog and documentation hydration | PASS |
| Password reset, removal of URL token fragment and subsequent Admin login | PASS |
| Daily backup service execution and writer restart | PASS |
| Isolated restoration: running API, four readings, SQLite integrity, audio files | PASS |
| Certificate renewal dry run and active timer | PASS |
| OpenAI and disabled SMTP files: UID 10001, mode 0400 | PASS |

The catalog copy excluded development users, sessions, progress, jobs and audit history.
The owner account was provisioned afterward. The test password is not a user credential;
a fresh 24-hour one-use password-setting link was delivered in a restricted local file.
SMTP recovery honestly remains unavailable until configured; no email was sent.

## Docker identity portability correction

On this server the loaded image identity is the archive's OCI manifest SHA-256, while the
release runner wrote its configuration SHA-256 into `images.local.env`. The first guarded
activation stopped before creating the data volume. `resolve_portable_images.py` links both
identities using checksum-verified archive metadata, exact revision, platform and rootfs layers.
It writes only an immutable host manifest after all three images match. No tag is trusted for
execution and no application image was rebuilt. Three automated regression tests cover both
stores and both release ID formats, modified configuration metadata and wrong source revision.
Four additional checks on the VPS passed: config-ID input, manifest-ID input, wrong-revision
rejection and wrong-image rejection; rejected inputs produced no output manifest.

| Component | Immutable ID used by this VPS |
|---|---|
| API/worker | `sha256:6a502f5012511df238f135869342a8e5ba1723ba1f7f76f1fa954d45f025ebd6` |
| Admin | `sha256:e2888b044fba9e11908c11d6713c379486ee089fab1db6b354b66749846f26f8` |
| Reader | `sha256:9115bfd4e186bd18dcbe7ae5fde0a0c9683916f7f1675aa8b705118a5ebce76d` |

## Backup and recovery baseline

`followread-backup.timer` is active: daily at 03:15 UTC plus up to five minutes of jitter.
`followread-backup.service` returned success/exit 0. Retention keeps seven verified snapshots;
the initial import is retained separately. Snapshot `snapshot-20260913T001336929605Z.tar.gz`
was restored to a new isolated volume. Its temporary API had no published ports and no network.
The original volume stayed intact; the temporary container and volume were removed afterward.
The backup service also verified API/worker restart against the retained data.

There is no previous production version on this first installation. Previous-version rollback
is therefore not claimed as tested on this VPS; repeat the compatibility/recovery rehearsal
before the next approved update. Off-server backups are explicitly deferred for this test server.

## Remaining work

- Owner uses the private initial-access link before it expires; an operator can issue a new link.
- Configure SMTP and validate actual delivery when the owner chooses a provider.
- Off-server backups, alerting and a dedicated deployment operator before final production.
- Physical iOS/TestFlight remains outside this public web deployment.

Use the [deployment runbook](../deployment/VPS_DEPLOYMENT.md) for subsequent approved releases.
