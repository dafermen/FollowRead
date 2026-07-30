# Mobile architecture of the Reader

**Status:** Implemented in Phase 10
**App:** `apps/reader`
**Identifier:** `com.followread.reader`

## Boundary

Capacitor packages only `apps/reader/dist`. FollowRead Admin is not a dependency, a route, or a resource of the native project. Reader Engine also does not know about Capacitor: plugins live in the interface adapter `mobileRuntime.ts`.

## Platforms and versions

| Item | Version/target |
|---|---|
| Capacitor Core/CLI/Android/iOS | 8.4.2 |
| Minimum Android | API 24 |
| Android compile/target | API 36 |
| Java | 21 |
| Minimum iOS | 15.0 |
| iOS management | Swift Package Manager |

`capacitor.config.ts` defines name, identifier, `webDir`, background color, splash and status bar. `android/` and `ios/` are versioned; the copied web bundles and build outputs are regenerated and remain ignored.

## Native capabilities

| Need | Solution | Permission |
|---|---|---|
| Connectivity | `@capacitor/network` and browser fallback | `ACCESS_NETWORK_STATE` merged by the plugin |
| Foreground/background | `@capacitor/app` | none |
| Splash | `@capacitor/splash-screen` | none |
| Status bar | `@capacitor/status-bar` | none |
| Offline content | WebView IndexedDB | none |
| Preferences/progress | WebView `localStorage` | none |

Android declares `INTERNET`; it does not request camera, microphone, location, or general file access. iOS also does not declare descriptions for sensitive permissions.

## Lifecycle and network

`mobileRuntime.ts` publishes a shared connectivity state. When network is restored or the app returns to the foreground, Reader attempts to send the idempotent progress queue. When going to the background, reading and device voice are paused; on return, the layout is recalculated.

## Storage

The offline database remains in IndexedDB because it preserves the same native origin across releases, works without file permissions, and already applies checksums and atomic activation. Preferences, favorites, history, and non-sensitive progress remain in `localStorage`. If secrets or personal data are stored in the future, they must migrate to native encrypted storage by a separate decision.

## Background audio

Background audio is not enabled. The current narration uses Web Speech, depends on a local voice, and is deliberately paused when the app stops being active. Declaring `UIBackgroundModes` or an Android service would imply continuous playback that the MVP cannot guarantee. When continuous native audio exists, lock-screen controls, audio focus, interruptions, privacy, battery, and permissions will be reviewed.

## Network and environments

The bundle receives `VITE_API_BASE_URL` during the build. On device it must be an accessible HTTPS URL; `localhost` only points to the device itself. For a local Android emulator you can use `http://10.0.2.2:8000` during development. The API supports the native origins `capacitor://localhost` (iOS) and `https://localhost` (Android).

## Safe areas and orientation

The viewport uses `viewport-fit=cover`. Shell, reading header, content, and controls apply `env(safe-area-inset-*)`. Android and iOS accept portrait and landscape. Reader Engine preserves time, word, and chapter; an orientation change only increments the layout revision.

## Assets

Fonts in `apps/reader/assets`:

- 1024 × 1024 icons;
- light and dark splash of 2732 × 2732.

`pnpm mobile:assets` regenerates only Android and iOS so as not to modify the existing PWA manifest.
