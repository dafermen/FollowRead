# Product Vision

**Status:** Validated to proceed with Phase 0  
**Responsible task:** FR-PH00-TASK-002 - COMPLETED  
**Validation date:** 2026-07-24

## Vision

FollowRead will be a supported reading platform that allows people of different ages
to visually follow text while listening, control their pace, preserve their progress, and
continue with downloaded content when they are offline.

The system will also allow an editorial team to prepare and publish synchronized bilingual content
without requiring a new version of the Reader app.

## Problem

Traditional audio and digital text often live separately. For beginning readers, English learners,
and people who need visual support, that separation makes it difficult to identify which word is being
spoken, repeat an exact unit, and resume at the same point later. When an app offers
synchronization, it frequently depends on connectivity, does not keep content locally, or does not allow an
editorial team to publish and correct their own material.

FollowRead addresses two related problems:

1. Reader problem: following, controlling, and resuming narration requires too much effort.
2. Editorial problem: producing and updating synchronized content is often coupled to the client
   or to manual processes that are hard to review.

## Value proposition

FollowRead unites text, narration, timing, and versioned content into an accessible experience:

- highlights the active word and can point to it with an animated hand;
- allows pausing, repeating, rewinding, and changing speed;
- offers content in Spanish, English, or both;
- preserves confirmed progress and downloaded content;
- enables an editorial team to publish changes without updating the app;
- separates secure administration from the reader experience.

## Audience hierarchy

Priority is defined by relationship to product value, not by excluding age groups.

### Primary beneficiaries

- child readers who need a simple interface and visual support;
- English learners who need repetition, translation, and vocabulary;
- adult readers who prefer synchronized narration and configurable controls.

The three segments share the core problem of relating audio and text. Their differences
will be resolved through modes and preferences, not separate applications.

### Enabling users

- editors and reviewers who create and publish content;
- technical administrators who operate the system.

### Supporting stakeholders

- tutors, families, or teachers who accompany readers;
- those responsible for security, content, rights, and operations.

The existence of a child mode does not imply a child account. The relationship between reader, profile, and
responsible adult will be decided in FR-PH00-TASK-003 and FR-PH00-TASK-006.

## Measurable outcomes

These metrics are acceptance goals for the initial product. More precise technical thresholds will be
refined in FR-PH00-TASK-006 and user studies in FR-PH00-TASK-010.

| ID | Outcome | Indicator and initial target | Method |
|---|---|---|---|
| FR-OV-001 | Understandable tracking | At least 90% of participants in a moderated test complete play, pause, and resume without assistance | Usability test by segment |
| FR-OV-002 | Verifiable synchronization | 100% of checkpoints of canonical fixtures resolves the expected word; no incorrect word is shown outside the marks | Unit and integration tests |
| FR-OV-003 | Progress continuity | 100% of automated scenarios recover the last confirmed point or report a safe recovery | Shutdown, restart, and failure tests |
| FR-OV-004 | Useful offline reading | 100% of defined critical flows open, play, and save progress with the network disabled | Offline E2E test |
| FR-OV-005 | Editorial agility | A published compatible version appears in Reader without rebuild or reinstall in all acceptance scenarios | Publish and update test |
| FR-OV-006 | Access to controls | 100% of critical controls work with keyboard and have accessible name/state; zero automated critical violations | Components, E2E and manual review |
| FR-OV-007 | Uninterrupted learning | At least 90% of target participants repeat a unit, change speed, and save a word without leaving the reader | Usability test |
| FR-OV-008 | Resilient update | 100% of corrupted or interrupted downloads preserve a previously valid local version | E2E failure test |

Usability percentage targets are pilot hypotheses, not production claims. Phase 1
will define sample, protocol, and necessary adjustments.

## Signals the vision is not being met

- The user must manually search where they left off.
- The highlight appears to follow a different word than the audio.
- A content update forces publishing another app.
- Network loss prevents opening a valid download.
- The hand or auto-scroll hinders reading.
- An error hides whether progress, draft, or package was preserved.
- An essential learning feature stops working without AI or connectivity.

## Product principles

1. Reading has priority over decorative elements.
2. The user controls audio, motion, hand, size, and translation.
3. Progress is not lost silently.
4. Downloaded content remains useful offline.
5. An error explains what happened, what was preserved, and what can be done.
6. Minors cannot accidentally reach administration.
7. Publishing content requires review and a valid transition.
8. An essential educational feature does not initially depend on artificial intelligence.

## Non-goals

- replace a school or clinical system;
- produce essential machine translations;
- offer a social network;
- create a professional audio editor;
- support all languages at first launch;
- measure minors or collect their data without an approved privacy decision.

## Assumptions and deferred decisions

- The exact priority of segments and profiles will be defined in FR-PH00-TASK-003.
- The MVP cut and the relationship between local progress and account will be defined in FR-PH00-TASK-004.
- The maximum perceptible offset will be quantified in FR-PH00-TASK-006.
- Demonstration content must have documented usage rights before distribution.
- FR-DEC-OPEN-002 and FR-DEC-OPEN-003 remain open and are not resolved by implication.

## Coherence validation

| Criterion | Result |
|---|---|
| Problem and value proposition describe the same core | PASS |
| Reading audiences share a need and are distinct from enabling users | PASS |
| Outcomes have indicator and measurement method | PASS |
| Dynamic content without rebuild is included | PASS |
| Offline use and progress preservation are included | PASS |
| The vision does not assume open decisions on child accounts or translation | PASS |
| Scope, requirements, and initial stories contain capabilities that support the outcomes | PASS |
