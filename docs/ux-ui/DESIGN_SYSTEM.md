# FollowRead Visual System

**Status:** Validated  
**Responsible task:** FR-PH01-TASK-005 - COMPLETED

## Principles

1. Content dominates; the visual system guides.
2. One system serves both Reader and Admin.
3. Modes change density, emphasis, and defaults, not semantics.
4. Color, icon, and motion are never the only signal.
5. Tokens describe intent, not concrete color names.

## Typography

First implementation: system stack to avoid download, licensing, and font latency.

```css
font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
```

| Token | Size/line-height | Use |
|---|---|---|
| `text-xs` | 12/16 | non-critical metadata |
| `text-sm` | 14/20 | secondary/Admin dense |
| `text-md` | 16/24 | base UI |
| `text-lg` | 18/28 | adult Reader text |
| `text-xl` | 22/32 | child/learning Reader text |
| `heading-sm` | 20/28, 700 | section |
| `heading-md` | 28/36, 700 | screen |
| `heading-lg` | 36/44, 750 | cover/entry |

- Reading text allows user scaling without changing control tokens.
- Recommended line length for reading: 45–75 characters.
- Do not justify paragraphs; preserve word spacing.
- Italic or uppercase should not be the only differentiator.

## Spacing and geometry

4px base: `space-1=4`, `2=8`, `3=12`, `4=16`, `5=20`, `6=24`, `8=32`, `10=40`,
`12=48`, `16=64`.

| Token | Value | Use |
|---|---:|---|
| `radius-sm` | 6px | fields/chips |
| `radius-md` | 10px | buttons/cards |
| `radius-lg` | 16px | child panels/modals |
| `border` | 1px | standard separator |
| `focus-ring` | 3px + 2px offset | visible focus |
| `touch-min` | 24x24px | WCAG minimum |
| `touch-child` | 44x44px | child mode |
| `content-max` | 1200px | overview layouts |
| `reading-max` | 72ch | Reader text |

## Light color

| Role | Value | Use/expected contrast |
|---|---|---|
| `canvas` | `#F7F9FC` | background |
| `surface` | `#FFFFFF` | panel |
| `text` | `#172033` | text on light |
| `text-muted` | `#475467` | secondary on light |
| `primary` | `#2457D6` | action/link on white |
| `primary-strong` | `#173E9F` | hover/pressed |
| `focus` | `#7C3AED` | ring + offset |
| `success` | `#166534` | state with text/icon |
| `warning` | `#92400E` | warning with text/icon |
| `danger` | `#B42318` | error/destructive |
| `learning` | `#0F766E` | learning mode accent |
| `highlight` | `#FDE68A` | word background; text uses `text` |

## Dark color

| Role | Value |
|---|---|
| `canvas` | `#101828` |
| `surface` | `#1D2939` |
| `text` | `#F9FAFB` |
| `text-muted` | `#D0D5DD` |
| `primary` | `#9CB5FF` |
| `focus` | `#C4B5FD` |
| `success` | `#86EFAC` |
| `warning` | `#FCD34D` |
| `danger` | `#FDA29B` |
| `learning` | `#5EEAD4` |
| `highlight` | `#6B4F00` |

Contrast is programmatically validated for text pairs; state colors always include
text/icon.

## Motion

| Token | Duration | Use |
|---|---:|---|
| `motion-fast` | 120ms | local feedback |
| `motion-base` | 180ms | panel/state |
| `motion-reader` | 220ms max | hand/scroll when allowed |

- Standard curve: `cubic-bezier(.2, 0, 0, 1)`.
- Reduced motion: duration 0–1ms, no decorative scrolling/zoom.
- Hand motion uses transformed position and does not change layout.
- Feedback does not depend on animation.

## Iconography

- 24px grid and consistent strokes.
- Critical icons include a visible label or accessible name.
- Do not choose a library until Phase 2; size, license, and coverage will be evaluated.
- Reproduction uses conventional symbols accompanied by text/tooltip when ambiguous.
- States combine shape, icon, and text.

## Base components

| Component | Variants | Required states |
|---|---|---|
| Button | primary, secondary, quiet, danger | default, hover, focus, pressed, disabled, loading |
| IconButton | standard, media, child | same + tooltip/name |
| TextField/TextArea | normal, search | empty, filled, focus, invalid, disabled |
| Select/Combobox | single, filter | open, selected, invalid, disabled |
| Checkbox/Radio/Switch | standard, child | unchecked, checked, mixed, focus, disabled |
| Link | inline, standalone | default, visited when applicable, focus |
| Tabs | horizontal, compact selector | selected, focus, overflow |
| Card/ContentCard | static, actionable | default, hover, focus, unavailable |
| StatusBadge | draft, processing, review, published, error | icon + text |
| Progress | determinate, indeterminate, stepper | label and value |
| Alert/StatePanel | info, success, warning, error, empty | optional action |
| Toast | reversible/noncritical | pause on hover/focus |
| Dialog | confirm, destructive, conflict | focus trapped/restored |
| Navigation | bottom, rail, sidebar, drawer | current, focus, restricted |

## Domain components

| Component | Responsibility | Must not do |
|---|---|---|
| `WordToken` | display/interact with word | resolve audio timing |
| `ReadingPointer` | represent hand/position | move focus or cover text |
| `MediaControls` | emit playback intentions | contain Reader Engine logic |
| `ReadingProgress` | show sync position/state | invent confirmed progress |
| `ContentCard` | summarize local content/state | download directly |
| `DownloadItem` | show progress/error/actions | trigger package without validation |
| `SaveStatus` | saving/saved/pending/error | hide conflict |
| `BilingualPairEditor` | relate EN/ES units | translate automatically |
| `WorkflowStepper` | show state/transitions | authorize transition |
| `JobStatus` | stage/cost/error/retry | expose secret/raw provider |

## Modes

| Aspect | Child | Adult | Learn English |
|---|---|---|---|
| Reading text | `text-xl` minimum | `text-lg`, configurable | `text-xl` |
| Touch target | 44px | 24px minimum/40 preferred | 40px preferred |
| Hand | visible by default | hidden by default | optional |
| Density | low | medium | contextual medium |
| Navigation | reduced/safe exit | full | full |
| Accent | warm primary decorative only | sober primary | `learning` |
| Controls | essentials visible | configurable | repeat/translate visible |

## Voice and tone

- Clear, concrete, and non-blaming.
- Error: what happened, what was preserved, next action.
- Child: short sentences without treating the child as incapable.
- Admin: precision, IDs only when helpful to diagnose.
- Do not use “success” if an operation is still pending synchronization.

## Validation

- Typography, spacing, color, iconography, and motion defined: PASS.
- Base and domain components with states/prohibitions: PASS.
- Child, adult, and learning share semantics: PASS.
- Contrast of 18 critical pairs: PASS.

### Contrast evidence

- Light: minimum `learning`/white = 5.47:1.
- Light: text/highlight = 13.06:1.
- Dark: minimum text/highlight = 7.32:1.
- All evaluated text pairs exceed 4.5:1.
