# Revisión de Fase 8 - FollowRead Reader Web

**Fecha:** 2026-07-26  
**Estado:** COMPLETED

## Resultado

Reader ofrece una experiencia completa y demostrable: inicio, biblioteca, filtros, categorías,
detalle, lector bilingüe, favoritos, progreso, historial, configuración, vocabulario y tres modos
de lectura. El navegador puede narrar con una voz local sin API key y la aplicación dispone de
manifest, icono, instalación y cache de shell PWA.

## Criterios verificados

1. Biblioteca y búsqueda consumen exclusivamente contenido publicado.
2. Detalle y lector preservan slug, idioma, capítulos y progreso.
3. Favoritos, historial, vocabulario y ajustes locales se validan y no contienen PII.
4. Infantil, adulto y aprendizaje comparten la aplicación y aplican defaults distintos.
5. Narración audible degrada a seguimiento visual cuando Web Speech no está disponible.
6. Shell amplio/compacto, safe areas, 320 px, reduced motion y foco visible están contemplados.
7. La PWA cachea el shell sin adelantar las descargas de contenido de Fase 9.
8. Pruebas unitarias, integración, navegador real, tipos, lint, build y puerta completa pasan.

## Evidencia

- 22 pruebas Reader con cobertura superior al 90% en almacenamiento, narración y PWA.
- recorrido Chrome headless sobre cinco rutas públicas y manifest;
- revisión visual amplia y compacta;
- `pnpm check` desde SQLite sembrada.

## Decisiones

- Web Speech es el adaptador audible local del MVP; no requiere OpenAI ni AWS.
- El Reader Engine conserva la autoridad temporal.
- Las descargas offline, checksum y sincronización quedan en Fase 9.
