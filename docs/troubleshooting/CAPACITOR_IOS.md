# Capacitor iOS: solución de problemas

## Requisito de plataforma

El proyecto puede generarse y sincronizarse en Windows, pero Apple exige macOS con Xcode 26+ para
compilar, firmar, ejecutar simuladores y publicar. Verifica el entorno en el Mac:

```bash
pnpm mobile:doctor ios
xcode-select -p
```

## Dependencias Swift no resuelven

```bash
pnpm install --frozen-lockfile
pnpm mobile:sync:ios
pnpm mobile:open:ios
```

Capacitor 8 usa Swift Package Manager por defecto. En Xcode, espera a que termine la resolución y
revisa `ios/App/CapApp-SPM/Package.swift`.

## Firma o bundle identifier

- conserva `com.followread.reader`;
- selecciona el Team correcto en Signing & Capabilities;
- usa perfiles de desarrollo/TestFlight administrados por Apple;
- no agregues certificados, perfiles ni contraseñas al repositorio.

## Pantalla en blanco o API inaccesible

- confirma que `pnpm mobile:sync:ios` copió un build reciente;
- usa un `VITE_API_BASE_URL` HTTPS alcanzable desde el dispositivo;
- admite `capacitor://localhost` en CORS;
- revisa la consola de Safari/Xcode y no deshabilites App Transport Security en producción.

## Notch, orientación o controles tapados

El viewport debe conservar `viewport-fit=cover`. Revisa vertical y horizontal en iPhone/iPad con
navegación gestual y texto grande. Si una pantalla nueva usa posición fija, debe sumar
`env(safe-area-inset-*)`.

## Voz se pausa al bloquear o cambiar de app

Es el comportamiento esperado del MVP. Web Speech no ofrece audio continuo nativo; FollowRead pausa
y conserva progreso. No agregues `UIBackgroundModes` hasta implementar una fuente de audio nativa y
controles de interrupción.
