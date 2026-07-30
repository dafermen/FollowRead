# Phase 10 Review - Capacitor, Android and iOS

**Date:** 2026-07-26
**Status:** COMPLETED

## Outcome

FollowRead Reader is now the only application packaged with Capacitor 8. Android and iOS share
the same web/PWA build and retain catalog, included story, reading, local voice, progress and
offline downloads. Admin remains outside all native projects.

## Verified criteria

1. `com.followread.reader`, `webDir: dist` and native projects versioned.
2. Android API 24/36 and iOS 15 with Swift Package Manager.
3. Adaptive icon and light/dark splash generated from validated sources.
4. Network/App/Splash/StatusBar are the only plugins.
5. IndexedDB and `localStorage` do not require file access.
6. Android only declares Internet; Network provides status. iOS does not request sensitive permissions.
7. Web Speech pauses when backgrounded; continuous playback is not declared.
8. Safe areas and rotation were verified in portrait/landscape preserving progress.
9. Debug APK generated, installed and opened on an AVD API 35.
10. iOS synchronizes and passes static audit; build/TestFlight requires macOS/Xcode 26.
11. Build, signing, stores, rollback and troubleshooting are documented.
12. The full gate includes mobile validation.

## Evidence

- 33 Reader tests;
- `pnpm mobile:validate`: PASS;
- `pnpm reader:mobile-e2e`: PASS vertical and horizontal;
- `pnpm mobile:build:android`: BUILD SUCCESSFUL;
- ADB install/start of `com.followread.reader/.MainActivity`: PASS;
- `cap sync android` and `cap sync ios`: PASS;
- Chrome/Android screenshots under `var/e2e`;
- `pnpm check`: PASS.

## External constraint

Windows cannot run Xcode or an iOS simulator. The iOS project, resources, SPM, bundle ID,
orientations and permissions were validated; the physical iPhone/iPad matrix remains a prerequisite to
publishing on TestFlight/App Store. No product changes are required to continue Phase 11.
