# User profiles and stakeholders

**Status:** Validated for Phase 0  
**Responsible task:** FR-PH00-TASK-003 - COMPLETED  
**Date:** 2026-07-24

## Concepts

- **Persona:** individual who interacts with or benefits from the product.
- **User:** person who performs actions in Reader, Admin, or API.
- **Account:** authenticable identity; a person may use Reader without an account in the MVP.
- **Profile:** preferences and reading progress associated locally or with an account.
- **Role:** set of system permissions, not a demographic description.
- **Stakeholder:** person responsible or affected who may not use the product directly.

This distinction avoids assuming that a child reader needs their own account.

## FR-PERSONA-001 - Accompanied child reader

- **Type:** Primary beneficiary.
- **Context:** Child who reads alone or with someone, in short sessions and with variable digital experience.
- **Goal:** Follow a story without losing the active word and control basic actions.
- **Barriers:** Too many controls, small text, accidental navigation, excessive movement,
  reliance on network, and abstract messages.
- **Needs:** Large typography and targets, visible primary action, optional hand indicator, audio,
  automatic progress, safe exit, and age-appropriate content.
- **Accessibility:** Not relying solely on color; compatibility with reduced motion; full reading even if the hand indicator or audio fails.
- **Account/data:** In the MVP uses a local profile or an adult-managed session, without an account or personal data of its own.
- **Expected outcome:** Can start, pause, and resume a story with minimal help.
- **Modes:** child, Spanish, English.
- **Vision outcomes:** FR-OV-001, FR-OV-003, FR-OV-004, FR-OV-006.

## FR-PERSONA-002 - English learner

- **Type:** Primary beneficiary.
- **Context:** Teen or adult who understands basic text and needs to relate sound, writing, and meaning.
- **Goal:** Listen, repeat, and study exact units without leaving the context.
- **Barriers:** High speed, decontextualized translations, navigating across multiple screens, and loss of saved vocabulary.
- **Needs:** English text as primary, optional editorial translation, repetition of word/sentence, speed control, vocabulary, and progress.
- **Accessibility:** Keyboard, screen reader, text and motion adjustments.
- **Account/data:** Can start as a local profile; a future account enables synchronization.
- **Expected outcome:** Repeats a unit, adjusts speed, and saves vocabulary within the reader.
- **Modes:** learn English, English.
- **Vision outcomes:** FR-OV-001, FR-OV-002, FR-OV-003, FR-OV-007.

## FR-PERSONA-003 - Adult reader

- **Type:** Primary beneficiary.
- **Context:** Adult who alternates reading and narration, uses long sessions or needs visual support.
- **Goal:** Consume content with a sober, adaptable, and reliable presentation.
- **Barriers:** Childish interface, mandatory hand indicator, insufficient contrast, loss of position, and disappearing controls.
- **Needs:** Optional hand indicator, configurable size/theme, favorites, history, speed control, and offline support.
- **Accessibility:** Zoom, reflow, keyboard, screen reader, and persistent controls.
- **Account/data:** Local profile in MVP; authenticated synchronization is added without preventing offline use.
- **Expected outcome:** Completes and resumes readings with their preferences.
- **Modes:** adult, Spanish, English.
- **Vision outcomes:** FR-OV-001, FR-OV-003, FR-OV-004, FR-OV-006.

## FR-PERSONA-004 - Tutor, family member, or teacher

- **Type:** Supporting stakeholder.
- **Context:** Accompanies a reader and selects appropriate content or settings.
- **Goal:** Start a safe experience without administering infrastructure or editorial content.
- **Barriers:** Dangerous controls accessible, ambiguous child accounts, and progress that is hard to interpret.
- **Needs:** Absolute separation from Admin, safe exit, clear information, and local profiles.
- **Accessibility:** Understandable instructions and controls operable with diverse abilities.
- **Account/data:** No tutor portal is assumed in the MVP.
- **Expected outcome:** Configures an appropriate session without exposing administration.

## FR-PERSONA-005 - Content editor

- **Type:** Enabler user.
- **Expected role:** `content_admin`.
- **Context:** Prepares structured text, translations, and metadata during extended sessions.
- **Goal:** Create correct content without losing work.
- **Barriers:** Ambiguous forms, late errors, invisible autosave, and misaligned bilingual editing.
- **Needs:** Drafts, early validation, save-state indicators, clear structure, and a bilingual view.
- **Accessibility:** Full keyboard, labels, associated errors, and predictable focus.
- **Expected outcome:** Leaves a version ready for processing with validations satisfied.

## FR-PERSONA-006 - Reviewer and publisher

- **Type:** Enabler user.
- **Expected roles:** `reviewer` and explicit publishing permission.
- **Context:** Reviews text, audio, synchronization, rights, and compatibility before publishing.
- **Goal:** Prevent a defective version from reaching the catalog.
- **Barriers:** Opaque states, playback different from Reader, and lack of history.
- **Needs:** Faithful preview, list of validations, comments, rejection, and audit trail.
- **Accessibility:** Comparison that does not rely solely on color; playback controllable by keyboard.
- **Expected outcome:** Approves or rejects with evidence and a valid transition.

## FR-PERSONA-007 - Technical operator

- **Type:** Enabler user / stakeholder.
- **Expected role:** `super_admin` or limited operational permission.
- **Context:** Investigates jobs, integrations, storage, and errors.
- **Goal:** Recover the service without silently altering content.
- **Barriers:** Logs without correlation, insecure errors, duplicate retries, and invisible costs.
- **Needs:** Correlation IDs, job status, idempotent retry, metrics, and audit.
- **Accessibility:** Dashboards with semantic structure and textual states.
- **Expected outcome:** Diagnoses the failed stage and performs a safe recovery.

## Coverage matrix

| Need | Child | English | Adult | Tutor | Editor | Reviewer | Operator |
|---|---:|---:|---:|---:|---:|---:|---:|
| Audio and highlighting | X | X | X |  |  | X |  |
| Progress/offline | X | X | X | X |  |  |  |
| Accessible settings | X | X | X | X | X | X | X |
| Translation/vocabulary |  | X |  |  | X | X |  |
| Draft and validation |  |  |  |  | X | X |  |
| Publishing and audit |  |  |  |  |  | X | X |
| Diagnostics and retry |  |  |  |  |  |  | X |

## Validation

- All reading modes have at least one profile: PASS.
- Each profile contains context, goal, barrier, accessibility, and outcome: PASS.
- Persona, account, profile, role, and stakeholder are distinguished: PASS.
- The responsible adult role is defined without inventing a child account: PASS.
