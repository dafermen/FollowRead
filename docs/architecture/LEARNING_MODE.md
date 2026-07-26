# Arquitectura del modo aprender inglés

**Estado:** Implementado en Fase 11
**Aplicación:** `apps/reader`

## Propósito

El modo aprendizaje relaciona palabra, audio y significado sin abandonar el cuento. Funciona en
web, PWA, Android e iOS porque vive dentro del Reader compartido y no usa plugins nativos.

## Fuente editorial

Las ayudas esenciales se construyen desde el paquete bilingüe publicado:

1. `stable_key` relaciona el párrafo inglés con su traducción española.
2. Las Speech Marks identifican la palabra seleccionada y su posición relativa.
3. `learningDomain.ts` obtiene el equivalente editorial determinista.
4. El párrafo original y el traducido se usan como ejemplo contextual.

La repetición no supone que un párrafo sea una oración: `sentenceMarksFor` recorre las marcas hasta
la puntuación terminal anterior y posterior. La voz del dispositivo reproduce únicamente esas
marcas o la palabra elegida y conserva la velocidad actual.

La alineación relativa es un fallback de MVP, no un diccionario universal. Si no existe un párrafo
pareado, la interfaz informa que el apoyo no está disponible. Ninguna función esencial llama a
OpenAI, un traductor automático o un diccionario externo.

## Componentes

| Archivo | Responsabilidad |
|---|---|
| `learningDomain.ts` | Construye la ficha contextual, filtra vocabulario y resume progreso |
| `StoryReaderPage.tsx` | Traducción visible/oculta, selección, repetición y panel contextual |
| `readerStorage.ts` | Preferencias, vocabulario, favoritos, historial y estados de estudio |
| `ReaderApp.tsx` | Panel de vocabulario, búsqueda, filtros, métricas y actividad reciente |
| `styles.css` | Presentación responsive y accesible compartida por web y móvil |

## Persistencia local

El MVP conserva únicamente decisiones de lectura no sensibles:

- `followread-reader-vocabulary-v1`: palabra, traducción, contexto, favorito, estado y repasos;
- `followread-reader-learning-history-v1`: últimas 100 palabras exploradas y número de consultas;
- `followread-reader-preferences-v1`: modo, idioma, velocidad y traducción inicialmente visible.

No se guardan nombre, correo, edad ni identidad infantil. Los lectores antiguos se normalizan con
valores seguros cuando todavía no contienen los campos de Fase 11.

## Progreso

Cada palabra guardada puede estar `new`, `learning` o `mastered`. El resumen muestra:

- palabras únicas exploradas;
- guardadas;
- aprendiendo;
- dominadas;
- favoritas;
- avance frente a una meta local de cinco exploraciones.

La métrica es una ayuda privada del dispositivo, no una evaluación académica ni analítica remota.

## Accesibilidad

- texto y ejemplos incluyen el atributo `lang`;
- palabras son botones operables con teclado y tacto;
- el panel usa nombre accesible, cierra con `Escape` y devuelve foco a la palabra;
- favoritos y filtros exponen `aria-pressed`;
- estados no dependen únicamente de color;
- velocidad, traducción y repetición permanecen disponibles sin audio;
- el reflow móvil evita desplazamiento horizontal.

## Límites y extensión

Para ofrecer acepciones lingüísticas complejas, el contrato editorial futuro debe publicar
alineaciones o glosarios revisados. Esa extensión debe seguir siendo opcional y versionada. No se
debe reemplazar el fallback determinista por IA como dependencia silenciosa.
