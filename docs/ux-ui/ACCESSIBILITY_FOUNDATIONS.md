# Accessibility Foundations

**Status:** Validated baseline for Phase 0  
**Responsible task:** FR-PH00-TASK-010 - COMPLETED

## Scope

Applies to Admin and Reader web/PWA. The same principles will be preserved in Capacitor. Goal:
WCAG 2.2 AA for MVP flows, complemented with manual testing.

## Keyboard and focus

- All critical actions operable without a pointer.
- Focus order matches reading order.
- Visible focus, not covered, and restored after dialogs.
- Read auto-scroll does not move focus.
- Shortcuts do not interfere with text entry or assistive technology.

## Semantics and screen reader

- Native controls when possible.
- Name, role, value/state and error associated.
- Consistent headings and regions.
- Download, save and playback changes announced without excess.
- Active visual word is not announced on every change if it interrupts narration; a
  configurable strategy will be offered and validated with users.

## Visual

- AA contrast for text, controls and focus.
- Color is never the only cue.
- Zoom and reflow up to 400% without losing critical functionality.
- Text configurable without breaking hand position.
- Sync states include text/icon and semantics.

## Motion and audio

- `prefers-reduced-motion` disables non-essential scrolling.
- The hand can be hidden independently.
- Auto-scroll avoids animation when reduced motion is enabled.
- Audio has full text equivalent.
- No feature depends solely on sound.

## Touch and child mode

- Minimum 24x24 CSS px; target 44x44 in child mode.
- Sufficient separation to avoid accidental activation.
- Dangerous actions or exiting the mode require appropriate confirmation.
- No accidental access to Admin.

## Admin forms

- Persistent label, instruction and associated error.
- Error summary with focus.
- Save, pending, conflict and recovery distinguishable.
- Bilingual editor preserves semantic relationship between units.

## Validation matrix

| Area | Automated | Manual | Users |
|---|---|---|---|
| Semantics/names | Yes | Yes | When applicable |
| Keyboard/focus | Partial | Yes | Yes |
| Contrast | Partial | Yes |  |
| Zoom/reflow | No | Yes | Yes |
| Motion/hand | Partial | Yes | Yes |
| Child understanding | No | Yes | Yes, with appropriate protocol |
| Screen reader | Partial | Yes | Yes |

## Criteria for Phase 1

Each wireframe must document the primary action, focus order, states, accessible text, touch
target and behavior with reduced motion. A design that cannot explain this does not advance to UI.
