# Risk register

Scale: probability and impact use `Low`, `Medium` or `High`.

| ID | Risk | Prob. | Impact | Mitigation | Owner | Task/evidence | Status |
|---|---|---|---|---|---|---|---|
| FR-RISK-001 | Scope exceeds reasonable MVP | High | High | Vertical cut and deferrals | Product Owner | FR-PH00-TASK-004 | MITIGATED |
| FR-RISK-002 | Minor privacy/consent | Medium | High | No child accounts/PII in MVP | Product/Security | FR-PH00-TASK-006; FR-DEC-009 | MITIGATED_FOR_MVP |
| FR-RISK-003 | Speech Marks don't match text | High | High | Canonical contract, validation and fixtures | Backend/Reader Engine | FR-AC-001/014; Phase 6/7 | MITIGATION_PLANNED |
| FR-RISK-004 | Variable Polly/S3 costs | Medium | High | Estimation, limits and alerts | Backend/Operations | NFR-COST-001; FR-AC-023 | MITIGATION_PLANNED |
| FR-RISK-005 | Corrupt download blocks offline | Medium | High | Checksum, temporary file and atomic activation | Reader | FR-AC-004/017; Phase 9 | MITIGATION_PLANNED |
| FR-RISK-006 | Hand reduces readability or causes dizziness | Medium | Medium | Hide, reduced motion and testing | UX/Reader | FR-AC-002/019; Phase 1/8 | MITIGATION_PLANNED |
| FR-RISK-007 | Documentation becomes outdated | High | Medium | Traceability and document validation | Tech Lead | FR-PH00-TASK-008/012; QUALITY_GATES | MITIGATING |
| FR-RISK-008 | No Git repository exists | High | Medium | Initialize before code | Tech Lead | FR-PH02-TASK-001 | MITIGATED |

## Rules

- A `High/High` risk must have an associated task or acceptance criterion before closing Phase 0.
- A realized risk is also moved to `KNOWN_ISSUES.md`.
- The register is reviewed at the start and end of each phase.
