# Responsive design

**Status:** Validated  
**Responsible task:** FR-PH01-TASK-006 - COMPLETED

## Principle

The ranges describe when content needs a different composition; they do not detect device marks.
The experience must work from 320 CSS px and with 400% zoom/reflow.

## Indicative ranges

| Range | Name | Navigation | Grid | Dialogs |
|---|---|---|---|---|
| 320-599px | compact | bottom nav Reader / drawer Admin | 1 column | full screen when complex |
| 600-1023px | medium | compact rail or bottom nav | 1-2 columns | centered or sheet |
| >=1024px | wide | persistent sidebar | 2-4 columns/rail | centered |

No component uses the range as a substitute for measuring the container. Cards, bilingual editor and
controls use container queries or equivalent behavior when implemented.

## Reader rules

| Screen/pattern | Compact | Medium | Wide |
|---|---|---|---|
| Home | stacked cards | continue + recommendations | main column + grid |
| Library | filters in sheet | collapsible filters | filter rail |
| Categories | chips/2-column grid | 3-column grid | list + results |
| Search | field/filters sheet | partial inline filters | filters + list/grid |
| Detail | cover on top | cover/data 2 columns | cover + data + description |
| Reader | text/controls at bottom | text + controls | centered text + optional rail |
| Downloads | cards | enriched list | table |
| Favorites/History | list | grid/list | list with metadata |
| Vocabulary | one card per word | 2-column list | table/list + detail |
| Settings | alternating form/preview | two panels if they fit | form + preview |
| Profile | one column | one wide column | centered panel |

## Admin rules

- Tables transform into label-value cards; horizontal scroll is not the only solution.
- Split panes become a list -> detail sequence.
- Bilingual editor stacks full pairs, not all languages in separate blocks.
- Save/status bar remains visible without covering fields.
- Publish actions keep a summary before confirmation.
- Drawer navigation returns focus to the button that opened it.

## Reader, orientation and keyboard

- Vertical: controls below the text.
- Narrow landscape: controls in a side rail if 45ch is maintained; otherwise below.
- Virtual keyboard does not cover the active word/field.
- When changing orientation, time, word, logical scroll and focus are preserved.
- Fullscreen is optional; exiting does not lose progress.

## Safe areas

Apply `env(safe-area-inset-*)` to navigation, bottom controls and fullscreen dialogs. Reading text uses additional padding and is never placed under a notch or system gesture area.

## Reflow and zoom

- At 400% and 1280 CSS px viewport, critical content fits in one dimension without double scroll.
- Justified exceptions: timelines/visual preview may use a named scroll region.
- Text is not truncated to fit; it wraps.
- Persistent actions do not reduce the reading area below a usable unit.
- The reachable area is recalculated after font change, zoom and reflow.

## Images and assets

- `srcset/sizes` or equivalent for covers/illustrations.
- Aspect ratio reserved to avoid layout shifts.
- Audio is loaded on demand.
- Illustrations have editorial alternative text or are marked decorative.

## Scenario validation

| Scenario | Result |
|---|---|
| 320px compact Reader/Admin | PASS in specification |
| 600-1023px medium | PASS in specification |
| >=1024px wide | PASS in specification |
| zoom/reflow 400% | PASS in specification |
| vertical/horizontal | PASS in specification |
| safe areas | PASS in specification |
| virtual keyboard | PASS in specification |
| reduced motion | delegated to ACCESSIBILITY.md, covered |
