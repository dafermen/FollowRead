# Phase 12 Security Audit

**Date:** 2026-07-26
**Result:** PASS

## Verified controls

- unexpected errors return a stable contract and a `request_id`, without internal details;
- logs and metrics use normalized paths and do not include query strings, bodies, cookies, or tokens;
- authentication, administration, synchronization and non-GET operations use `Cache-Control: no-store`;
- public catalog uses short cache and packages support `ETag`/`If-None-Match`;
- the API delivers `nosniff`, frame denial, restrictive referrer, permissions policy and
  resource policy;
- CORS preserves explicit origins, credentials and limited methods;
- GZip compresses only sufficiently large responses;
- the frontend gate does not print the private error message in the structured report;
- SQLite remains exclusively owned by the API.

## Dependencies

The first run found 17 transitive JavaScript advisories in Capacitor developer tools and six advisories in the environment `pip`. Minimal and verifiable overrides were applied for `tar`, `minimatch`, `brace-expansion` and `uuid`; `pip` is pinned to a fixed version during setup. Mobile asset generation continued to work after the change.

Final results:

```text
pnpm audit --audit-level moderate
No known vulnerabilities found

pnpm security:audit:python
No known vulnerabilities found
```

`pip-audit` skips the local editable package `followread-api` because it is not published on PyPI; it does audit all of its installed dependencies.

## Reproducible command

```powershell
pnpm security:audit
```

The audit queries external databases and should be run periodically and in CI. A future result
must not be silenced by undated exceptions without an owner and mitigation.
