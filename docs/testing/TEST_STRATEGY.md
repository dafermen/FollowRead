# Estrategia de pruebas

**Estado:** Validada para Fase 0 - FR-PH00-TASK-011 COMPLETED.

## Objetivos

- detectar errores cerca de la capa que los origina;
- probar Reader Engine de forma determinista;
- validar contratos entre contenido, audio y clientes;
- demostrar offline, accesibilidad y permisos;
- evitar dependencia y costo de servicios externos en automatización.

## Niveles

| Nivel | Alcance |
|---|---|
| Unitarias | Dominio, estado, parser, checksums, progreso, utilidades |
| Componentes | UI, formularios, lector, estados y accesibilidad |
| API | Validación, auth, permisos, errores, repositorios |
| Integración | SQLite real, almacenamiento falso, contratos y transacciones |
| E2E | Publicación, lectura, offline, reanudación y aprendizaje |
| Arquitectura | Límites de dependencias y ausencia de AWS/React donde no corresponde |
| Seguridad | Entradas maliciosas, IDOR, sesiones, secretos y permisos |
| Rendimiento | Catálogo, palabra activa, scroll, audio y endpoints críticos |

## Pirámide y herramientas previstas

- Vitest y React Testing Library para TypeScript/React.
- Pytest para API y dominio Python.
- Playwright para flujos web/PWA y accesibilidad automatizable.
- Mocks, fixtures y adaptadores falsos para Polly y S3.
- SQLite real en archivo temporal para integración; no simular transacciones ni restricciones.
- Las consultas deben mantenerse compatibles con SQLAlchemy portable para una migración futura a
  PostgreSQL, que añadirá una matriz de integración propia cuando se decida.

La selección final se confirma en Fase 2; no se agrega otra librería sin justificación.

## Casos críticos

- tiempo antes, durante y después de marcas;
- límites exactos y marcas inválidas;
- salto de línea, resize, orientación y auto-scroll;
- pausa, reanudación, velocidad y repetición;
- progreso local/remoto y conflicto;
- audio faltante o interrumpido;
- descarga cortada, checksum inválido y rollback;
- actualización compatible/incompatible;
- login inválido y permiso insuficiente;
- transición o publicación inválida;
- navegación sólo teclado, foco y reducción de movimiento.

## Datos de prueba

- contenido mínimo en inglés y español;
- signos, contracciones, Unicode y párrafos largos;
- paquetes compatibles, corruptos e incompletos;
- secuencias de Speech Marks conocidas;
- usuarios por rol;
- relojes y red controlables.

## Puertas de calidad

Una tarea no termina si:

- falla una prueba relacionada;
- no existe prueba para un criterio crítico;
- se omite una prueba por inestabilidad sin registrar problema;
- depende de AWS real;
- la documentación de ejecución no está actualizada.

Antes de cualquier despliegue externo también aplica la matriz de trece categorías de
`PRE_DEPLOYMENT_TESTS.md`. Una fila parcial o no implementada bloquea la entrega salvo excepción
formal, fechada y aprobada.

## Estrategia de accesibilidad

Automatización detectará semántica, nombres y algunos contrastes. La validación manual cubrirá orden de
foco, lector de pantalla, zoom, reflow, movimiento, comprensión y objetivos táctiles.

## Cobertura de riesgos

| Riesgo | Nivel principal | Evidencia requerida |
|---|---|---|
| FR-RISK-001 alcance excesivo | Revisión de aceptación | Demo vertical y matriz MVP |
| FR-RISK-002 privacidad infantil | Seguridad/E2E | Inventario sin PII y flujo local |
| FR-RISK-003 marcas desalineadas | Unit/integración/E2E | Fixtures, límites y previsualización |
| FR-RISK-004 costos AWS | Unit/integración | Estimación/límite con adaptador falso |
| FR-RISK-005 descarga dañada | Integración/E2E | Interrupción, checksum y rollback |
| FR-RISK-006 mano/movimiento | Componente/manual/a11y | Líneas, zoom, reduced motion |
| FR-RISK-007 docs obsoletas | Validación documental | IDs, enlaces, estados y trazabilidad |
| FR-RISK-008 sin Git | Fase 2 | Repositorio/historial antes de código |

## Puertas por cambio

1. Formato/lint.
2. Type-check o análisis Python.
3. Unitarias afectadas.
4. Integración cuando cambia contrato/datos.
5. Componentes/accesibilidad cuando cambia UI.
6. E2E para flujos críticos.
7. Build reproducible.
8. Documentación y trazabilidad.

## Resultado de validación

- Cada riesgo tiene nivel y evidencia: PASS.
- AWS real está prohibido en automatización: PASS.
- Casos críticos del prompt están cubiertos: PASS.
- Fallo de una puerta impide completar la tarea: PASS.
