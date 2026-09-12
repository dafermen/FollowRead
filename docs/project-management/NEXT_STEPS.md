# Next steps

## Exact next action

Complete the owner-authorized public test deployment to `followread.innovalogic.tech`.

1. Pass the updated PR quality/container/security checks and merge through protected main.
2. Publish an approved SemVer release with immutable image digests.
3. Preserve the real catalog and media, exclude development identities, and provision the owner.
4. Install the release on the existing VPS; verify HTTPS, Admin, Reader, narration and recovery.
5. Enable daily same-server snapshots retaining seven copies and verify an isolated restoration.
6. Record released revision, public smoke results and operational evidence.

The owner approved publication, deployment and repository protections. The separate site and
certificate are already installed. This is a public test server; the owner explicitly deferred
off-server storage. SMTP is undecided: private operator-issued links cover initial access and
assisted recovery, while automatic recovery email remains pending with a reminder scheduled.
Physical iOS/TestFlight remains outside this web deployment.
