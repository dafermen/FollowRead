# Capacitor Android: troubleshooting

## Initial diagnosis

```powershell
pnpm mobile:doctor android
pnpm mobile:validate
```

The helper detects Java 21 included in Android Studio, the SDK under `%LOCALAPPDATA%\Android\Sdk`, and
ADB even if they are not in `PATH`.

## Java or SDK not found

- install Android Studio 2025.2.1 or later;
- open the SDK Manager and install API 36, Platform Tools, and Build Tools;
- check `C:\Program Files\Android\Android Studio\jbr`;
- if the installation uses a different path, set `JAVA_HOME` and `ANDROID_SDK_ROOT`.

## Web changes not appearing

```powershell
pnpm mobile:sync:android
```

Capacitor only copies the freshly built `dist`. Do not edit
`android/app/src/main/assets/public`: it is ignored and will be replaced.

## Emulator does not reach the API

`localhost` inside the emulator is the Android device itself. For development use
`VITE_API_BASE_URL=http://10.0.2.2:8000`, resync and limit this exception to local builds. Production should use HTTPS.

## Multiple ADB devices present

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

Select the emulator/device serial in Android Studio or with `adb -s SERIAL`.

## Capacitor asks for signing information

`cap build android` produces a publishable artifact and requires a keystore, alias, and passwords.
For a local unsigned APK without secrets use `pnpm mobile:build:android`. For Play Store, sign in a secure environment; never add keystores or passwords to Git.

## Old splash or icon

```powershell
pnpm mobile:assets
pnpm mobile:sync:android
```

Uninstall the app from the emulator if the launcher retains a cached icon.
