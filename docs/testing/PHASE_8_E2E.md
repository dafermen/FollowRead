# Verificación E2E de Reader - Fase 8

## Preparación

```powershell
pnpm demo:seed
pnpm dev
```

En otra terminal:

```powershell
pnpm reader:e2e
```

El recorrido usa Chrome o Edge en modo headless contra los servicios reales. Verifica inicio,
biblioteca, detalle, lector, ajustes y manifest PWA. Las interacciones de favoritos, historial,
configuración, aprendizaje, narración y fallos recuperables se cubren con Vitest.

## Revisión visual

Revisar al menos:

- 1440 × 1000: rail lateral, jerarquía y tarjetas;
- 390 × 844: navegación inferior, safe areas y controles;
- 320 CSS px o zoom 400%: reflow sin desplazamiento horizontal de contenido;
- teclado: skip link, foco visible, filtros, lector y panel de aprendizaje;
- movimiento reducido y temas claro/oscuro.

## Alcance

La prueba PWA comprueba shell instalable. No exige contenido descargado porque esa capacidad se
implementa en la Fase 9.
