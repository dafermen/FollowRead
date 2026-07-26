# @followread/reader-engine

Sincronización, palabra activa y control de reproducción sin dependencia de React ni del DOM.

## Capacidades

- valida duración, orden, límites y relación entre marcas y capítulos;
- encuentra la palabra activa con búsqueda binaria;
- reproduce, pausa, busca, salta, repite y cambia velocidad o capítulo;
- conserva progreso mediante posición y anclas estables;
- modela resize, orientación, interrupción y pérdida de audio.

```powershell
pnpm --filter @followread/reader-engine test
pnpm --filter @followread/reader-engine build
```

La integración completa está descrita en `docs/architecture/READER_ENGINE.md`.
