# Análisis del prompt maestro

## Fuente

- **Documento:** `docs/FollowRead Project Prompt.pdf`
- **Fecha del documento:** 2026-07-24
- **Páginas revisadas:** 37 de 37
- **Estado:** Fuente normativa inicial del proyecto

## Mandatos que condicionan toda implementación

1. El trabajo avanza por fases y tareas con estados explícitos.
2. Admin, Reader y API permanecen separados.
3. Sólo Reader se empaqueta con Capacitor.
4. Reader Engine se mantiene independiente de la interfaz.
5. Contenido y recursos editoriales se actualizan sin nuevo build.
6. AWS sólo se usa desde el backend y sus credenciales nunca llegan al cliente.
7. Las pruebas automatizadas no usan servicios AWS reales.
8. Accesibilidad, offline, seguridad, documentación y pruebas no son mejoras opcionales.
9. Ninguna tarea se completa si faltan criterios, pruebas o documentación.
10. La Fase 0 debe cerrarse antes de diseñar pantallas definitivas.

## Dominios identificados

- gestión editorial bilingüe;
- catálogo y versionado de contenido;
- procesamiento de texto, audio y Speech Marks;
- lector sincronizado;
- modos infantil, adulto y aprendizaje;
- identidad, autorización y auditoría;
- descarga, almacenamiento local y sincronización;
- aplicaciones web, PWA y móvil híbrida;
- seguridad, privacidad, accesibilidad y operación.

## Inconsistencias y vacíos

| ID | Tema | Observación | Tratamiento |
|---|---|---|---|
| PA-001 | Tipo `document` | Aparece en la visión, no en el catálogo de tipos | FR-DEC-OPEN-001 |
| PA-002 | Cuentas infantiles | No hay modelo de consentimiento o tutor | FR-DEC-OPEN-002 |
| PA-003 | Traducción contextual | No se define fuente, licencia ni modo offline | FR-DEC-OPEN-003 |
| PA-004 | Notas y marcadores | Requeridos en modo adulto sin entidades iniciales | FR-ISSUE-003 |
| PA-005 | MVP | El documento define el producto final, no el corte mínimo | FR-PH00-TASK-004 |
| PA-006 | Metas medibles | "Rápido", "estable" y "razonable" requieren umbrales | FR-PH00-TASK-006 |
| PA-007 | Licencia | Se solicita un archivo, pero no se indica licencia | FR-DEC-OPEN-004 |

## Supuestos de trabajo, no aprobados

- El MVP será una sección vertical demostrable y no todas las funciones del roadmap.
- El contenido editorial se prepara antes de publicarse; Reader nunca edita contenido.
- Las traducciones del MVP serán editoriales para funcionar offline y evitar dependencia de IA.
- El uso infantil minimizará datos personales hasta decidir un modelo de cuenta.
- El prompt original proponía PostgreSQL como fuente autoritativa; FR-DEC-013 lo sustituye por SQLite
  para el MVP debido a la restricción operativa confirmada. S3 conservará objetos grandes.

## Resultado del análisis

El proyecto es viable si se controla el alcance y se resuelven privacidad infantil, modelo de
traducciones, tipos de contenido y métricas no funcionales. No es responsable iniciar código antes de
cerrar esas definiciones.
