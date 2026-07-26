# Revisión de Fase 9 - Sincronización y modo offline

**Fecha:** 2026-07-26  
**Estado:** COMPLETED

## Resultado

Reader puede descubrir, descargar, verificar, actualizar, eliminar y leer contenido sin conexión.
El build contiene **El zorro y la luna**, por lo que una instalación nueva conserva una lectura real
sin depender de la API. El progreso se encola localmente y se confirma al reconectar.

## Criterios verificados

1. API y navegador calculan SHA-256 sobre los mismos bytes canónicos.
2. IndexedDB mantiene paquetes, catálogo y operaciones sin usar `localStorage` para contenido.
3. Catálogo local/remoto comunica versión, disponibilidad e incompatibilidad.
4. Activación atómica y rollback conservan el último paquete válido.
5. Advertencia de 100 MB, límite de 250 MB y cuota del navegador se aplican antes de guardar.
6. Eliminar una descarga conserva favoritos, historial, vocabulario y progreso.
7. Biblioteca, descargas, lector, marcas y voz del dispositivo funcionan sin red.
8. La API de sincronización confirma reenvíos, evita regresión y no requiere PII.
9. Estados de conexión y sincronización se anuncian visual y semánticamente.
10. Chrome real demuestra offline, cola y reconexión.

## Evidencia

- 98 pruebas API;
- 31 pruebas Reader con cobertura superior a 90%;
- prueba Chrome `reader:offline-e2e` en cuatro etapas;
- capturas amplia de Descargas y lector sin conexión;
- `pnpm check` desde SQLite sembrada.

## Decisiones

- SQLite sigue siendo la base del MVP.
- IndexedDB es la autoridad de paquetes locales.
- El cuento demo forma parte del build y no puede eliminarse desde la UI.
- UUID local aleatorio identifica sincronización sin recopilar nombre ni correo.
