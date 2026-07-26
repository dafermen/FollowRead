# Arquitectura de FollowRead Reader Web

## Alcance

La Fase 8 convierte el paquete publicado de la API y el Reader Engine de Fase 7 en una aplicación
web accesible, responsive e instalable. Reader sigue siendo independiente de Admin.

## Capas

1. `readerClient.ts` consume el catálogo público y los paquetes versionados.
2. `ReaderApp.tsx` presenta inicio, biblioteca, detalle y áreas personales.
3. `StoryReaderPage.tsx` conecta React con el Reader Engine y la narración del navegador.
4. `readerStorage.ts` valida preferencias locales no sensibles.
5. `browserNarrator.ts` adapta Web Speech sin enviar texto a servicios externos.
6. `pwa.ts`, el manifest y `sw.js` instalan y cachean solamente el shell.

El Reader Engine sigue siendo la única fuente del estado temporal. Los eventos de palabra de la voz
del dispositivo corrigen la posición, pero nunca reemplazan la línea de tiempo editorial.

## Persistencia local

Reader guarda únicamente preferencias, slugs favoritos, progreso, historial y vocabulario. No
guarda nombres, correos, perfiles infantiles, tokens ni contraseñas. Todos los valores se validan al
leer y vuelven a defaults seguros si están corruptos.

## PWA y frontera de Fase 9

El service worker cachea el shell compilado y deja catálogo, paquetes, portadas y audio en red. La
descarga explícita, checksum, activación de versiones, cuotas y sincronización pertenecen a la Fase
9 y no se simulan en esta fase.

## Degradación segura

- Sin voz del dispositivo: continúa el seguimiento visual.
- Sin API: la biblioteca muestra un estado recuperable y conserva datos locales.
- Sin soporte PWA: Reader funciona como web normal.
- Sin progreso válido: el cuento comienza desde el inicio.
