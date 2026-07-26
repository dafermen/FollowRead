# Evidencia móvil de Fase 10

**Fecha:** 2026-07-26
**Resultado:** PASS con validación iOS pendiente de hardware macOS antes de publicar

## Automatización

| Verificación | Resultado |
|---|---|
| `pnpm mobile:validate` | PASS |
| 8 archivos / 33 pruebas Reader | PASS |
| Build web y `cap sync android/ios` | PASS |
| `pnpm mobile:build:android` | PASS, APK debug generado |
| Chrome 390 × 844 con safe areas 47/34 | PASS |
| Chrome 844 × 390 con safe areas laterales/inferior | PASS |
| Progreso después de rotación | PASS |
| Android API 35, instalación y arranque en AVD | PASS |
| Android mantiene `MainActivity` al rotar | PASS |
| Estructura, SPM, orientaciones y permisos iOS | PASS estático |
| Build/ejecución iOS | Requerido en macOS/Xcode 26 antes de App Store |

Las capturas de ejecución se guardan localmente bajo `var/e2e/` y no se versionan:

- `phase10-reader-portrait.png`;
- `phase10-reader-landscape.png`;
- `phase10-android-portrait.png`;
- `phase10-android-landscape.png`.

## Escenarios cubiertos

1. Shell compacto sin overflow horizontal.
2. Navegación inferior por encima del indicador de inicio.
3. Cabecera por debajo de notch/status bar.
4. Lector horizontal con controles visibles.
5. Tiempo y palabra activa conservados al rotar.
6. APK instala y abre `com.followread.reader/.MainActivity`.
7. El cuento incluido carga sin depender de la API.
8. Android solicita únicamente red; iOS no solicita permisos sensibles.

## Matriz manual previa a publicación

| Plataforma | Mínimo | Actual | Grande/tablet |
|---|---|---|---|
| Android | API 24, WebView actualizado | API 35/36 | tablet vertical/horizontal |
| iOS | iPhone, iOS 15 | iOS vigente | iPad vertical/horizontal |

En cada dispositivo: primer inicio, splash claro/oscuro, biblioteca, lectura offline, voz disponible y
no disponible, fondo/primer plano, pérdida/retorno de red, rotación, tamaño de texto del sistema,
notch/isla dinámica, navegación gestual y reinicio del proceso.
