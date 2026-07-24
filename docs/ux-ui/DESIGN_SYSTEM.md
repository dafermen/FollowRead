# Sistema visual de FollowRead

**Estado:** Validado  
**Tarea responsable:** FR-PH01-TASK-005 - COMPLETED

## Principios

1. El contenido domina; el sistema visual orienta.
2. Un mismo sistema sirve a Reader y Admin.
3. Los modos cambian densidad, énfasis y defaults, no semántica.
4. Color, icono y movimiento nunca son la única señal.
5. Los tokens describen intención, no nombres de colores concretos.

## Tipografía

Primera implementación: stack del sistema para evitar descarga, licencia y retraso de fuente.

```css
font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
```

| Token | Tamaño/line-height | Uso |
|---|---|---|
| `text-xs` | 12/16 | metadato no crítico |
| `text-sm` | 14/20 | secundaria/Admin denso |
| `text-md` | 16/24 | UI base |
| `text-lg` | 18/28 | texto Reader adulto |
| `text-xl` | 22/32 | texto Reader infantil/aprendizaje |
| `heading-sm` | 20/28, 700 | sección |
| `heading-md` | 28/36, 700 | pantalla |
| `heading-lg` | 36/44, 750 | portada/entrada |

- Texto de lectura permite escala de usuario sin cambiar tokens de controles.
- Ancho recomendado de lectura: 45-75 caracteres.
- No justificar párrafos; conservar espaciado de palabras.
- Cursiva o mayúsculas no son la única diferencia.

## Espaciado y geometría

Base de 4px: `space-1=4`, `2=8`, `3=12`, `4=16`, `5=20`, `6=24`, `8=32`, `10=40`,
`12=48`, `16=64`.

| Token | Valor | Uso |
|---|---:|---|
| `radius-sm` | 6px | campos/chips |
| `radius-md` | 10px | botones/tarjetas |
| `radius-lg` | 16px | paneles infantiles/modales |
| `border` | 1px | separación estándar |
| `focus-ring` | 3px + 2px offset | foco visible |
| `touch-min` | 24x24px | WCAG mínimo |
| `touch-child` | 44x44px | modo infantil |
| `content-max` | 1200px | vistas generales |
| `reading-max` | 72ch | texto Reader |

## Color claro

| Rol | Valor | Uso/contraste esperado |
|---|---|---|
| `canvas` | `#F7F9FC` | fondo |
| `surface` | `#FFFFFF` | panel |
| `text` | `#172033` | texto sobre claro |
| `text-muted` | `#475467` | secundario sobre claro |
| `primary` | `#2457D6` | acción/enlace sobre blanco |
| `primary-strong` | `#173E9F` | hover/pressed |
| `focus` | `#7C3AED` | anillo + offset |
| `success` | `#166534` | estado con texto/icono |
| `warning` | `#92400E` | advertencia con texto/icono |
| `danger` | `#B42318` | error/destructivo |
| `learning` | `#0F766E` | acento modo aprendizaje |
| `highlight` | `#FDE68A` | fondo palabra; texto usa `text` |

## Color oscuro

| Rol | Valor |
|---|---|
| `canvas` | `#101828` |
| `surface` | `#1D2939` |
| `text` | `#F9FAFB` |
| `text-muted` | `#D0D5DD` |
| `primary` | `#9CB5FF` |
| `focus` | `#C4B5FD` |
| `success` | `#86EFAC` |
| `warning` | `#FCD34D` |
| `danger` | `#FDA29B` |
| `learning` | `#5EEAD4` |
| `highlight` | `#6B4F00` |

El contraste se valida programáticamente para pares de texto; colores de estado siempre incluyen
texto/icono.

## Movimiento

| Token | Duración | Uso |
|---|---:|---|
| `motion-fast` | 120ms | feedback local |
| `motion-base` | 180ms | panel/estado |
| `motion-reader` | 220ms máximo | mano/scroll cuando permitido |

- Curva estándar: `cubic-bezier(.2, 0, 0, 1)`.
- Reduced motion: duración 0-1ms, sin desplazamiento/zoom decorativo.
- Movimiento de mano usa posición transformada y no altera layout.
- Feedback no depende de animación.

