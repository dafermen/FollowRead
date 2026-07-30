# Phase 10 Mobile Evidence

**Date:** 2026-07-26
**Result:** PASS with iOS validation pending macOS hardware before release

## Automation

| Verification | Result |
|---|---|
| `pnpm mobile:validate` | PASS |
| 8 files / 33 Reader tests | PASS |
| Web build and `cap sync android/ios` | PASS |
| `pnpm mobile:build:android` | PASS, debug APK generated |
| Chrome 390 × 844 with safe areas 47/34 | PASS |
| Chrome 844 × 390 with lateral/bottom safe areas | PASS |
| Progress after rotation | PASS |
| Android API 35, install and launch on AVD | PASS |
| Android preserves `MainActivity` on rotate | PASS |
| iOS structure, SPM, orientations and permissions | PASS static |
| iOS build/run | Required on macOS/Xcode 26 before App Store |

Runtime screenshots are saved locally under `var/e2e/` and are not versioned:

- `phase10-reader-portrait.png`;
- `phase10-reader-landscape.png`;
- `phase10-android-portrait.png`;
- `phase10-android-landscape.png`.

## Scenarios covered

1. Compact shell without horizontal overflow.
2. Bottom navigation above the home indicator.
3. Header below notch/status bar.
4. Horizontal reader with visible controls.
5. Time and active word preserved on rotate.
6. APK installs and opens `com.followread.reader/.MainActivity`.
7. The included story loads without relying on the API.
8. Android only requests network; iOS does not request sensitive permissions.

## Pre-release manual matrix

| Platform | Minimum | Current | Large/tablet |
|---|---|---|---|
| Android | API 24, updated WebView | API 35/36 | tablet portrait/landscape |
| iOS | iPhone, iOS 15 | current iOS | iPad portrait/landscape |

On each device: first launch, light/dark splash, library, offline reading, voice available and unavailable, background/foreground, network loss/return, rotation, system text size, notch/dynamic island, gesture navigation and process restart.
