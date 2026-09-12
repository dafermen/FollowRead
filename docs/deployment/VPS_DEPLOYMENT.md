# FollowRead VPS deployment

Prepared on 2026-09-12 for `followread.innovalogic.tech`. The owner approved GitHub publication
and deployment to this existing VPS as a public demonstration/test environment. Subsequent
releases still require an approved version and passing checks. This is not the final server.

## Architecture and existing server

The application has two React/Vite frontends (Reader and Admin) and a FastAPI backend
with SQLite. A separate Python worker processes the persistent audio queue. SQLite remains
appropriate for this single-server MVP; run exactly one worker and keep the data volume on
local disk. Interrupted provider calls become failed jobs requiring an explicit retry.

| Public path | Service | Host binding |
|---|---|---|
| `/` | Reader/PWA | `127.0.0.1:5180` |
| `/admin/` | Administration | `127.0.0.1:5181` |
| `/admin/docs/` | Product/technical documentation | Admin image |
| `/api/` | FastAPI through Reader proxy | No published API port |

The read-only server inspection found Ubuntu 24.04, existing Nginx on 80/443, Docker,
UFW and several other applications. DNS points to the inspected server. Use a new Nginx
virtual host; retain every existing site, global setting and firewall rule. At inspection
there was approximately 26 GB free disk and 6 GB available RAM. Recheck before rollout.
The FollowRead certificate was issued on 2026-09-12 with automatic renewal enabled.
Port 5173 remains local development.

