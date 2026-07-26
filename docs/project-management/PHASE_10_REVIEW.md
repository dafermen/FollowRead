# Revisión de Fase 10 - Capacitor, Android e iOS

**Fecha:** 2026-07-26
**Estado:** COMPLETED

## Resultado

FollowRead Reader es ahora la única aplicación empaquetada con Capacitor 8. Android e iOS comparten
el mismo build web/PWA y conservan catálogo, cuento incluido, lectura, voz local, progreso y
descargas offline. Admin permanece fuera de todos los proyectos nativos.

## Criterios verificados

1. `com.followread.reader`, `webDir: dist` y proyectos nativos versionados.
2. Android API 24/36 y iOS 15 con Swift Package Manager.
3. Icono adaptativo y splash claro/oscuro generados desde fuentes validadas.
4. Network/App/Splash/StatusBar son los únicos plugins.
5. IndexedDB y `localStorage` no requieren acceso a archivos.
6. Android sólo declara Internet; Network aporta estado. iOS no pide permisos sensibles.
7. Web Speech se pausa al ir a fondo; no se declara reproducción continua.
8. Safe areas y rotación se verificaron en vertical/horizontal conservando progreso.
9. APK debug generado, instalado y abierto en un AVD API 35.
10. iOS sincroniza y supera auditoría estática; build/TestFlight requiere macOS/Xcode 26.
11. Build, firma, tiendas, rollback y troubleshooting están documentados.
12. La puerta completa incluye validación móvil.

## Evidencia

- 33 pruebas Reader;
- `pnpm mobile:validate`: PASS;
- `pnpm reader:mobile-e2e`: PASS vertical y horizontal;
- `pnpm mobile:build:android`: BUILD SUCCESSFUL;
- instalación/arranque ADB de `com.followread.reader/.MainActivity`: PASS;
- `cap sync android` y `cap sync ios`: PASS;
- capturas Chrome/Android bajo `var/e2e`;
- `pnpm check`: PASS.

## Restricción externa

Windows no puede ejecutar Xcode ni un simulador iOS. El proyecto iOS, recursos, SPM, bundle ID,
orientaciones y permisos se validaron; la matriz física iPhone/iPad queda como condición previa a
publicar en TestFlight/App Store. No requiere cambios de producto para continuar la Fase 11.
