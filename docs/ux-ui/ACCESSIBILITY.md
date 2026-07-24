# Especificación de accesibilidad

**Estado:** Validada para diseño  
**Tarea responsable:** FR-PH01-TASK-006 - COMPLETED  
**Objetivo:** WCAG 2.2 AA para flujos MVP.

## Teclado por patrón

| Patrón | Interacción | Foco al abrir/cerrar |
|---|---|---|
| Navegación | Tab/Shift+Tab; Enter activa | ruta nueva enfoca h1 cuando corresponde |
| Drawer | botón abre; Escape cierra | primer elemento / vuelve al botón |
| Dialog | Tab contenido; Escape si cancelable | inicial significativo / vuelve al disparador |
| Tabs | flechas entre tabs; Tab al panel | tab activo |
| Combobox | flechas, Enter, Escape | campo conserva foco |
| Lista reordenable | botones subir/bajar y anuncio | elemento movido |
| Media controls | Tab + Space/Enter | control activado |
| WordToken | Tab sólo cuando interactivo; Enter/Space | palabra conserva foco |
| Toast reversible | alcanzable sin robar foco | vuelve al contexto |
| Error summary | enlaces a campos | campo inválido |

No se exige arrastrar, hover o gesto como única forma de completar una acción.

## Foco

- Indicador de 3px con offset y contraste suficiente.
- Nunca queda detrás de header, controles sticky o teclado virtual.
- Auto-scroll visual no mueve foco.
- Agregar/eliminar elemento lleva foco a un lugar predecible anunciado.
- Carga incremental no inserta contenido antes del foco.
- Rutas protegidas enfocan el mensaje de denegación.

## Lector de pantalla

- Una región `main` y un h1 por pantalla.
- Navegación con nombre distinto cuando hay varias.
- Estados de guardado/descarga usan `status`; errores urgentes usan `alert` con moderación.
- Progreso tiene nombre, valor y texto.
- La palabra activa visual no se anuncia en cada tick: causaría ruido. El texto completo sigue
  disponible y la posición se anuncia bajo demanda.
- Mano SVG es decorativa (`aria-hidden`) porque el resaltado contiene la información.
- Controles de reproducción exponen acción actual: "Pausar" mientras reproduce.

## Texto, color y contenido

- Pares críticos superan 4.5:1 según `DESIGN_SYSTEM.md`.
- Texto grande y elementos no textuales cumplen sus umbrales aplicables.
- Estados combinan texto, icono y color.
- Errores usan lenguaje concreto y se asocian al campo.
- Traducciones conservan etiqueta de idioma (`lang`).
- Cambios de idioma se marcan por fragmento.

## Tacto y puntero

- 24x24 CSS px mínimo; 44x44 en modo infantil.
- Alternativa a drag para reordenar.
- Alternativa a hover para tooltips/información.
- Cancelación o undo para activaciones accidentales cuando sea razonable.
- Palabras tocables mantienen separación o usan una superficie contextual sin impedir selección.

## Movimiento

- `prefers-reduced-motion` se respeta en primer render.
- Ajuste propio puede reducir más, nunca forzar movimiento contra preferencia del sistema.
- Mano/auto-scroll saltan sin animación cuando se reduce.
- Nada parpadea por encima del umbral seguro.
- Reproducción de audio no inicia inesperadamente, salvo lectura automática elegida.

## Formularios Admin

- Etiquetas persistentes; placeholder no reemplaza label.
- Requisitos y formato se explican antes del error.
- Resumen de errores al enviar; foco al resumen; enlaces a campos.
- Autoguardado no reemplaza botón/estado explícito cuando hay conflicto.
- Editor bilingüe usa grupos con idioma y unidad relacionada.

## Modo infantil

- Navegación reducida y salida segura.
- Controles 44px y espacio entre acciones.
- Mensajes cortos con recuperación visible.
- No pide PII ni presenta login infantil.
- Ilustración no desplaza controles esenciales.

## Auditoría por pantalla

Cada pantalla debe probar:

1. teclado completo;
2. foco visible y orden lógico;
3. nombre/rol/estado;
4. zoom/reflow;
5. contraste;
6. error/estado async;
7. reduced motion;
8. tacto cuando aplica.

## Matriz WCAG de alto nivel

| Área | Criterios principales | Diseño |
|---|---|---|
| Perceptible | texto alternativo, contraste, reflow, audio/texto | especificado |
| Operable | teclado, foco, objetivos, gestos, movimiento | especificado |
| Comprensible | etiquetas, errores, consistencia | especificado |
| Robusto | semántica, nombre/rol/valor, estados | especificado |

## Resultado

- Teclado/foco por patrón: PASS.
- Lector de pantalla y estados: PASS.
- Zoom, orientación, safe areas y teclado virtual: PASS.
- Reduced motion y mano opcional: PASS.
- Objetivos táctiles infantiles: PASS.
