# Plan de implementación

## Estrategia

FollowRead avanzará por fases con cortes verticales verificables. Cada fase deberá producir un
resultado demostrable, no sólo archivos aislados.

## Orden

1. Cerrar producto, riesgos, requisitos y estrategias en Fase 0.
2. Diseñar flujos y sistema visual accesible en Fase 1.
3. Crear monorepo, entornos y controles de calidad en Fase 2.
4. Construir API y datos antes de depender de ellos desde interfaces finales.
5. Proteger identidad y permisos antes de Admin publicable.
6. Implementar Admin y flujo editorial.
7. Integrar Polly mediante adaptadores y trabajos.
8. Desarrollar Reader Engine con fixtures deterministas.
9. Integrar Reader web/PWA.
10. Agregar offline antes de empaquetar móviles.
11. Incorporar Capacitor y después capacidades educativas restantes.
12. Endurecer, automatizar despliegues y completar documentación.

## Corte de entrega recomendado

El primer demo técnico completo debe incluir un cuento bilingüe que recorra:

```text
Admin -> procesamiento falso/real controlado -> revisión -> publicación
-> catálogo -> descarga -> reproducción sincronizada -> progreso offline
```

Ese corte valida los mayores riesgos sin construir todo el catálogo de funcionalidades.

## Control de cambios

- Una dependencia nueva requiere necesidad, alternativas y consecuencia documentadas.
- Un cambio de límite arquitectónico requiere decisión.
- Un TODO requiere tarea o problema conocido.
- Un requisito nuevo debe entrar en trazabilidad antes de implementación.
- Una fase no hereda silenciosamente deuda crítica.
