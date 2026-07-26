# Evidencia de pruebas - Fase 11

## Cobertura automatizada

| Capa | Evidencia |
|---|---|
| Dominio | Alineación contextual, progreso y filtros en `learningDomain.test.ts` |
| Persistencia | Vocabulario, favoritos, revisiones e historial en `readerStorage.test.ts` |
| Integración React | Traducción, selección, contexto, guardado, favorito y foco en `App.test.tsx` |
| Navegador real | `pnpm reader:learning-e2e` |
| Regresión Reader | `pnpm --filter @followread/reader test:coverage` |
| Puerta integral | `pnpm check` |

## Recorrido Chrome

`scripts/verify-learning-e2e.mjs` comprueba en un navegador real:

1. activa modo aprendizaje con inglés y velocidad 0.75x;
2. abre el cuento publicado;
3. muestra y oculta la traducción editorial;
4. selecciona `watched` y obtiene `miraba` con ambos ejemplos;
5. guarda y marca la palabra como favorita;
6. confirma vocabulario e historial en `localStorage`;
7. abre Mi vocabulario, aplica el filtro Favoritas y conserva la consulta;
8. repite el recorrido visual a 390 × 844 sin overflow horizontal.

Las capturas de diagnóstico se generan en `var/e2e/` y no se versionan:

- `phase11-learning-reader-desktop.png`;
- `phase11-vocabulary-desktop.png`;
- `phase11-vocabulary-mobile.png`.

## Resultado

- 9 archivos de prueba Reader aprobados.
- 36 pruebas Reader aprobadas antes de la puerta final.
- La experiencia funciona sin API de inteligencia artificial.
- La información educativa sigue disponible cuando el paquete ya está descargado.
