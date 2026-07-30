# Known Issues

## FR-ISSUE-001 - Project without Git repository

- **Status:** RESOLVED
- **Severity:** Medium
- **Symptom:** `C:\Projects\FollowRead` only contains the master PDF and does not have `.git`.
- **Impact:** There is no history, branches, or safe rollback mechanism.
- **Resolution:** Repository initialized on `main` in FR-PH02-TASK-001. Structure and status
  were checked with the directory's owning identity.

## FR-ISSUE-002 - Inconsistency in content types

- **Status:** RESOLVED
- **Severity:** Low
- **Symptom:** The description includes "documents," but the enumerated types are `story`,
  `article`, `book`, and `lesson`.
- **Resolution:** FR-DEC-007 represents documents as `article` until there is a functional difference.

## FR-ISSUE-003 - Adult features without explicit data model

- **Status:** RESOLVED
- **Severity:** Medium
- **Symptom:** Adult mode requires notes and bookmarks, but the initial entities do not include
  `Note` or `Bookmark`.
- **Resolution:** FR-DEC-010 keeps favorites/progress in the MVP and defers free-form notes.

## FR-ISSUE-004 - Child account rules undefined

- **Status:** RESOLVED_FOR_MVP
- **Severity:** High
- **Symptom:** There is a child mode, but it is not defined whether a child owns an account or how an
  adult gives consent.
- **Resolution:** FR-DEC-009 prohibits personal accounts and identifiable data of minors in the MVP.
  A future capability will require a new review.

## FR-ISSUE-005 - Docker not available

- **Status:** RESOLVED_BY_SCOPE_CHANGE
- **Severity:** Medium
- **Symptom:** PowerShell does not recognize `docker` nor can it query `docker compose version`.
- **Impact:** Local PostgreSQL, healthcheck, and migrations cannot be validated.
- **Required action:** Install or start Docker Desktop and ensure the CLI is in `PATH`.
- **Blocked task:** FR-PH02-TASK-007.
- **Safe progress:** Compose, variables, DSN, and static validation are complete and pass
  `pnpm check`; only tests that require the runtime remain.
- **Repeated audit:** Confirmed in three attempts. There is no `docker` in `PATH`, common paths,
  installed applications registry, processes, or services; Podman is also not available as a compatible runtime.
- **Resolution:** The owner authorized FR-DEC-013: SQLite replaces PostgreSQL/Docker in the MVP.
