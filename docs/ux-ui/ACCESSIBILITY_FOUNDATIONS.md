# Fundamentos de accesibilidad

**Estado:** Base validada para Fase 0  
**Tarea responsable:** FR-PH00-TASK-010 - COMPLETED

## Alcance

Aplica a Admin y Reader web/PWA. Los mismos principios se conservarán en Capacitor. Objetivo:
WCAG 2.2 AA para flujos MVP, complementado con pruebas manuales.

## Teclado y foco

- Toda acción crítica operable sin puntero.
- Orden de foco coincide con lectura.
- Foco visible, no cubierto y restaurado tras diálogos.
- Auto-scroll de lectura no mueve el foco.
- Atajos no interfieren con entrada de texto ni tecnología asistiva.

## Semántica y lector de pantalla

- Controles nativos cuando sea posible.
- Nombre, rol, valor/estado y error asociados.
- Encabezados y regiones coherentes.
- Cambios de descarga, guardado y reproducción anunciados sin exceso.
- Palabra visual activa no se anuncia en cada cambio si interrumpe la narración; se ofrecerá una
  estrategia configurable que se validará con usuarios.

## Visual

- Contraste AA para texto, controles y foco.
- Color nunca es la única señal.
- Zoom y reflow hasta 400% sin perder funciones críticas.
- Texto configurable sin romper posición de mano.
- Estados de sincronización incluyen texto/icono y semántica.

## Movimiento y audio

- `prefers-reduced-motion` desactiva desplazamientos no esenciales.
- La mano puede ocultarse independientemente.
- Auto-scroll evita animación cuando se reduce movimiento.
- Audio tiene texto completo equivalente.
- Ninguna función depende sólo de sonido.

## Tacto y modo infantil

- Mínimo 24x24 CSS px; objetivo 44x44 en infantil.
- Separación suficiente para evitar activación accidental.
- Acciones peligrosas o salida de modo requieren confirmación apropiada.
- Sin acceso accidental a Admin.

## Formularios Admin

- Etiqueta persistente, instrucción y error asociado.
- Resumen de errores con foco.
- Guardado, pendiente, conflicto y recuperación distinguibles.
- Editor bilingüe conserva relación semántica entre unidades.

## Matriz de validación

| Área | Automatizada | Manual | Usuarios |
|---|---|---|---|
| Semántica/nombres | Sí | Sí | Cuando aplique |
| Teclado/foco | Parcial | Sí | Sí |
| Contraste | Parcial | Sí |  |
| Zoom/reflow | No | Sí | Sí |
| Movimiento/mano | Parcial | Sí | Sí |
| Comprensión infantil | No | Sí | Sí, con protocolo apropiado |
| Lector de pantalla | Parcial | Sí | Sí |

## Criterios para Fase 1

Cada wireframe debe documentar acción principal, orden de foco, estados, texto accesible, objetivo
táctil y comportamiento con movimiento reducido. Un diseño que no pueda explicarlo no avanza a UI.
