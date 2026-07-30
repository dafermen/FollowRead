# Mobile build and release

## Common preparation

```powershell
pnpm install --frozen-lockfile
pnpm mobile:doctor
pnpm check
pnpm mobile:assets
pnpm mobile:sync
```

Configure `VITE_API_BASE_URL` with the environment's HTTPS endpoint before syncing. The bundle never
contains AWS credentials, storefront passwords, or signing keys.

## Development Android

```powershell
pnpm mobile:build:android
```

The command detects the Java included with Android Studio, syncs the Reader and produces:

`apps/reader/android/app/build/outputs/apk/debug/app-debug.apk`

You can also open `apps/reader/android` with:

```powershell
pnpm mobile:open:android
```

## Android for Google Play

1. Increase `versionCode` and `versionName`.
2. Run `pnpm check` and the device matrix.
3. Create/use a keystore outside the repository and back it up securely.
4. Generate a signed Android App Bundle from Android Studio or `cap build android`, passing all
   signing options via the secure environment.
5. Verify the AAB with Play App Signing and upload first to internal testing.
6. Complete the store listing, rating, privacy, children’s content, and Data safety.
7. Gradually promote after smoke tests.

Do not version `.jks`, `.keystore`, APK, AAB, or passwords.

## iOS

iOS 15+ requires macOS, Xcode 26+ and its Command Line Tools:

```bash
pnpm install --frozen-lockfile
pnpm mobile:sync:ios
pnpm mobile:open:ios
```

The project uses Swift Package Manager. In Xcode:

1. select the Team and keep `com.followread.reader`;
2. bump `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION`;
3. run on simulator and physical device;
4. verify orientation, safe areas, voice, offline behavior and lifecycle;
5. `Product > Archive`, validate and distribute first to TestFlight;
6. complete privacy, age ratings, children’s content and App Store Connect metadata.

## Content and new releases

A published story is downloaded as a versioned package with checksum; it does not require rebuilding the app.
A new binary is required for any changes to plugins, permissions, Capacitor, storage behavior,
network policy, icons, splash, or Reader code.

## Rollback

- content: unpublish/republish the package without replacing the binary;
- app: stop promotion and revert to the store's stable version;
- never reuse a `versionCode`/`CURRENT_PROJECT_VERSION`;
- maintain compatibility with previous packages and run offline/sync smoke tests;
- log cause, artifact, scope and outcome.
