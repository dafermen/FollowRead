# Modo aprender inglés

**Estado:** Validado para Fase 1

## Propósito

Relacionar sonido, escritura y significado sin sacar al estudiante de la lectura.

## Defaults

- inglés como texto principal con `lang="en"`;
- traducción editorial oculta/colapsada inicialmente;
- velocidad 0.85x sugerida, modificable;
- palabra y oración repetibles;
- vocabulario contextual accesible;
- mano opcional.

## Interacción de palabra

1. Seleccionar palabra sin cambiar progreso.
2. Mostrar panel contextual con pronunciación, traducción y ejemplo editorial.
3. Reproducir palabra.
4. Guardar/quitar vocabulario con estado local/sync.
5. Cerrar y devolver foco a la palabra.

## Repetición de oración

- usa límites canónicos;
- anuncia "Repetir oración";
- respeta velocidad;
- vuelve a reproducción normal cuando el usuario lo elige;
- no crea bucle inesperado.

## Densidad progresiva

Reproducir/pausar, velocidad y repetir son visibles. Traducción, detalles y vocabulario aparecen en
panel contextual; así se resuelve FR-UXF-001 sin esconder funciones.

## Offline y contenido

- traducción/significado esencial está en el paquete según FR-DEC-008;
- audio de palabra puede usar segmentos incluidos;
- si falta un recurso, el texto sigue disponible y se explica.

## Accesibilidad

- idiomas marcados por fragmento;
- palabra interactiva operable con teclado/tacto;
- panel devuelve foco;
- pronunciación no es la única representación;
- no anunciar todas las palabras durante reproducción.

## Validación

- FR-PERSONA-002 y FR-US-READER-007/008 cubiertos: PASS.
- Traducción, repetición, velocidad y vocabulario: PASS.
