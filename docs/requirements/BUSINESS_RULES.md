# Business rules

**Status:** Validated for Phase 0 - FR-PH00-TASK-005 COMPLETED.

| ID | Rule | Source | Verification |
|---|---|---|---|
| FR-BR-001 | Only `published` appears in the public catalog | Prompt §13 | Query per state |
| FR-BR-002 | Each publication references an immutable version | Prompt §7/13 | Edit attempt rejected |
| FR-BR-003 | A published correction creates another version | Prompt §6/7 | Incremental versioning |
| FR-BR-004 | Every transition is validated and audited | Prompt §13 | Valid/invalid matrix |
| FR-BR-005 | Only explicit permissions approve or publish | Prompt Phase 4 | Role-based cases |
| FR-BR-006 | Audio and marks belong to the same version/language as the text | Prompt §12 | Referential integrity |
| FR-BR-007 | Invalid checksum never replaces a valid local copy | Prompt §7 | Simulated corruption |
| FR-BR-008 | An update failure does not block valid local content | Prompt §7 | E2E interruption |
| FR-BR-009 | Progress is identified by profile/account, content, version and anchor | Prompt §2/10 | Save/retrieve |
| FR-BR-010 | An update attempts to migrate progress by stable anchor | Prompt §7 | Compatible version |
| FR-BR-011 | Hand and animations are optional | Prompt §9/11 | Preferences and reduced motion |
| FR-BR-012 | Reader and Admin do not receive AWS credentials | Prompt §4/12 | Scanning and architecture |
| FR-BR-013 | Automation does not invoke real AWS | Prompt Phase 6 | Fake adapters |
| FR-BR-014 | Initial languages are English and Spanish | Prompt §8 | Enum/validation |
| FR-BR-015 | Initial levels use the enum defined in §8 | Prompt §8 | Enum/validation |
| FR-BR-016 | Types are `story`, `article`, `book`, `lesson`; document uses `article` | Prompt §8; FR-DEC-007 | Type contract |
| FR-BR-017 | Published essential translation is editorial and versioned | FR-DEC-008 | Review/publication |
| FR-BR-018 | Child MVP does not create a personal account or child's PII | FR-DEC-009 | Data inventory |
| FR-BR-019 | A processing job uses an idempotent key | Prompt §12 | Re-send does not duplicate |
| FR-BR-020 | Publication requires valid processing/review | Prompt §12/13 | Transition rejected |
| FR-BR-021 | An incompatible package does not activate | Prompt §7 | Major minimum version |
| FR-BR-022 | Local deletion does not remove authorized remote progress | Prompt Phase 9 | Deletion flow |
| FR-BR-023 | Repeated synchronization produces the same state | Prompt Phase 9 | Re-sending operations |
| FR-BR-024 | User errors do not expose secrets or internal details | Prompt §22/27 | Response tests |
| FR-BR-025 | Free-form notes are out of scope for the MVP | FR-DEC-010 | Scope review |

## Proposed state machine

```text
draft
  -> ready_for_processing
  -> processing
     -> processing_failed -> ready_for_processing
     -> ready_for_review
        -> review_rejected -> draft
        -> approved
           -> published
              -> unpublished -> published
              -> archived
           -> archived
draft -> archived
```

Any transition not drawn is considered invalid until a recorded decision authorizes it.

## Publication conditions

A version may only be published if:

1. it has structured content and required metadata;
2. its declared languages have consistent resources;
3. audio and marks were validated when narration applies;
4. cover/required resources are accessible;
5. compatibility and checksum were calculated;
6. an actor with permission approved it;
7. the transition is audited.

## Initial progress resolution

- A greater `updatedAt` does not automatically win if it represents an earlier position.
- Operations carry an idempotent ID.
- The client retains a pending copy until confirmation.
- A definitive conflict policy will be approved before Phase 9.

## Validation

- Publication, versioning, integrity, permissions and progress rules: PASS.
- Each rule has source and verification: PASS.
