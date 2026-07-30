# Initial Security and Privacy Strategy

**Status:** Validated for Phase 0 - FR-PH00-TASK-006 COMPLETED.

## Principles

- deny by default;
- server-side validation;
- least privilege;
- secrets only in backend/environment;
- minimal data and explicit purpose;
- auditing without logging secrets or unnecessary sensitive content;
- clients and local packages are considered tamperable.

## Assets

- credentials and sessions;
- unpublished content;
- audio, images, and translations with rights;
- progress, favorites, and vocabulary;
- data of minors if present eventually;
- AWS keys and database;
- audit history.

## Initial Threats

| Threat | Initial control |
|---|---|
| Admin access without permission | Authentication, RBAC, action-level authorization |
| Invalid publication | State machine, transaction and auditing |
| AWS credentials in client | Backend-only adapters and secret scanning |
| Tampered package | HTTPS, checksum and validated manifest |
| IDOR in progress/vocabulary | Ownership verified in API |
| Injection | Pydantic, parameterized queries and limits |
| Abuse of audio generation | Permissions, quotas, estimation and future rate limiting |
| Logs with sensitive data | Redaction and defined structure |
| Child account without consent | Prohibit until product/legal decision |

## Identity and Session

Editorial accounts use Argon2id and server-revocable opaque sessions. SQLite stores only
hashes of the session token and the CSRF token. The browser receives a host-only session cookie,
`HttpOnly`, `SameSite=Strict` and `Secure` in production, plus a separate CSRF cookie. JWTs
or web storage for credentials are not used.

Inactivity expires after 30 minutes and the absolute maximum is 8 hours. Login and logout validate an
exact origin; logout requires a match between cookie, CSRF header and persisted hash. All
responses `/auth` use `Cache-Control: no-store`, and CORS only allows configured origins with
credentials.

Five failures within a 15-minute window lock the credential for 15 minutes. An
expired window resets the counter and a valid login clears the state. Successful login, failed login,
locked account and logout generate audit events with a correlation ID; the evidence does not contain plain email,
password or tokens.

## Authorization

The API verifies explicit permissions and denies by default; role names are not used as
direct authorization.

| Role | Initial permissions |
|---|---|
| `super_admin` | all MVP permissions |
| `content_admin` | Admin access, create, edit, process and publish content |
| `reviewer` | Admin access and review content |
| `reader` | no administrative permissions |

Stable permissions: `admin.access`, `users.manage`, `content.create`, `content.edit`,
`content.process`, `content.review`, `content.publish` and `audit.read`. The bootstrap syncs the
matrix idempotently. Every administrative route requires an active session and each action declares
its permission; `/admin/access` verifies initial access.

## Data and Privacy

Before creating child accounts the following will be defined:

- legal basis and consent;
- guardian-profile relationship;
- age and region;
- retention and deletion;
- export;
- allowed analytics;
- support and recovery.

FR-DEC-009 prohibits personal accounts and PII of minors in the MVP. The full policy is located
at `docs/requirements/DATA_POLICY.md`.

## AWS

- credentials via roles or secure backend variables;
- private buckets and encryption;
- separate permissions per environment;
- temporary URLs of minimum necessary duration if used;
- do not use real resources during automated tests;
- log IDs and results, not secrets.

## Sessions and Web Protection

- updatable Argon2id hash;
- short-lived opaque sessions, revocable and rotated on authenticate;
- CSRF protection and origin verification for unsafe methods;
- CSP, HSTS and appropriate headers in production;
- rate limiting for login, recovery and processing;
- authentication messages that do not reveal account existence.

## Dependencies and Vulnerabilities

- lockfiles required;
- review before adding a dependency;
- scanning in CI;
- critical patch prioritized and recorded;
- reproducible artifacts and verifiable provenance when the platform allows.

## Initial Incident Response

1. contain access or stop publishing/processing;
2. preserve evidence securely;
3. rotate affected secrets;
4. assess impacted data/content;
5. restore from a verified state;
6. document cause, communication and prevention.

## Related References

- `docs/architecture/THREAT_MODEL.md`
- `docs/requirements/DATA_POLICY.md`
- `docs/requirements/NON_FUNCTIONAL_REQUIREMENTS.md`

## Validation

- Trust limits and assets defined: PASS.
- Threats have controls and proof: PASS.
- Child privacy has explicit decision: PASS.
- Sessions, secrets, auditing and dependencies have strategy: PASS.
