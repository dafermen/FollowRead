# Diseño responsive

**Estado:** Validado  
**Tarea responsable:** FR-PH01-TASK-006 - COMPLETED

## Principio

Los rangos describen cuándo el contenido necesita otra composición; no detectan marcas de dispositivo.
La experiencia debe funcionar desde 320 CSS px y con zoom/reflow de 400%.

## Rangos orientativos

| Rango | Nombre | Navegación | Grid | Diálogos |
|---|---|---|---|---|
| 320-599px | compacto | bottom nav Reader / drawer Admin | 1 columna | pantalla completa cuando complejo |
| 600-1023px | medio | rail compacto o bottom nav | 1-2 columnas | centrado o sheet |
| >=1024px | amplio | sidebar persistente | 2-4 columnas/rail | centrado |

Ningún componente usa el rango como sustituto de medición del contenedor. Tarjetas, editor bilingüe y
controles usan container queries o comportamiento equivalente cuando se implemente.

## Reglas Reader

| Pantalla/patrón | Compacto | Medio | Amplio |
|---|---|---|---|
| Inicio | tarjetas apiladas | continuar + recomendaciones | columna principal + grid |
| Biblioteca | filtros en sheet | filtros colapsables | rail de filtros |
| Categorías | chips/grid 2 | grid 3 | lista + resultados |
| Búsqueda | campo/filters sheet | filtros inline parciales | filtros + lista/grid |
| Detalle | portada arriba | portada/datos 2 columnas | portada + datos + descripción |
| Lector | texto/control inferior | texto + controles | texto centrado + rail opcional |
| Descargas | tarjetas | lista enriquecida | tabla |
| Favoritos/Historial | lista | grid/lista | lista con metadatos |
| Vocabulario | tarjeta por palabra | lista 2 columnas | tabla/lista + detalle |
| Configuración | formulario/preview alternados | dos paneles si caben | formulario + preview |
| Perfil | una columna | una columna amplia | panel centrado |

## Reglas Admin

- Tablas se transforman en tarjetas etiqueta-valor; no usan scroll horizontal como única solución.
- Split panes se convierten en secuencia lista -> detalle.
- Editor bilingüe apila pares completos, no todos los idiomas en bloques separados.
- Barra de guardado/estado permanece visible sin cubrir campos.
- Acciones de publicación mantienen resumen antes de confirmación.
- Navegación drawer devuelve foco al botón que la abrió.

## Lector, orientación y teclado

- Vertical: controles debajo del texto.
- Horizontal estrecho: controles en rail lateral si conserva 45ch; de lo contrario debajo.
- Teclado virtual no cubre palabra/campo activo.
- Al cambiar orientación se conserva tiempo, palabra, scroll lógico y foco.
- Fullscreen es opcional; salir no pierde progreso.

## Safe areas

Aplicar `env(safe-area-inset-*)` a navegación, controles inferiores y dialogs fullscreen. El texto de
lectura usa padding adicional y nunca se ubica bajo notch o gesto del sistema.

## Reflow y zoom

- A 400% y 1280 CSS px de viewport, contenido crítico cabe en una dimensión sin doble scroll.
- Excepciones justificadas: timelines/preview visual pueden usar una región con scroll nombrada.
- Texto no se trunca para caber; se envuelve.
- Acciones persistentes no reducen el área de lectura por debajo de una unidad útil.
- La mano se recalcula después de cambio de fuente, zoom y reflow.

## Imágenes y recursos

- `srcset/sizes` o equivalente para portadas/ilustraciones.
- Relación de aspecto reservada para evitar saltos.
- Audio se carga bajo demanda.
- Ilustraciones tienen texto alternativo editorial o se marcan decorativas.

## Validación de escenarios

| Escenario | Resultado |
|---|---|
| 320px compacto Reader/Admin | PASS en especificación |
| 600-1023px medio | PASS en especificación |
| >=1024px amplio | PASS en especificación |
| zoom/reflow 400% | PASS en especificación |
| vertical/horizontal | PASS en especificación |
| safe areas | PASS en especificación |
| teclado virtual | PASS en especificación |
| reduced motion | delegado a ACCESSIBILITY.md, cubierto |
