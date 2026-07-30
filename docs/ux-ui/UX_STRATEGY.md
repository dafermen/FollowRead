# UX Strategy and Accessibility

**Status:** Validated for Phase 0 - FR-PH00-TASK-010 COMPLETED.

## Experience North Star

Content should dominate the screen. Primary controls remain visible or easy to recover, states are communicated clearly, and no decoration competes with reading.

## One foundation, adapted modes

FollowRead will have a common reading system with presentation configurations:

- **Infant:** large typography and targets, reduced navigation, hand visible by default, few decisions, illustrations and safe output.
- **Adult:** sober layout, optional hand, configurable typography, theme and highlight unit.
- **Learn English:** English primary, optional translation, quick repetition, speed and vocabulary in context.

Three disconnected products will not be created. The main logic and essential controls are shared; differences are expressed as policies and preferences.

## Interaction principles

1. One primary action per view.
2. Playback and progress are never hidden behind unfamiliar gestures.
3. An error preserves context and offers recovery.
4. A download shows size, progress, result and availability.
5. Destructive or publishing actions ask for appropriate confirmation.
6. Focus does not jump unexpectedly during auto-scroll.
7. Tapping a word must not trigger accidental navigation.

## Hand and highlighting

- The active word will have a perceptible highlight without relying solely on color.
- The hand will be positioned by the active word's box and a safe bottom area.
- The visual component will observe scroll, resize, loaded fonts and orientation change.
- The hand is hidden with preference, lack of space or reduced motion.
- A handless mode preserves all information via highlighting and semantics.

## Accessibility by design

- WCAG 2.2 AA as a reasonable target;
- full keyboard navigation;
- announceable names and states;
- visible focus and logical order;
- documented contrast;
- zoom and reflow without loss of actions;
- enlarged touch targets in infant mode;
- reduced motion preference;
- text available even if audio fails;
- status messages not relying on color alone.

## Required states for each flow

- initial and empty;
- loading;
- success;
- recoverable error;
- non-recoverable error;
- offline;
- pending sync;
- insufficient permission;
- incompatible or removed content.

## Phase 1 validation

- interviews or review with representatives when possible;
- task walkthroughs for each audience;
- responsive wireframes;
- reader and editor prototypes;
- review of keyboard, screen reader and motion;
- hand testing on lines, zoom, orientation and scroll.

## Relationship to personas

| Experience | Primary personas | Dominant UX risk |
|---|---|---|
| Infant | FR-PERSONA-001/004 | Overload, accidental activation, motion |
| Learn English | FR-PERSONA-002 | Losing context and dense controls |
| Adult | FR-PERSONA-003 | Infantilized presentation and long sessions |
| Admin editor | FR-PERSONA-005 | Draft loss and late errors |
| Review/operations | FR-PERSONA-006/007 | Opaque state and privileged actions |

## Phase 0 outcome

- Distinct modes without duplicated apps: PASS.
- Hand, motion, contrast, keyboard, screen reader and touch: PASS.
- Empty, loading, error, offline and permission states: PASS.
- Principles convertible into a Phase 1 checklist: PASS.

See `ACCESSIBILITY_FOUNDATIONS.md`.
