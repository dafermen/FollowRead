# Initial Threat Model

**Status:** Validated for Phase 0  
**Responsible task:** FR-PH00-TASK-006 - COMPLETED

## Method

Lightweight STRIDE analysis over trust boundaries. It will be refined when concrete deployment diagrams, endpoints, and storage exist.

## Boundaries

1. Browser/device -> Admin or Reader.
2. Admin/Reader -> Public API.
3. API -> local SQLite file.
4. API/worker -> Polly and S3.
5. Reader -> modifiable local storage.
6. Build pipeline -> deployed artifacts.

## Threats and controls

| ID | Category | Scenario | Impact | Required control | Test |
|---|---|---|---|---|---|
| FR-THREAT-001 | Spoofing | Admin session stolen | Unauthorized publishing | TLS, TTL, revocation, secure hashing | Security |
| FR-THREAT-002 | Tampering | Local package altered | Incorrect text/audio | Checksum/manifest/immutability | Corrupt E2E |
| FR-THREAT-003 | Repudiation | User denies publishing | Loss of traceability | Actor/date/result auditing | Integration |
| FR-THREAT-004 | Information disclosure | AWS secret in bundle/log | Cloud compromise | Backend only, redaction, scanning | Build/security |
| FR-THREAT-005 | Denial of service | Polly abuse | Cost/unavailability | Permission, quota, rate limit, queue | Fake adapter |
| FR-THREAT-006 | Elevation | Reviewer publishes without permission | Invalid content | Server-side authorization | Permission matrix |
| FR-THREAT-007 | IDOR | Reads others' progress/vocabulary | Privacy | Ownership per resource | Negative API tests |
| FR-THREAT-008 | Injection | Malicious text/metadata | Data/client harm | Validation, parameterization, escaping | Negative tests |
| FR-THREAT-009 | Supply chain | Compromised dependency | Build/users affected | Lockfile, review, scanning | CI |
| FR-THREAT-010 | Privacy | Telemetry identifies a minor | Legal risk/harm | FR-DEC-009 and DATA_POLICY | Inventory |
| FR-THREAT-011 | Replay | Re-sending duplicates work | Cost/inconsistent state | Idempotency key | Integration |
| FR-THREAT-012 | Tampering | State transition skipped | Defective publishing | Server state machine | Unit/API |

## Priority severity

Critical/High before production: secrets, publish authorization, child PII, IDOR, processing abuse, and package integrity.

## Future exit criteria

- No High threats without an assigned control and test.
- Role-permission matrix reviewed.
- Data inventory matches models.
- Secrets/dependency scanning in CI.
- Incident response and secret rotation documented.
