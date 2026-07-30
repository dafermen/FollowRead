# Versioning and releases

## Source of version

Releases use SemVer via tags `vMAJOR.MINOR.PATCH`. Editorial content keeps its
own versioning and does not require publishing another app.

- `PATCH`: compatible bugfix;
- `MINOR`: compatible functionality;
- `MAJOR`: incompatible change to contracts or data.

## Preparation

```powershell
pnpm quality:regression
pnpm release:notes -- --version v0.1.0 --output release-notes.md
git tag -a v0.1.0 -m "FollowRead v0.1.0"
git push origin v0.1.0
```

Before the tag, the GitHub repository must have:

- variable `FOLLOWREAD_API_BASE_URL` with a public HTTPS URL;
- GitHub Environment `release` with approval;
- Actions permissions to publish packages and releases;
- protection of `main`.

## Automation

`.github/workflows/release.yml` re-runs quality, security and deployment definition;
builds three images, publishes immutable tags to GHCR, packages the two web builds and creates a
GitHub Release with generated notes. `workflow_dispatch` only validates a candidate and does not publish.

`.github/workflows/deployment-smoke.yml` validates real URLs under the GitHub Environments
development, staging or production.

## Artifacts

- `followread-admin.tar.gz`;
- `followread-reader.tar.gz`;
- images `api`, `admin` and `reader` on GHCR;
- `release-notes.md`;
- checksums/digests provided by GitHub Actions and the registry.

Android/iOS keep the independent process of `MOBILE_RELEASES.md`; signing never goes through
this generic workflow.
