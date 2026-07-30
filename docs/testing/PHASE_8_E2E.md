# E2E Verification of Reader - Phase 8

## Preparation

```powershell
pnpm demo:seed
pnpm dev
```

In another terminal:

```powershell
pnpm reader:e2e
```

The walkthrough uses Chrome or Edge in headless mode against the real services. It verifies sign-in,
library, detail, reader, settings, and PWA manifest. Interactions for favorites, history,
configuration, learning, narration, and recoverable crashes are covered with Vitest.

## Visual review

Inspect at minimum:

- 1440 × 1000: sidebar, hierarchy, and cards;
- 390 × 844: bottom navigation, safe areas, and controls;
- 320 CSS px or 400% zoom: reflow without horizontal scrolling of content;
- keyboard: skip link, visible focus, filters, reader, and learning panel;
- reduced motion and light/dark themes.

## Scope

The PWA test checks for an installable shell. It does not require downloaded content because that capability
is implemented in Phase 9.
