# Compilación y publicación móvil

## Preparación común

```powershell
pnpm install --frozen-lockfile
pnpm mobile:doctor
pnpm check
pnpm mobile:assets
pnpm mobile:sync
```

Configura `VITE_API_BASE_URL` con el endpoint HTTPS del entorno antes de sincronizar. El bundle nunca
contiene credenciales AWS, contraseñas de tienda ni llaves de firma.

## Android de desarrollo

```powershell
pnpm mobile:build:android
```

El comando detecta Java incluido con Android Studio, sincroniza el Reader y produce:

`apps/reader/android/app/build/outputs/apk/debug/app-debug.apk`

También se puede abrir `apps/reader/android` con:

```powershell
pnpm mobile:open:android
```

## Android para Google Play

1. Incrementar `versionCode` y `versionName`.
2. Ejecutar `pnpm check` y la matriz de dispositivos.
3. Crear/usar un keystore fuera del repositorio y respaldarlo de forma segura.
4. Generar un Android App Bundle firmado desde Android Studio o `cap build android` pasando todas
   las opciones de firma por el entorno seguro.
5. Verificar el AAB con Play App Signing y subir primero a prueba interna.
6. Completar ficha, clasificación, privacidad, contenido infantil y Data safety.
7. Promover gradualmente después de smoke tests.

No se versionan `.jks`, `.keystore`, APK, AAB ni contraseñas.

## iOS

iOS 15+ requiere macOS, Xcode 26+ y sus Command Line Tools:

```bash
pnpm install --frozen-lockfile
pnpm mobile:sync:ios
pnpm mobile:open:ios
```

El proyecto usa Swift Package Manager. En Xcode:

1. seleccionar el Team y conservar `com.followread.reader`;
2. incrementar `MARKETING_VERSION` y `CURRENT_PROJECT_VERSION`;
3. ejecutar en simulador y dispositivo físico;
4. verificar orientación, safe areas, voz, offline y ciclo de vida;
5. `Product > Archive`, validar y distribuir primero a TestFlight;
6. completar privacidad, edades, contenido infantil y metadatos de App Store Connect.

## Contenido y nuevas versiones

Un cuento publicado se descarga como paquete versionado con checksum; no exige reconstruir la app.
Sí exige nuevo binario cualquier cambio de plugins, permisos, Capacitor, comportamiento de
almacenamiento, política de red, iconos, splash o código Reader.

## Rollback

- contenido: despublicar/republicar el paquete sin reemplazar binario;
- aplicación: detener promoción y volver a la versión estable de la tienda;
- nunca reutilizar un `versionCode`/`CURRENT_PROJECT_VERSION`;
- conservar compatibilidad con paquetes anteriores y ejecutar smoke tests offline/sync;
- registrar causa, artefacto, alcance y resultado.
