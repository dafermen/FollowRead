# Initial Data Policy

**Status:** Approved for MVP design  
**Responsible task:** FR-PH00-TASK-006 - COMPLETED

## Principles

1. Collect the minimum necessary.
2. Define purpose before creating a field.
3. Separate editorial content, operational data, and user data.
4. Do not store minors' PII in the MVP.
5. Allow local reading without an account.
6. Do not include sensitive data in logs.
7. Design export and deletion before enabling Reader accounts.

## Initial inventory

| Category | Data | Purpose | Location | Initial retention |
|---|---|---|---|---|
| Admin | email/identifier, hash, roles | Editorial access | API/SQLite | While active + policy |
| Admin Session | token/CSRF hashes, timestamps and revocation | Revocable authenticated access | API/SQLite | Until expired/revoked + 30-day operational cleanup |
| Content | text, translation, metadata | Publishing/reading | SQLite/S3/local | Per version/editorial policy |
| Assets | audio, marks, images | Synchronized reading | S3/local | Per version |
| Audit | actor, action, target, outcome | Security/traceability | SQLite/logs | >=365 days |
| Job | stage, safe error, estimated cost | Processing/diagnosis | SQLite/logs | 90 days after completion |
| Local profile | non-identifiable preferences and alias | Personalization | Device | Until app/data is deleted |
| Progress | content, version, anchor, date | Resume/sync | Local/optional API | Until deletion |
| Favorites | content IDs | Personal library | Local/optional API | Until deletion |
| Vocabulary | word, context, content | Learning | Local/optional API | Until deletion |

## Minors

For the MVP:

- it does not request a minor's legal name, email, date of birth, school, or location;
- it does not create a child personal account;
- it does not send identifiable analytics of child usage;
- it allows a non-identifiable local profile or a supervised session;
- it does not present the local profile as a legal consent mechanism.

Before changing these rules, a decision is required covering jurisdictions, age, consent,
guardian-child relationship, export, deletion, retention, and responses to requests.

## Logs and telemetry

Allowed: correlation ID, internal identifiers, stage, duration, error code, and counts.

Prohibited by default: passwords, tokens, keys, full private text, personal vocabulary,
free-text email addresses, minors' data, and full signed URLs.

Authentication events use internal identifiers, action, result, and correlation ID. They do not
store the attempted password, the token, the requested email, or HTTP bodies.

Session and CSRF tokens are delivered only to the corresponding client. SQLite retains their hashes,
never usable values. Revoked or expired sessions may be removed by an operational
cleanup once 30 days have passed; the required security evidence lives in audit.

## Rights and deletion

- Local data can be deleted from settings or platform data.
- A future account must offer export and deletion requests.
- Legally required audit records can be kept separate and minimized.
- Deleting a download does not remove remote progress; the user must distinguish the two actions.

## Validation

- Each category has purpose, location, and retention: PASS.
- The policy complies with FR-DEC-009: PASS.
- Logs have allowed/prohibited lists: PASS.
- Local reading does not depend on an account: PASS.
