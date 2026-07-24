# Estrategia UX y accesibilidad

**Estado:** Validada para Fase 0 - FR-PH00-TASK-010 COMPLETED.

## Norte de experiencia

El contenido debe dominar la pantalla. Los controles principales permanecen visibles o fáciles de
recuperar, los estados se comunican claramente y ninguna decoración compite con la lectura.

## Una base, modos adaptados

FollowRead tendrá un sistema de lectura común con configuraciones de presentación:

- **Infantil:** tipografía y objetivos grandes, navegación reducida, mano visible por defecto, pocas
  decisiones, ilustraciones y salida segura.
- **Adulto:** diseño sobrio, mano opcional, tipografía, tema y unidad de resaltado configurables.
- **Aprender inglés:** inglés principal, traducción opcional, repetición rápida, velocidad y
  vocabulario en contexto.

No se crearán tres productos desconectados. La lógica principal y los controles esenciales se
comparten; las diferencias se expresan como políticas y preferencias.

## Principios de interacción

1. Una acción principal por vista.
2. Reproducción y progreso nunca se ocultan detrás de gestos desconocidos.
3. Un error conserva contexto y ofrece recuperación.
4. Una descarga muestra tamaño, progreso, resultado y disponibilidad.
5. Acciones destructivas o de publicación piden confirmación adecuada.
6. El foco no salta inesperadamente durante auto-scroll.
7. Tocar una palabra no debe iniciar una navegación accidental.

## Mano y resaltado

- La palabra activa tendrá resaltado perceptible sin depender sólo de color.
- La mano se posicionará por la caja de la palabra activa y un área segura inferior.
- El componente visual observará scroll, resize, fuentes cargadas y cambio de orientación.
- La mano se oculta con preferencia, falta de espacio o reducción de movimiento.
- Un modo sin mano conserva toda la información mediante resaltado y semántica.

## Accesibilidad desde diseño

- WCAG 2.2 AA como objetivo razonable;
- navegación completa por teclado;
- nombres y estados anunciables;
- foco visible y orden lógico;
- contraste documentado;
- zoom y reflow sin pérdida de acciones;
- objetivos táctiles ampliados en modo infantil;
- preferencia de reducción de movimiento;
- texto disponible aunque audio falle;
- mensajes de estado no dependientes sólo de color.

## Estados obligatorios de cada flujo

- inicial y vacío;
- cargando;
- éxito;
- error recuperable;
- error no recuperable;
- offline;
- sincronización pendiente;
- permiso insuficiente;
- contenido incompatible o retirado.

## Validación en Fase 1

- entrevistas o revisión con representantes cuando sea posible;
- recorridos de tareas para cada audiencia;
- wireframes responsive;
- prototipos de lector y editor;
- revisión de teclado, lector de pantalla y movimiento;
- pruebas de mano en líneas, zoom, orientación y scroll.

## Relación con perfiles

| Experiencia | Perfiles principales | Riesgo UX dominante |
|---|---|---|
| Infantil | FR-PERSONA-001/004 | Sobrecarga, activación accidental, movimiento |
| Aprender inglés | FR-PERSONA-002 | Salir de contexto y controles densos |
| Adulto | FR-PERSONA-003 | Presentación infantilizada y sesiones largas |
| Admin editor | FR-PERSONA-005 | Pérdida de borrador y errores tardíos |
| Revisión/operación | FR-PERSONA-006/007 | Estado opaco y acciones privilegiadas |

## Resultado de Fase 0

- Modos distintos sin aplicaciones duplicadas: PASS.
- Mano, movimiento, contraste, teclado, lector de pantalla y tacto: PASS.
- Estados vacíos, carga, error, offline y permiso: PASS.
- Principios convertibles en checklist de Fase 1: PASS.

Ver `ACCESSIBILITY_FOUNDATIONS.md`.
