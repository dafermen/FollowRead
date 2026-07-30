# Screen and States Inventory

**Status:** Validated  
**Responsible task:** FR-PH01-TASK-001 - COMPLETED  
**Date:** 2026-07-24

## Rules

- Admin and Reader are separate applications.
- A screen has one primary action; secondary actions do not compete visually.
- All states communicate what happened, what was preserved, and the next action.
- Reader modes change presentation/policies, they do not create duplicate routes.

## Reader

| ID | Screen | Persona | Primary action | Specific states | Cases |
|---|---|---|---|---|---|
| FR-SCREEN-R01 | Home | 001-004 | Continue/discover reading | new, with progress, offline | UC-003/011 |
| FR-SCREEN-R02 | Library | 001-003 | Choose content | empty, local, remote, mixed | UC-011 |
| FR-SCREEN-R03 | Categories | 001-003 | Filter category | empty, selected | UC-011 |
| FR-SCREEN-R04 | Search | 002-003 | Search | initial, no results, results | UC-011 |
| FR-SCREEN-R05 | Detail | 001-004 | Read/download | compatible, downloaded, incompatible | UC-003/011 |
| FR-SCREEN-R06 | Player | 001-003 | Play/control | playing, paused, error, offline | UC-002/005/007 |
| FR-SCREEN-R07 | Downloads | 002-004 | Manage download | in progress, paused, corrupted, complete | UC-003/004 |
| FR-SCREEN-R08 | Favorites | 002-003 | Open favorite | empty, local, pending | UC-012 |
| FR-SCREEN-R09 | History | 002-003 | Resume | empty, local progress/synced | UC-009/012 |
| FR-SCREEN-R10 | Vocabulary | 002 | Study word | empty, filtered, pending | UC-005/012 |
| FR-SCREEN-R11 | Settings | 001-004 | Apply preferences | system, custom, local error | UC-007 |
| FR-SCREEN-R12 | Profile | 002-004 | Choose/manage profile | local, guest, future account | UC-007/012 |

## Admin

| ID | Screen | Persona | Primary action | Specific states | Cases |
|---|---|---|---|---|---|
| FR-SCREEN-A01 | Login | 005-007 | Sign in | initial, invalid, locked | UC-006 |
| FR-SCREEN-A02 | Dashboard | 005-007 | Continue work | empty, alerts, active jobs | UC-001/010 |
| FR-SCREEN-A03 | Content list | 005-006 | Open/create content | empty, filters, permission | UC-001 |
| FR-SCREEN-A04 | Create content | 005 | Create draft | clean, invalid, saving | UC-001/008 |
| FR-SCREEN-A05 | Edit content | 005 | Save changes | saved, pending, conflict, error | UC-001/008 |
| FR-SCREEN-A06 | Chapters/paragraphs | 005 | Edit structure | empty, reordering, invalid | UC-001 |
| FR-SCREEN-A07 | Translations | 005-006 | Associate translation | missing, misaligned, complete | UC-001 |
| FR-SCREEN-A08 | Voice | 005 | Choose voices | not chosen, incompatible, valid | UC-001 |
| FR-SCREEN-A09 | Processing | 005-007 | Process/retry | queued, in progress, failed, canceled | UC-001/010 |
| FR-SCREEN-A10 | Review | 006 | Approve/reject | pending, defect, valid | UC-001 |
| FR-SCREEN-A11 | Preview | 005-006 | Play version | audio missing, misaligned, valid | UC-001/002 |
| FR-SCREEN-A12 | Publish | 006 | Publish | locked, confirmation, published | UC-001/006 |
| FR-SCREEN-A13 | History/audit | 006-007 | Investigate change | empty, filtered, detail | UC-001/010 |
| FR-SCREEN-A14 | Errors/jobs | 007 | Diagnose/retry | active, failed, limit, resolved | UC-010 |

## Mandatory global states

| State | Minimum behavior |
|---|---|
| Initial | Explains possible action without ghost content |
| Empty | Reason and appropriate action |
| Loading | Preserves context; allows cancel when applicable |
| Success | Confirms result without blocking the next action |
| Recoverable error | Explains what was preserved and offers retry |
| Non-recoverable error | Safe route and correlation ID when applicable |
| Offline | Maintains local functions and indicates pending items |
| Pending sync | Is not presented as remote saved |
| Insufficient permission | Does not perform effects nor reveal information |
| Incompatible/retired | Does not activate package and offers an alternative |

## Coverage

- Minimum Reader screens: 12 of 12.
- Minimum Admin screens: 14 of 14.
- Cases covered: FR-UC-001, FR-UC-002, FR-UC-003, FR-UC-004, FR-UC-005, FR-UC-006,
  FR-UC-007, FR-UC-008, FR-UC-009, FR-UC-010, FR-UC-011 and FR-UC-012.
- Personas covered: FR-PERSONA-001, FR-PERSONA-002, FR-PERSONA-003, FR-PERSONA-004,
  FR-PERSONA-005, FR-PERSONA-006 and FR-PERSONA-007.
- Applicable global states defined: 10.
- Admin/Reader separation: PASS.
