# Evidencia de calidad, accesibilidad y rendimiento - Fase 12

**Fecha:** 2026-07-26
**Resultado:** PASS

## Automatización añadida

| Comando | Cobertura |
|---|---|
| `pnpm quality:a11y` | semántica, nombres, etiquetas, idioma, IDs, landmarks y reflow móvil |
| `pnpm quality:budget` | chunks, gzip, service worker, cabeceras, timing y métricas |
| `pnpm quality:load` | 120 solicitudes concurrentes sobre salud y catálogo SQLite |
| `pnpm security:audit` | vulnerabilidades JavaScript y Python |
| `pnpm quality:regression` | puerta completa, cuatro E2E Reader y las auditorías anteriores |

## Resultado medido

- Admin: entrada 12.7 KB, área administrativa diferida 54.0 KB y React 189.7 KB; todos los chunks
  están por debajo de 150 KB gzip.
- Reader: entrada 65.0 KB, sala de lectura diferida 19.8 KB y React 189.7 KB; todos los chunks están
  por debajo de 150 KB gzip.
- Carga final: 120 solicitudes, concurrencia 12, p50 60.9 ms, p95 107.9 ms, máximo 122.5 ms,
  cero fallos. Presupuesto p95: 750 ms.
- Accesibilidad automatizada: ocho rutas de Admin/Reader a 390 × 844 sin nombres vacíos, campos sin
  etiqueta, imágenes sin `alt`, IDs duplicados, landmarks ausentes ni desbordamiento horizontal.
- Dependencias: cero vulnerabilidades conocidas de nivel moderado o superior en JavaScript y cero
  vulnerabilidades conocidas en el entorno Python.

## Regresión funcional

- Admin: 14 pruebas.
- Reader: 38 pruebas.
- Reader Engine: 6 pruebas.
- Configuración: 3 pruebas.
- API: 101 pruebas.
- Tipos estrictos, lint, formato, cobertura y builds de producción en verde.

La auditoría automatizada reduce regresiones, pero no sustituye pruebas con tecnologías de
asistencia ni la validación física iOS requerida antes de TestFlight.
