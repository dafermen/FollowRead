# Accessibility Specification

**Status:** Validated for design  
**Responsible task:** FR-PH01-TASK-006 - COMPLETED  
**Goal:** WCAG 2.2 AA for MVP flows.

## Keyboard by pattern

| Pattern | Interaction | Focus on open/close |
|---|---|---|
| Navigation | Tab/Shift+Tab; Enter activates | new route focuses h1 when appropriate |
| Drawer | button opens; Escape closes | first element / returns to button |
| Dialog | Tab within content; Escape if cancelable | meaningful initial / returns to trigger |
| Tabs | arrow keys between tabs; Tab to panel | active tab |
| Combobox | arrows, Enter, Escape | field retains focus |
| Reorderable list | move up/down buttons and announcement | moved item |
| Media controls | Tab + Space/Enter | control activated |
| WordToken | Tab only when interactive; Enter/Space | word retains focus |
| Reversible toast | reachable without stealing focus | returns to context |
| Error summary | links to fields | invalid field |

Dragging, hover, or gestures are not required as the sole way to complete an action.

## Focus

- 3px indicator with offset and sufficient contrast.
- Never hidden behind header, sticky controls, or virtual keyboard.
- Visual auto-scroll does not move focus.
- Adding/removing an element moves focus to a predictable, announced location.
- Incremental loading does not insert content before the focus.
- Protected routes focus the denial message.

## Screen reader

- One region `main` and one h1 per screen.
- Distinctly named navigation when there are multiple.
- Save/download states use `status`; urgent errors use `alert` sparingly.
- Progress has name, value, and text.
- The visually active word is not announced on every tick: that would create noise. The full text remains available and position is announced on demand.
- SVG hand is decorative (`aria-hidden`) because the highlight contains the information.
- Playback controls expose the current action: "Pause" while playing.

## Text, color, and content

- Critical pairs exceed 4.5:1 per `DESIGN_SYSTEM.md`.
- Large text and non-text elements meet their applicable thresholds.
- States combine text, icon, and color.
- Errors use concrete language and are associated with the field.
- Translations preserve language tag (`lang`).
- Language changes are marked by fragment.

## Touch and pointer

- 24x24 CSS px minimum; 44x44 in kid mode.
- Alternative to drag for reordering.
- Alternative to hover for tooltips/information.
- Cancellation or undo for accidental activations when reasonable.
- Touchable words maintain separation or use a contextual surface without preventing selection.

## Motion

- `prefers-reduced-motion` respected on first render.
- Inherent adjustment may reduce motion further, never force movement against system preference.
- Hand/auto-scroll jump without animation when reduced.
- Nothing flashes above the safe threshold.
- Audio playback does not start unexpectedly, except for chosen auto-read.

## Admin forms

- Persistent labels; placeholder does not replace label.
- Requirements and format are explained before errors.
- Error summary on submit; focus to summary; links to fields.
- Autosave does not replace an explicit button/state when there is a conflict.
- Bilingual editor uses groups with language and related unit.

## Kid mode

- Reduced navigation and safe exit.
- 44px controls and spacing between actions.
- Short messages with visible recovery.
- Does not request PII or present a child login.
- Illustration does not displace essential controls.

## Per-screen audit

Each screen must test:

1. full keyboard;
2. visible focus and logical order;
3. name/role/state;
4. zoom/reflow;
5. contrast;
6. error/async state;
7. reduced motion;
8. touch where applicable.

## High-level WCAG matrix

| Area | Main criteria | Design |
|---|---|---|
| Perceivable | alt text, contrast, reflow, audio/text | specified |
| Operable | keyboard, focus, targets, gestures, motion | specified |
| Understandable | labels, errors, consistency | specified |
| Robust | semantics, name/role/value, states | specified |

## Outcome

- Keyboard/focus by pattern: PASS.
- Screen reader and states: PASS.
- Zoom, orientation, safe areas, and virtual keyboard: PASS.
- Reduced motion and optional hand: PASS.
- Child touch targets: PASS.
