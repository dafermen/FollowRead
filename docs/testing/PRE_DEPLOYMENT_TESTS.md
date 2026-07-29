# Pruebas obligatorias antes del despliegue

**Estado del gate:** BLOCKED para despliegue externo  
**Aplica a:** development compartido, staging y production  
**No aplica a:** `pnpm dev` en una estación local

## Regla de aprobación

Antes de desplegar, cada fila debe tener evidencia asociada al mismo commit y resultado `PASS`.
Una excepción `WAIVED` exige riesgo registrado, alcance, responsable, aprobación explícita y fecha
de caducidad. `PARTIAL`, `NOT_IMPLEMENTED`, `BLOCKED`, `FAIL` o ausencia de evidencia impiden el
despliegue.

## Matriz actual

| # | Categoría | Evidencia o comando actual | Estado actual | Brecha para despliegue |
|---:|---|---|---|---|
| 1 | Aceptación | criterios, recorridos Admin/Reader y revisión del propietario | PARTIAL | registrar aceptación sobre el artefacto candidato |
| 2 | Unitarias | `pnpm test` | PASS_LOCAL | repetir en CI para el commit candidato |
| 3 | Propiedades e invariantes | casos deterministas de Reader Engine, checksums e idempotencia | PARTIAL | añadir generación de casos con Hypothesis o fast-check |
| 4 | Mutation testing | sin runner configurado | NOT_IMPLEMENTED | definir umbral y ejecutar mutación en dominio crítico |
| 5 | Fuzzing | validaciones y casos maliciosos escritos manualmente | NOT_IMPLEMENTED | fuzzear parsers, schemas, paquetes y entradas de API |
| 6 | Integración | pytest con SQLite/Alembic y servicios/repositories | PASS_LOCAL | repetir en CI y contenedor candidato |
| 7 | Contrato | OpenAPI, schemas y validación de paquete Reader | PARTIAL | congelar/diferenciar OpenAPI y añadir contratos consumidor-proveedor |
| 8 | Extremo a extremo | `reader:e2e`, offline, móvil, aprendizaje y recorridos Admin | PASS_LOCAL | ejecutar contra el entorno candidato |
| 9 | Regresión | `pnpm quality:regression` | PASS_LOCAL | ejecutar contra el mismo commit antes del despliegue |
| 10 | Seguridad | `pnpm security:audit`, auth, permisos, headers y auditoría | PASS_LOCAL | repetir auditoría y revisar secretos del entorno |
| 11 | Concurrencia y resiliencia | carga local, sync idempotente, offline/reconexión y errores | PARTIAL | probar bloqueo SQLite, reinicios, timeouts, reintentos y degradación |
| 12 | Rendimiento y recursos | `quality:budget` y `quality:load` | PASS_LOCAL | medir artefacto candidato con presupuestos registrados |
| 13 | Compatibilidad y despliegue | builds web/móvil y `deploy:validate` | BLOCKED | Docker real, GitHub runner, staging, rollback e iOS físico |

El estado global permanece `BLOCKED` porque no todas las categorías están en `PASS` o `WAIVED`.
No debe modificarse esta conclusión para acelerar una entrega.

## Orden de ejecución

1. Fijar commit, versión, entorno, datos de prueba y responsables.
2. Ejecutar `pnpm docs:validate`, `pnpm check` y pruebas unitarias.
3. Ejecutar propiedades/invariantes, mutation testing y fuzzing.
4. Ejecutar integración y contratos.
5. Ejecutar E2E, regresión y seguridad.
6. Ejecutar concurrencia/resiliencia y rendimiento/recursos.
7. Construir contenedores y artefactos móviles/web.
8. Crear y verificar backup; aplicar migración en staging.
9. Ejecutar smoke, compatibilidad y rollback.
10. Registrar aceptación y aprobar o rechazar el despliegue.

## Acta de evidencia

```text
Versión:
Commit:
Entorno:
Fecha y zona horaria:
Responsable de ejecución:
Artefactos y checksums:

1. Aceptación: PASS | FAIL | WAIVED — evidencia:
2. Unitarias: PASS | FAIL | WAIVED — evidencia:
3. Propiedades e invariantes: PASS | FAIL | WAIVED — evidencia:
4. Mutation testing: PASS | FAIL | WAIVED — evidencia:
5. Fuzzing: PASS | FAIL | WAIVED — evidencia:
6. Integración: PASS | FAIL | WAIVED — evidencia:
7. Contrato: PASS | FAIL | WAIVED — evidencia:
8. Extremo a extremo: PASS | FAIL | WAIVED — evidencia:
9. Regresión: PASS | FAIL | WAIVED — evidencia:
10. Seguridad: PASS | FAIL | WAIVED — evidencia:
11. Concurrencia y resiliencia: PASS | FAIL | WAIVED — evidencia:
12. Rendimiento y recursos: PASS | FAIL | WAIVED — evidencia:
13. Compatibilidad y despliegue: PASS | FAIL | WAIVED — evidencia:

Riesgos/excepciones:
Resultado global: APPROVED | REJECTED
Aprobador:
```