The Compose subnet `172.30.84.0/24` was unused at inspection. API trusts forwarded headers
only from its two web proxies (`172.30.84.11` and `.12`). Containers run without root,
with read-only roots, dropped capabilities, resource limits and rotated logs. Only the
loopback web ports are published. Docker-published ports can bypass UFW, which is why
these explicit loopback bindings matter ([Docker firewall documentation](https://docs.docker.com/engine/network/packet-filtering-firewalls/)).

## Local execution and candidate validation

```powershell
cd C:\Projects\FollowRead
pnpm setup
pnpm migrate
pnpm dev
```

`pnpm dev` starts the audio worker, API 8000, Admin 5173, Reader 5174 and documentation
5175. Existing installations need only the migration and restart. API secrets belong in
`apps/api/.env` locally and must never be put in `VITE_*` variables.

Run `pnpm check`, `pnpm security:audit`, `pnpm security:mutations` and the browser regression
commands recorded in the candidate evidence. The Linux container test requires Docker
Compose, Python 3 and OpenSSL and uses synthetic data, an ephemeral certificate and a unique
disposable data volume. It must not run beside the production Compose project because the
reviewed subnet and loopback ports are fixed.

```bash
docker build -f infrastructure/docker/api.Dockerfile -t followread-vps-candidate/api:review .
docker build -f infrastructure/docker/admin.Dockerfile --build-arg VITE_API_BASE_URL=/api --build-arg VITE_BASE_PATH=/admin/ --build-arg FOLLOWREAD_DOCS_BASE=/admin/docs/ --build-arg VITE_READER_BASE_URL=/ -t followread-vps-candidate/admin:review .
docker build -f infrastructure/docker/reader.Dockerfile --build-arg VITE_API_BASE_URL=/api -t followread-vps-candidate/reader:review .
python3 scripts/verify_vps.py
for app in api admin reader; do bash scripts/scan-image.sh "followread-vps-candidate/$app:review" "$app"; done
```

This verifies the actual production proxy, HTTPS, cookie attributes, CSRF, authorization,
private paths, rate limits, queue processing, data backup/restore and restart. The scanner
gets exported images only, without the Docker socket, GitHub token or SSH credentials.
High/critical vulnerabilities and matching secrets fail the release. Audit results are
time-specific, not a guarantee that software has no vulnerabilities.

## GitHub release and update process

1. After approval, push the reviewed preparation branch and open a PR. Protect `main`
   with required CI checks, review, no force pushes and no direct unreviewed changes.
2. The `release` environment requires the owner as reviewer and accepts only `v*` tags.
   The owner explicitly authorized self-approval for this one-maintainer project. Main requires
   a PR and passing `quality`/`containers`, with force pushes and deletion blocked; a second
   reviewer is not required. Verify the controls remain enabled before releasing.
3. Merge the reviewed PR only after CI passes for its final commit. Create a reviewed
   SemVer tag on that commit. Manual workflow dispatch validates a candidate without publishing.
4. The release validation job has read-only repository permissions. It runs quality and
   security checks, builds production images, exercises Compose/TLS, scans images and stores
   checksummed artifacts. Actions are pinned to full commit SHAs. Dependabot proposes updates.
5. Only the protected publish job receives package/release write permissions. It publishes
   the already validated images and creates `images.env` with their immutable SHA-256 digests
   and exact Git commit. No SSH credential or application secret is needed by the workflow.
6. Download the approved deployment bundle, `images.env` and `SHA256SUMS` from that release.
   Verify checksums and inspect the manifest against the approved commit. Keep each extracted
   deployment bundle in a separate directory such as `/opt/followread/releases/vX.Y.Z`.
7. Run the deployment helper locally on the server only after the owner authorizes that
   version. Production runs images by digest; updating the source checkout is not deployment.

Repository security controls follow [GitHub's secure-use guidance](https://docs.github.com/en/actions/reference/security/secure-use).
The updated workflows must pass on the exact revision being released. If GHCR packages are private, use a dedicated read-only package credential on
the VPS; never a repository write token. Prefer a dedicated operator account with SSH keys
and narrowly scoped administrative access. Docker group membership is root-equivalent.

## First server installation after approval

1. Recheck free disk, port/subnet availability, existing Nginx health and DNS. Back up existing
   Nginx configuration before adding the new site. Select a maintenance window and data source.
   Preserve the real local catalog and audio if that is the chosen initial dataset; do not
   run the synthetic test fixture in production or copy the development `.env` into artifacts.
2. Use the installed Docker/Compose and Nginx; do not replace the server's proxy stack. Prepare
   `/opt/followread/releases`, `/var/lib/followread`, `/etc/followread` and
   `/var/www/followread-acme` with restricted operator access.
3. Create `/etc/followread/openai_api_key` outside the repository. Its owner must be numeric UID
   10001 and mode 0400, readable by the API container user. Use an empty file with provider
   `fake` until real generation is explicitly enabled. Store a real key using a secure local
   editor or secret manager, never a command argument, terminal transcript or GitHub variable.
4. Add the supplied `followread.http.nginx.conf` as a new enabled site. Run `nginx -t`, then
   reload Nginx only if valid. Request the certificate using the existing Certbot installation:

   ```bash
   certbot certonly --webroot -w /var/www/followread-acme -d followread.innovalogic.tech
   ```

   Supply the owner's certificate contact interactively if needed. After issuance, replace
   only this new site's contents with `followread.nginx.conf`, validate and reload again.
   Retain the existing renewal timer; verify renewal and an Nginx reload hook. No global
   Nginx configuration or other site's certificate should be overwritten.
5. Preview the exact deployment plan from the extracted release directory:

   ```bash
   python3 scripts/vps_deploy.py --release-env /etc/followread/images.env --initialize
   ```

   `--initialize` is only for a genuinely empty data volume. If importing the real catalog,
   prepare a verified SQLite-and-media snapshot, restore to a fresh volume with the approved
   image, set `FOLLOWREAD_DATA_VOLUME` in the server manifest and omit `--initialize`.
   Set only the allowed optional provider, key-file and volume settings in that manifest.
6. After reviewing the plan and receiving approval:

   ```bash
   FOLLOWREAD_DEPLOY_APPROVED=YES python3 scripts/vps_deploy.py --release-env /etc/followread/images.env --initialize --execute
   ```

   The helper pulls images before downtime, stops writers, makes a consistent data snapshot,
   migrates and starts the services with health checks. It retains active/previous manifests.
   On an error it stops the update without an automatic database downgrade. Public requests
   can receive 502/503 during the short maintenance period; this is not a zero-downtime design.
7. Provision the first owner account using the interactive bootstrap CLI. For imported accounts,
   review an explicit credential-rotation and session-revocation procedure; bootstrap does not reset
   existing passwords. Confirm login, role restrictions, Reader narration/download/offline,
   catalog administration, HTTPS redirects and security headers from an external connection.
   Verify the test account is absent. The public API docs and metrics should return 404.

## Subsequent updates, backup and recovery

Each approved release repeats the validation, pull, snapshot, migration, startup and public
smoke steps. Omit `--initialize` on subsequent updates. Do not use floating `latest` tags.
Take an additional verified backup before bulk catalog edits or audio regeneration.

Snapshots contain SQLite, audio and illustrations with a checksum manifest. The built-in
`/data/backups` copy is useful for rollback but shares the server's failure domain. Before
a final production launch, agree off-server encrypted storage with the owner. For this public
test VPS, the owner explicitly chose same-server backups: daily at 03:15 server time, retaining
the latest seven verified snapshots. `followread-backup.timer` runs `scripts/vps_backup.py`,
which shares the deployment lock, stops writers, snapshots and restarts them even on failure.
Pruning occurs only after a successful snapshot. Keep at least 20% disk free and periodically
restore into an isolated replacement volume. The initial import is retained separately.

For application-only rollback, review schema compatibility and preview the previous approved
manifest with `--rollback --schema-compatible`. Execute it only after approval. This starts
the earlier image digests without an Alembic downgrade.

If the migration is incompatible or data must be recovered, stop API and worker, preserve the
current volume, create an empty replacement volume owned by 10001, and mount the selected
snapshot read-only at `/backup` and the replacement at `/data`. Run the approved API image's
CLI with `restore --data /data --archive /backup/snapshot-....tar.gz --confirm RESTORE`.
Keep its adjacent `.tar.json` checksum manifest. Restore rejects a nonempty destination,
unsafe archive members and failed SQLite integrity. Point a reviewed manifest at the new
volume, start the schema-compatible version, then validate readiness, catalog and media.
Restoring an older snapshot loses changes after its timestamp; obtain explicit acceptance.

The local candidate tests cover snapshot restoration and persistent restart. The first real
server rollout and rollback rehearsal must still be recorded against the released digests.

## Security boundaries and remaining improvements

- Sensitive authentication/Admin/API responses are not cached by the PWA. Production disables
  developer documentation and limits login attempts at both proxy and application layers.
- Runtime dependencies are locked; Linux Python dependencies include required hashes. Rebuild
  and rescan periodically because vulnerability databases and base image patches change.
- The public documentation is intentionally accessible. Keep infrastructure credentials,
  customer data and private operational notes outside it. VitePress documentation currently
  requires inline scripts; the Reader and Admin application CSP remains stricter.
- SQLite and a single worker are the chosen MVP limits. Measure real concurrency and paid
  provider latency before increasing traffic or moving to a shared database/queue.
- Add off-server backups, monitoring/alerts and optional stronger administrator authentication
  as the next operational improvements. Their credentials and activation need owner decisions.


## Owner access and password recovery

The owner chooses a password through a private, one-use HTTPS link. The operator generates it
inside the API container with `python -m followread_api.cli.password_reset --email OWNER_EMAIL
--output /tmp/initial-access.txt --minutes 1440`. Copy the file through authenticated SSH to
a private local location, then remove the temporary container file. Never publish the URL,
put it in command arguments or send it through logs. It expires after 24 hours; normal
recovery links expire after 15 minutes. Issuing another link invalidates the previous one.
The token is stored hashed, and changing a password revokes existing sessions.

Create `/etc/followread/smtp.json` with `{}` while email delivery is disabled. Like the OpenAI
key file, it must be owned by UID 10001 with mode 0400. The container reads it as a mounted
secret. When a provider is selected, replace its contents privately with the fields `host`,
`port`, `username`, `password`, `sender`, and `tls` (`ssl` or `starttls`), then recreate the
API/worker to refresh the mount. Test real delivery before declaring automatic recovery ready.
No SMTP password belongs in GitHub or `images.env`.


## Portable image installation without registry credentials

The protected release also publishes `followread-images.tar.gz` and `images.local.env`.
Download them with `SHA256SUMS` from the same approved GitHub release. Verify the downloaded
checksums before running `docker load --input followread-images.tar.gz`. Use `images.local.env`
as the server's release manifest and add only the allowed host configuration settings.
It pins each image by its SHA-256 image ID, which covers configuration and layers. The helper
checks each loaded image's exact identity, source revision and Linux/amd64 platform before
stopping services. It skips the registry pull for this manifest. CI exercises these image IDs
with the actual Compose/TLS stack. The images are the same ones validated and scanned before
publication; there is no VPS rebuild and no GitHub credential on the server.

For updates, keep each release archive, checksum and manifest separately, then repeat load,
reviewed deployment, backup/migration and external smoke. The GHCR manifest remains available
for installations with registry read access. Use one image-source mode consistently per release.
