# Arquitectura móvil del Reader

**Estado:** Implementada en Fase 10
**Aplicación:** `apps/reader`
**Identificador:** `com.followread.reader`

## Frontera

Capacitor empaqueta únicamente `apps/reader/dist`. FollowRead Admin no es una dependencia, una ruta
ni un recurso del proyecto nativo. Reader Engine tampoco conoce Capacitor: los plugins viven en el
adaptador de interfaz `mobileRuntime.ts`.

## Plataformas y versiones

| Elemento | Versión/objetivo |
|---|---|
| Capacitor Core/CLI/Android/iOS | 8.4.2 |
| Android mínimo | API 24 |
| Android compile/target | API 36 |
| Java | 21 |
| iOS mínimo | 15.0 |
| Gestión iOS | Swift Package Manager |

`capacitor.config.ts` define nombre, identificador, `webDir`, color de fondo, splash y barra de
estado. `android/` e `ios/` se versionan; los bundles web copiados y resultados de compilación se
regeneran y permanecen ignorados.

## Capacidades nativas

| Necesidad | Solución | Permiso |
|---|---|---|
| Conectividad | `@capacitor/network` y fallback de navegador | `ACCESS_NETWORK_STATE` fusionado por el plugin |
| Primer/segundo plano | `@capacitor/app` | ninguno |
| Splash | `@capacitor/splash-screen` | ninguno |
| Barra de estado | `@capacitor/status-bar` | ninguno |
| Contenido offline | IndexedDB del WebView | ninguno |
| Preferencias/progreso | `localStorage` del WebView | ninguno |

Android declara `INTERNET`; no solicita cámara, micrófono, ubicación ni acceso general a archivos.
iOS tampoco declara descripciones de permisos sensibles.

## Ciclo de vida y red

`mobileRuntime.ts` publica un estado común de conectividad. Al recuperar red o regresar al primer
plano, Reader intenta enviar la cola idempotente de progreso. Al ir a segundo plano, la lectura y la
voz del dispositivo se pausan; al volver, el layout se recalcula.

## Almacenamiento

La base offline continúa en IndexedDB porque conserva el mismo origen nativo entre lanzamientos,
funciona sin permisos de archivos y ya aplica checksums y activación atómica. Preferencias,
favoritos, historial y progreso no sensible permanecen en `localStorage`. Si en el futuro se guardan
secretos o datos personales, deben migrar a almacenamiento cifrado nativo mediante otra decisión.

## Audio en segundo plano

No se habilita audio en segundo plano. La narración actual usa Web Speech, depende de una voz local y
se pausa deliberadamente cuando la app deja de estar activa. Declarar `UIBackgroundModes` o un
servicio Android sugeriría reproducción continua que el MVP no puede garantizar. Cuando exista
audio nativo continuo se revisarán controles de pantalla bloqueada, foco de audio, interrupciones,
privacidad, batería y permisos.

## Red y entornos

El bundle recibe `VITE_API_BASE_URL` durante el build. En dispositivo debe ser una URL HTTPS
alcanzable; `localhost` sólo apunta al propio dispositivo. Para un emulador Android local puede
usarse `http://10.0.2.2:8000` durante desarrollo. La API admite los orígenes nativos
`capacitor://localhost` (iOS) y `https://localhost` (Android).

## Safe areas y orientación

El viewport usa `viewport-fit=cover`. Shell, cabecera de lectura, contenido y controles aplican
`env(safe-area-inset-*)`. Android e iOS aceptan vertical y horizontal. Reader Engine conserva tiempo,
palabra y capítulo; un cambio de orientación sólo incrementa la revisión de layout.

## Recursos

Fuentes en `apps/reader/assets`:

- iconos de 1024 × 1024;
- splash claro y oscuro de 2732 × 2732.

`pnpm mobile:assets` regenera únicamente Android e iOS para no modificar el manifest PWA existente.
