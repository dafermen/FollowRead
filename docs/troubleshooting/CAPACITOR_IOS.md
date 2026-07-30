# Capacitor iOS: troubleshooting

## Platform requirement

The project can be generated and synced on Windows, but Apple requires macOS with Xcode 26+ to
build, sign, run simulators, and publish. Verify the environment on the Mac:

```bash
pnpm mobile:doctor ios
xcode-select -p
```

## Swift dependencies not resolving

```bash
pnpm install --frozen-lockfile
pnpm mobile:sync:ios
pnpm mobile:open:ios
```

Capacitor 8 uses Swift Package Manager by default. In Xcode, wait for resolution to finish and
check `ios/App/CapApp-SPM/Package.swift`.

## Signing or bundle identifier

- keep `com.followread.reader`;
- select the correct Team in Signing & Capabilities;
- use development/TestFlight profiles managed by Apple;
- do not add certificates, profiles, or passwords to the repository.

## Blank screen or API inaccessible

- confirm that `pnpm mobile:sync:ios` copied a recent build;
- use an HTTPS `VITE_API_BASE_URL` reachable from the device;
- support `capacitor://localhost` in CORS;
- check the Safari/Xcode console and do not disable App Transport Security in production.

## Notch, orientation, or controls covered

The viewport must keep `viewport-fit=cover`. Test vertical and horizontal on iPhone/iPad with
gesture navigation and large text. If a new screen uses fixed positioning, it must add
`env(safe-area-inset-*)`.

## Voice pauses when locking or switching apps

This is the expected behavior of the MVP. Web Speech does not provide native continuous audio; FollowRead pauses
and preserves progress. Do not add `UIBackgroundModes` until you implement a native audio source and
interruption controls.