## Iconografía

- Grid 24px y trazos consistentes.
- Iconos críticos incluyen etiqueta visible o nombre accesible.
- No elegir una librería hasta Fase 2; se evaluará tamaño, licencia y cobertura.
- Reproducción usa símbolos convencionales acompañados de texto/tooltip cuando sea ambiguo.
- Estados combinan forma, icono y texto.

## Componentes base

| Componente | Variantes | Estados obligatorios |
|---|---|---|
| Button | primary, secondary, quiet, danger | default, hover, focus, pressed, disabled, loading |
| IconButton | standard, media, child | mismos + tooltip/nombre |
| TextField/TextArea | normal, search | empty, filled, focus, invalid, disabled |
| Select/Combobox | single, filter | open, selected, invalid, disabled |
| Checkbox/Radio/Switch | standard, child | unchecked, checked, mixed, focus, disabled |
| Link | inline, standalone | default, visited cuando aplique, focus |
| Tabs | horizontal, compact selector | selected, focus, overflow |
| Card/ContentCard | static, actionable | default, hover, focus, unavailable |
| StatusBadge | draft, processing, review, published, error | icono + texto |
| Progress | determinate, indeterminate, stepper | etiqueta y valor |
| Alert/StatePanel | info, success, warning, error, empty | acción opcional |
| Toast | reversible/noncritical | pausa al hover/focus |
| Dialog | confirm, destructive, conflict | foco atrapado/restaurado |
| Navigation | bottom, rail, sidebar, drawer | current, focus, restricted |

## Componentes de dominio

| Componente | Responsabilidad | No debe hacer |
|---|---|---|
| `WordToken` | mostrar/interactuar con palabra | resolver tiempo de audio |
| `ReadingPointer` | representar mano/posición | mover foco o tapar texto |
| `MediaControls` | emitir intenciones de reproducción | contener lógica Reader Engine |
| `ReadingProgress` | mostrar posición/estado sync | inventar progreso confirmado |
| `ContentCard` | resumir contenido/estado local | descargar directamente |
| `DownloadItem` | mostrar progreso/error/acciones | activar paquete sin validar |
| `SaveStatus` | guardando/guardado/pendiente/error | ocultar conflicto |
| `BilingualPairEditor` | relacionar unidades EN/ES | traducir automáticamente |
| `WorkflowStepper` | mostrar estado/transiciones | autorizar transición |
| `JobStatus` | etapa/costo/error/reintento | exponer secreto/proveedor crudo |

## Modos

| Aspecto | Infantil | Adulto | Aprender inglés |
|---|---|---|---|
| Texto lectura | `text-xl` mínimo | `text-lg`, configurable | `text-xl` |
| Objetivo táctil | 44px | 24px mínimo/40 preferido | 40px preferido |
| Mano | visible por defecto | oculta por defecto | opcional |
| Densidad | baja | media | media contextual |
| Navegación | reducida/salida segura | completa | completa |
| Acento | primary cálido sólo decorativo | primary sobrio | `learning` |
| Controles | esenciales visibles | configurables | repetir/traducir visibles |

## Voz y tono

- Claro, concreto y no culpabilizante.
- Error: qué ocurrió, qué se conservó, siguiente acción.
- Infantil: frases cortas sin tratar al niño como incapaz.
- Admin: precisión, IDs sólo cuando ayudan a diagnosticar.
- No usar “éxito” si una operación sigue pendiente de sincronización.

## Validación

- Tipografía, espaciado, color, iconografía y movimiento definidos: PASS.
- Componentes base y de dominio con estados/prohibiciones: PASS.
- Infantil, adulto y aprendizaje comparten semántica: PASS.
- Contraste de 18 pares críticos: PASS.

### Evidencia de contraste

- Claro: mínimo `learning`/blanco = 5.47:1.
- Claro: texto/highlight = 13.06:1.
- Oscuro: mínimo texto/highlight = 7.32:1.
- Todos los pares de texto evaluados superan 4.5:1.
