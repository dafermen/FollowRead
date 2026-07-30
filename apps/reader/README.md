# FollowRead Reader

Standalone web/PWA/mobile app for discovering and reading synchronized content. It is the only frontend app packaged with Capacitor; FollowRead Admin remains web-only.

## Local demo

From the repository root:

```powershell
pnpm migrate
pnpm demo:seed
pnpm dev
```

Open `http://localhost:5174/`. The story **El zorro y la luna** allows you to:

- explore home, library, categories, search, and detail;
- read in Spanish or English with active word highlighting, progress, chapters, and speed controls;
- listen with a voice installed on the device, no API key required;
- use kid, adult, and learning modes;
- save favorites, local non-sensitive history, and vocabulary;
- manage verified downloads from `/downloads`;
- read the included story without an API and sync progress when reconnecting;
- install the shell as a PWA in supported browsers.

## Commands

- `pnpm --filter @followread/reader dev`
- `pnpm --filter @followread/reader test`
- `pnpm --filter @followread/reader build`
- `pnpm reader:e2e` with API and Reader running
- `pnpm offline:bootstrap` with the API running
- `pnpm reader:offline-e2e` to block/restore network in Chrome
- `pnpm mobile:doctor` to diagnose Android/iOS
- `pnpm mobile:sync` to build and sync both projects
- `pnpm mobile:build:android` to produce an installable debug APK
- `pnpm reader:mobile-e2e` for safe areas, reflow, and rotation
- `pnpm reader:learning-e2e` for translation, vocabulary, favorites, progress, and mobile view

Audible narration depends on voices and permissions available in the browser. If no compatible voice exists, the visual tracking still works and displays a recoverable notice.

See `docs/architecture/MOBILE_READER.md`, `docs/deployment/MOBILE_RELEASES.md`, and the troubleshooting guides `docs/troubleshooting/CAPACITOR_ANDROID.md` / `CAPACITOR_IOS.md`.

The design of learning mode is documented in `docs/architecture/LEARNING_MODE.md`.
