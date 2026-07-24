# Matriz de trazabilidad

**Estado:** Validado para Fase 0 - FR-PH00-TASK-008 COMPLETED.

| Requirement(s) | User Story | Use Case | Implementation futura | Acceptance | Status |
|---|---|---|---|---|---|
| FR-CONTENT-001..004 | FR-US-ADMIN-001/005 | FR-UC-001/004 | content models/API | FR-AC-010/012 | TRACED |
| FR-CONTENT-005..007 | FR-US-ADMIN-005 | FR-UC-001 | domain state machine | FR-AC-005/012 | TRACED |
| FR-ADMIN-001 | FR-US-SECURITY-001 | FR-UC-006 | Admin auth/API | FR-AC-013/018 | TRACED |
| FR-ADMIN-002..006 | FR-US-ADMIN-001/002 | FR-UC-001/008 | Admin editor/API | FR-AC-013 | TRACED |
| FR-ADMIN-007..011 | FR-US-ADMIN-003..006 | FR-UC-001/010 | Admin processing/review | FR-AC-006/014 | TRACED |
| FR-AUDIO-001..007 | FR-US-ADMIN-003/004/006 | FR-UC-001/010 | API audio services/adapters | FR-AC-006/009/014 | TRACED |
| FR-READER-001..002 | FR-US-READER-006 | FR-UC-011 | Reader catalog/detail | FR-AC-015 | TRACED |
| FR-READER-003..009 | FR-US-READER-001/002/003 | FR-UC-002 | Reader Engine/Reader UI | FR-AC-001/002/003/016 | TRACED |
| FR-READER-010..012 | FR-US-CHILD-001; FR-US-ADULT-001; FR-US-READER-005 | FR-UC-007/012 | Reader modes/profile | FR-AC-015 | TRACED |
| FR-READER-013..014 | FR-US-READER-007/008 | FR-UC-005/012 | learning mode | FR-AC-016 | TRACED |
| FR-READER-015 | FR-US-READER-005; FR-US-TUTOR-001 | FR-UC-007 | Reader preferences | FR-AC-002/008/015 | TRACED |
| FR-OFFLINE-001..008 | FR-US-READER-004/009 | FR-UC-003/004/009 | local catalog/sync | FR-AC-004/007/010/017 | TRACED |
| FR-API-001..002 | FR-US-SECURITY-001 | FR-UC-006 | API identity/RBAC | FR-AC-018/021 | TRACED |
| FR-API-003 | FR-US-ADMIN-005; FR-US-READER-006 | FR-UC-004/011 | catalog API | FR-AC-010/018 | TRACED |
| FR-API-004 | FR-US-READER-003/007 | FR-UC-009/012 | user data API | FR-AC-003/018 | TRACED |
| FR-API-005..006 | FR-US-OPS-001 | FR-UC-010 | audit/health/OpenAPI | FR-AC-018/023 | TRACED |
| FR-API-007 | FR-US-READER-009 | FR-UC-009/012 | sync API | FR-AC-017/018 | TRACED |
| NFR-ACCESSIBILITY-001..006 | FR-US-READER-005 | FR-UC-007 | Admin/Reader UI | FR-AC-008/019 | TRACED |
| NFR-PERFORMANCE-001..005 | FR-US-READER-001/002 | FR-UC-002/011 | Reader Engine/UI | FR-AC-020 | TRACED |
| NFR-RELIABILITY-001..003 | FR-US-READER-003/004/009 | FR-UC-003/009 | storage/sync/jobs | FR-AC-003/004/020 | TRACED |
| NFR-AVAILABILITY-001..002 | FR-US-READER-004; FR-US-OPS-001 | FR-UC-003/010 | offline/operations | FR-AC-007/020 | TRACED |
| NFR-SECURITY-001..007 | FR-US-SECURITY-001 | FR-UC-006/010 | API/build/config | FR-AC-009/021 | TRACED |
| NFR-PRIVACY-001..003 | FR-US-CHILD-001; FR-US-TUTOR-001 | FR-UC-007/012 | data policy/profile | FR-AC-021 | TRACED |
| NFR-MAINTAINABILITY-001..004 | FR-US-OPS-001 | FR-UC-010 | repository/CI | FR-AC-022 | TRACED |
| NFR-COMPATIBILITY-001..002 | FR-US-READER-005 | FR-UC-002/007 | Reader platforms | FR-AC-022 | TRACED |
| NFR-OBSERVABILITY-001..002 | FR-US-OPS-001 | FR-UC-010 | logging/health | FR-AC-023 | TRACED |
| NFR-COST-001 | FR-US-OPS-001 | FR-UC-010 | processing limits | FR-AC-023 | TRACED |
| NFR-RECOVERY-001 | FR-US-OPS-001 | FR-UC-010 | deployment | FR-AC-023 | TRACED |
| NFR-STORAGE-001 | FR-US-READER-004 | FR-UC-003 | package service | FR-AC-023 | TRACED |

## Regla de actualización

Una tarea futura no puede cerrarse si su requisito no tiene historia o justificación, ubicación y
prueba. Los rangos de la tabla son inclusivos y se validan contra los IDs definidos.

## Trazabilidad de resultados de producto

| Outcome | Requisitos principales | Historia | Criterio / método | Estado |
|---|---|---|---|---|
| FR-OV-001 | FR-READER-003, FR-READER-007 | FR-US-READER-001/002 | FR-AC-011 + prueba de usabilidad | TRACED |
| FR-OV-002 | FR-AUDIO-004/005, FR-READER-004/005 | FR-US-READER-001 | FR-AC-001 | TRACED |
| FR-OV-003 | FR-READER-009, FR-API-004/007 | FR-US-READER-003 | FR-AC-003 | TRACED |
| FR-OV-004 | FR-OFFLINE-001/005/007 | FR-US-READER-004 | FR-AC-007 | TRACED |
| FR-OV-005 | FR-CONTENT-004/007, FR-API-003, FR-OFFLINE-002 | FR-US-ADMIN-005 | FR-AC-005/010 | TRACED |
| FR-OV-006 | FR-READER-015, NFR-ACCESSIBILITY-001/002/003 | FR-US-READER-005 | FR-AC-008 | TRACED |
| FR-OV-007 | FR-READER-008/013/014 | FR-US-READER-007/008 | FR-AC-011 + prueba de usabilidad | TRACED |
| FR-OV-008 | FR-OFFLINE-004/005 | FR-US-READER-004 | FR-AC-004 | TRACED |

## Reglas de negocio

| Reglas | Casos principales | Criterios | Estado |
|---|---|---|---|
| FR-BR-001..006 | FR-UC-001 | FR-AC-005/012 | TRACED |
| FR-BR-007..010 | FR-UC-003/004/009 | FR-AC-004/017 | TRACED |
| FR-BR-011..015 | FR-UC-002/007 | FR-AC-015/019 | TRACED |
| FR-BR-016..020 | FR-UC-001/005/010 | FR-AC-012/014/016 | TRACED |
| FR-BR-021..025 | FR-UC-003/009/012 | FR-AC-017/021/023 | TRACED |

## Validación

- Requisitos funcionales cubiertos: 55 de 55.
- Requisitos no funcionales cubiertos: 37 de 37.
- Reglas de negocio cubiertas: 25 de 25.
- Resultados de producto cubiertos: 8 de 8.
- Marcadores pendientes: 0.
