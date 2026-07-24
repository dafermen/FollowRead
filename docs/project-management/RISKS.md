# Registro de riesgos

Escala: probabilidad e impacto usan `Low`, `Medium` o `High`.

| ID | Riesgo | Prob. | Impacto | Mitigación | Dueño | Tarea/evidencia | Estado |
|---|---|---|---|---|---|---|---|
| FR-RISK-001 | Alcance excede MVP razonable | High | High | Corte vertical y aplazamientos | Product Owner | FR-PH00-TASK-004 | MITIGATED |
| FR-RISK-002 | Privacidad/consentimiento de menores | Medium | High | Sin cuentas/PII infantil en MVP | Product/Security | FR-PH00-TASK-006; FR-DEC-009 | MITIGATED_FOR_MVP |
| FR-RISK-003 | Speech Marks no coinciden con texto | High | High | Contrato canónico, validación y fixtures | Backend/Reader Engine | FR-AC-001/014; Fase 6/7 | MITIGATION_PLANNED |
| FR-RISK-004 | Costos variables Polly/S3 | Medium | High | Estimación, límites y alertas | Backend/Operations | NFR-COST-001; FR-AC-023 | MITIGATION_PLANNED |
| FR-RISK-005 | Descarga dañada bloquea offline | Medium | High | Checksum, temporal y activación atómica | Reader | FR-AC-004/017; Fase 9 | MITIGATION_PLANNED |
| FR-RISK-006 | Mano reduce legibilidad o causa mareo | Medium | Medium | Ocultar, reduced motion y pruebas | UX/Reader | FR-AC-002/019; Fase 1/8 | MITIGATION_PLANNED |
| FR-RISK-007 | Documentación queda obsoleta | High | Medium | Trazabilidad y validación documental | Tech Lead | FR-PH00-TASK-008/012; QUALITY_GATES | MITIGATING |
| FR-RISK-008 | No existe repositorio Git | High | Medium | Inicializar antes de código | Tech Lead | FR-PH02-TASK-001 | MITIGATED |

## Reglas

- Un riesgo `High/High` debe tener una tarea o criterio de aceptación asociado antes de cerrar Fase 0.
- Un riesgo materializado se mueve también a `KNOWN_ISSUES.md`.
- El registro se revisa al inicio y al cierre de cada fase.
