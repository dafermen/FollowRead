# FollowRead Reader

Aplicación web/PWA/móvil independiente para descubrir y leer contenido sincronizado. Es la única
aplicación frontend empaquetada con Capacitor; FollowRead Admin permanece sólo web.

## Demostración local

Desde la raíz:

```powershell
pnpm migrate
pnpm demo:seed
pnpm dev
```

Abre `http://localhost:5174/`. El cuento **El zorro y la luna** permite:

- explorar inicio, biblioteca, categorías, búsqueda y detalle;
- leer en español o inglés con palabra activa, progreso, capítulos y velocidad;
- escuchar una voz instalada en el dispositivo, sin API key;
- usar modos infantil, adulto y aprendizaje;
- guardar favoritos, historial y vocabulario local no sensible;
- gestionar descargas verificadas desde `/downloads`;
- leer el cuento incluido sin API y sincronizar el progreso al reconectar;
- instalar el shell como PWA en navegadores compatibles.

## Comandos

- `pnpm --filter @followread/reader dev`
- `pnpm --filter @followread/reader test`
- `pnpm --filter @followread/reader build`
- `pnpm reader:e2e` con API y Reader activos
- `pnpm offline:bootstrap` con la API activa
- `pnpm reader:offline-e2e` para bloquear/restaurar red en Chrome
- `pnpm mobile:doctor` para diagnosticar Android/iOS
- `pnpm mobile:sync` para construir y sincronizar ambos proyectos
- `pnpm mobile:build:android` para generar un APK debug instalable
- `pnpm reader:mobile-e2e` para safe areas, reflow y rotación

La narración audible depende de las voces y permisos disponibles en el navegador. Si no existe una
voz compatible, el seguimiento visual sigue funcionando y muestra un aviso recuperable.

Consulta `docs/architecture/MOBILE_READER.md`, `docs/deployment/MOBILE_RELEASES.md` y las guías
`docs/troubleshooting/CAPACITOR_ANDROID.md` / `CAPACITOR_IOS.md`.
