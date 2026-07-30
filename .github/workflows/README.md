# Workflows

- `ci.yml`: quality, security, web builds, artifacts, and building three images.
- `release.yml`: manual candidate or SemVer release with GHCR, web packages, and release notes.
- `deployment-smoke.yml`: manual smoke test under protected GitHub Environments.

The local repository does not yet have a GitHub remote; the first real run is an external gate of
Phase 13.
