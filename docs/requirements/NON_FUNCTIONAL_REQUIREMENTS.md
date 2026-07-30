# Non-functional Requirements

**Document status:** Validated for Phase 0 - FR-PH00-TASK-006 COMPLETED.  
Goals are initial verifiable thresholds; a recorded decision may adjust them with evidence.

## Accessibility

| ID | Requirement | Priority | Target | Source | Verification |
|---|---|---|---|---|---|
| NFR-ACCESSIBILITY-001 | Admin and Reader will meet WCAG 2.2 AA in MVP flows | Must | Zero critical defects; manual review of applicable criteria | Prompt §22 | axe + audit |
| NFR-ACCESSIBILITY-002 | All primary actions will work with keyboard | Must | 100% free of traps and with visible focus | Prompt §22 | Manual/E2E |
| NFR-ACCESSIBILITY-003 | Controls will have accessible name, state, and message | Must | 100% of critical controls | Prompt §22 | Components |
| NFR-ACCESSIBILITY-004 | Touch targets will be appropriate | Must | Minimum 24x24 CSS px; 44x44 preferred | WCAG 2.2 / Prompt | Inspection |
| NFR-ACCESSIBILITY-005 | Motion and hand interactions can be reduced or hidden | Must | 100% respects preference and setting | Prompt §11/22 | Preferences |
| NFR-ACCESSIBILITY-006 | Color will not be the sole indicator | Must | 100% of critical states have an additional signal | Prompt §22 | Visual/manual |

## Performance and Reliability

| ID | Requirement | Priority | Target | Source | Verification |
|---|---|---|---|---|---|
| NFR-PERFORMANCE-001 | Playback will respond without perceptible jank | Must | No UI task >50 ms in critical control | Prompt §22 | Profile |
| NFR-PERFORMANCE-002 | Resolving active word will be efficient | Must | p95 <2 ms with 10,000 marks in reference | Prompt §10/22 | Benchmark |
| NFR-PERFORMANCE-003 | Catalog and images will use lazy loading | Should | No resources outside viewport except documented prefetch | Prompt §22 | Network |
| NFR-PERFORMANCE-004 | Highlighting will follow the audio clock | Must | Visual update <=150 ms p95 from observed timestamp | FR-OV-002 | Integration |
| NFR-PERFORMANCE-005 | Local content will open quickly | Must | p75 <=2 s on reference device | Prompt §22 | E2E |
| NFR-RELIABILITY-001 | Confirmed progress will not be lost silently | Must | 100% of interruption scenarios preserve or explain | Prompt §2 | Failures |
| NFR-RELIABILITY-002 | Local packages will activate atomically | Must | Zero partial versions active | Prompt §7 | Interrupted download |
| NFR-RELIABILITY-003 | Retries will be idempotent | Must | Same state after 3 resends | Prompt §12 | Integration |
| NFR-AVAILABILITY-001 | Downloaded content will open without backend | Must | 100% of critical flow offline | Prompt §22 | E2E offline |
| NFR-AVAILABILITY-002 | Operational recovery will have objectives | Should | RTO 4 h and RPO 24 h for MVP | Deployment strategy | Simulation |

## Security and Privacy

| ID | Requirement | Priority | Target | Source | Verification |
|---|---|---|---|---|---|
| NFR-SECURITY-001 | No secret will be included in client or Git | Must | Zero detected secrets | Prompt §4/27 | Scanning |
| NFR-SECURITY-002 | API will validate all inputs | Must | 100% of endpoints with schema/limits | Prompt §22 | Negative tests |
| NFR-SECURITY-003 | Authorization will be enforced on the server | Must | Deny by default; complete matrix | Prompt Phase 4 | Permissions |
| NFR-SECURITY-004 | Passwords will use a strong hash | Must | Argon2id or documented current standard | Prompt Phase 4 | Config review |
| NFR-SECURITY-005 | CORS will be restrictive per environment | Must | No wildcard with credentials/production | Prompt §22 | Config |
| NFR-SECURITY-006 | Privileged events will be auditable | Must | Actor, action, target, date, and outcome | Prompt §13/22 | Audit |
| NFR-SECURITY-007 | Privileged sessions will expire and be revocable | Must | TTL and revocation tested | Prompt Phase 4 | Security |
| NFR-PRIVACY-001 | Data will only be collected with purpose | Must | 100% of fields in inventory | Prompt §22 | Review |
| NFR-PRIVACY-002 | MVP will not store PII of minors | Must | Zero fields/telemetry that identify children | FR-DEC-009 | Inventory/E2E |
| NFR-PRIVACY-003 | Deletion/export will be designed before Reader accounts | Must | Flows documented before enabling account | Privacy | Review |

## Maintainability and Compatibility

| ID | Requirement | Priority | Target | Source | Verification |
|---|---|---|---|---|---|
| NFR-MAINTAINABILITY-001 | TypeScript will use `strict` and avoid `any` | Must | Zero errors; exceptions justified | Prompt §25 | CI |
| NFR-MAINTAINABILITY-002 | Python will use type hints and clear layering | Must | Static check/review without critical violations | Prompt §25 | CI/review |
| NFR-MAINTAINABILITY-003 | Reader Engine will not depend on React | Must | Zero prohibited imports | Prompt §10 | Architecture |
| NFR-MAINTAINABILITY-004 | Decisions/dependencies will be documented | Must | 100% of material changes with ADR/record | Prompt §25 | PR |
| NFR-COMPATIBILITY-001 | Reader will run on modern browsers | Must | Last 2 stable versions of Chrome, Edge, Firefox, and Safari at release | Prompt §22 | Playwright/manual |
| NFR-COMPATIBILITY-002 | Reader will support orientation and safe areas | Must | Zero critical controls inaccessible | Prompt §22/Phase 10 | Devices |

## Operation and Cost

| ID | Requirement | Priority | Target | Source | Verification |
|---|---|---|---|---|---|
| NFR-OBSERVABILITY-001 | API/jobs will emit structured logs | Must | Correlation ID in 100% of the flow with no sensitive data | Prompt §22 | Inspection |
| NFR-OBSERVABILITY-002 | Health checks will distinguish liveness/availability | Must | Endpoints with explicit dependencies | Prompt Phase 3 | API |
| NFR-COST-001 | Processing will estimate cost and enforce limits | Should | Mandatory limit per environment; excess blocks before AWS | Prompt Phase 6 | Fake adapter |
| NFR-RECOVERY-001 | Deployments/migrations will have rollback | Must | Procedure tested in staging | Prompt Phase 13 | Simulation |
| NFR-STORAGE-001 | Packages will have configurable limit | Should | 250 MB per package by default; warning from 100 MB | Offline | Fixtures |

## Initial Retention

- privileged audit: minimum 365 days, configurable;
- processing jobs and errors: 90 days after completion;
- drafts: until removed by editor or organizational policy;
- authenticated progress/favorites/vocabulary: until deletion request;
- local profile: until app data is deleted;
- download temporaries: immediate cleanup or on next safe startup.

## Validation

- Each requirement has ID, priority, target, source, and verification: PASS.
- Accessibility WCAG 2.2 AA has scope and method: PASS.
- Performance, offline, compatibility, and recovery have thresholds: PASS.
- Security, secrets, auditability, and child privacy have verifiable strategy: PASS.
