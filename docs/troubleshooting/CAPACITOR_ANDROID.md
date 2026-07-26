# Capacitor Android: solución de problemas

## Diagnóstico inicial

```powershell
pnpm mobile:doctor android
pnpm mobile:validate
```

El helper detecta Java 21 incluido en Android Studio, el SDK bajo `%LOCALAPPDATA%\Android\Sdk` y
ADB aunque no estén en `PATH`.

## Java o SDK no encontrados

- instalar Android Studio 2025.2.1 o posterior;
- abrir SDK Manager e instalar API 36, Platform Tools y Build Tools;
- comprobar `C:\Program Files\Android\Android Studio\jbr`;
- si la instalación usa otra ruta, definir `JAVA_HOME` y `ANDROID_SDK_ROOT`.

## Cambios web no aparecen

```powershell
pnpm mobile:sync:android
```

Capacitor copia sólo el `dist` recién construido. No editar
`android/app/src/main/assets/public`: está ignorado y se reemplaza.

## El emulador no llega a la API

`localhost` dentro del emulador es el propio Android. Para desarrollo usa
`VITE_API_BASE_URL=http://10.0.2.2:8000`, vuelve a sincronizar y limita esta excepción a builds
locales. Producción debe usar HTTPS.

## Hay varios dispositivos ADB

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

Selecciona el serial del emulador/dispositivo en Android Studio o con `adb -s SERIAL`.

## Capacitor pide datos de firma

`cap build android` produce un artefacto de publicación y necesita keystore, alias y contraseñas.
Para un APK local sin secretos usa `pnpm mobile:build:android`. Para Play Store firma en un entorno
seguro; nunca agregues keystores o contraseñas a Git.

## Splash o icono antiguo

```powershell
pnpm mobile:assets
pnpm mobile:sync:android
```

Desinstala la app del emulador si el launcher conserva un icono cacheado.
