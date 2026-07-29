# Arquitectura del Reader Engine

## Propósito y límite

`@followread/reader-engine` convierte una línea de tiempo publicada en estado de lectura. No conoce
React, HTML, almacenamiento, red ni proveedores de audio. La aplicación Reader decide cómo dibujar
ese estado y cómo persistir el progreso.

## Entrada

La API expone `GET /catalog/{slug}/reader-package` con:

- publicación activa y versión;
- traducciones, capítulos y párrafos ordenados;
- ilustración principal y descripción alternativa;
- ilustración y texto alternativo opcionales por capítulo, con fallback a la principal;
- URI, duración, voz y tipo de audio;
- Speech Marks ordenados con tiempo, caracteres, párrafo y capítulo.

El servicio rechaza publicaciones incompletas para evitar que el Reader intente corregir paquetes
inválidos.

## Estado y operaciones

El motor mantiene un estado inmutable observable con `status`, tiempo, duración, tasa, palabra,
capítulo, revisión de layout y error. Sus operaciones son:

- `load`, `play`, `pause`, `toggle` y `tick`;
- `seek`, `skip` y `repeatActiveWord`;
- `setPlaybackRate` entre 0.5× y 2×;
- `changeChapter`;
- `handleViewportChange`, `handleInterruption` y `handleAudioLoss`;
- `getProgress` para posición y anclas estables.

La palabra activa se localiza por búsqueda binaria sobre marcas ordenadas, con costo O(log n).
Durante un espacio sin marca no se resalta ninguna palabra. Llegar a la duración total cambia el
estado a `ended`; volver a reproducir reinicia desde cero.

## Integración web

El Reader crea una instancia por pantalla, se suscribe a sus cambios y usa un reloj de 100 ms para
el demostrador local. La palabra activa recibe resaltado, una mano indicadora y auto-scroll. El
progreso se guarda por `slug` e idioma en `localStorage`; no contiene identidad ni datos sensibles.
La imagen visible se resuelve desde el capítulo activo y reutiliza la portada cuando el campo
específico es nulo. Las descargas offline incluyen todos los recursos visuales referenciados.

Un cambio de tamaño u orientación incrementa la revisión de layout y vuelve a centrar la palabra.
Perder el foco pausa la lectura. La pérdida de una fuente de audio se representa como error y no
como silencio indefinido.

## Audio del MVP

`pnpm demo:seed` respeta el proveedor configurado. Con `FOLLOWREAD_POLLY_PROVIDER=fake` produce
duraciones y Speech Marks deterministas, por lo que permite demostrar la sincronización sin API
key, AWS, red ni costo; ese archivo no es narración audible real. Con
`FOLLOWREAD_POLLY_PROVIDER=openai` genera MP3 audibles y marcas alineadas, guarda su huella en
SQLite y reutiliza los archivos mientras el texto y la configuración no cambien. El motor conserva
el mismo contrato en ambos modos.

## Verificación

- pruebas unitarias del motor para validación, búsqueda, controles, progreso e interrupciones;
- pruebas API para paquete completo, faltantes y referencias inválidas;
- pruebas del Reader para biblioteca, error, controles, idioma y recuperación;
- TypeScript strict, mypy, Ruff, ESLint, cobertura y builds en la puerta `pnpm check`.
