# Pruebas

Esta es la entrada canónica para la estrategia y las puertas de calidad de FollowRead.

## Regla antes de desplegar

Antes de desplegar en development compartido, staging o production deben ejecutarse y quedar
documentadas estas trece categorías:

1. pruebas de aceptación;
2. pruebas unitarias;
3. pruebas de propiedades e invariantes;
4. mutation testing;
5. fuzzing;
6. pruebas de integración;
7. pruebas de contrato;
8. pruebas de extremo a extremo;
9. pruebas de regresión;
10. pruebas de seguridad;
11. concurrencia y resiliencia;
12. rendimiento y recursos;
13. compatibilidad y despliegue.

Una categoría sólo puede quedar `PASS` o `WAIVED`. Un `WAIVED` exige riesgo, justificación,
responsable, fecha de caducidad y aprobación explícita. `PARTIAL`, `NOT_IMPLEMENTED`, `BLOCKED` o
una evidencia ausente impiden el despliegue externo.

La matriz con comandos, evidencia actual, brechas y plantilla de acta está en
[Pruebas obligatorias antes del despliegue](testing/PRE_DEPLOYMENT_TESTS.md).

## Puertas disponibles

```powershell
pnpm docs:validate
pnpm check
pnpm quality:regression
pnpm security:audit
pnpm deploy:validate
pnpm deploy:smoke
```

Estos comandos cubren una parte importante de la matriz, pero no sustituyen mutation testing,
fuzzing, propiedades/invariantes, contratos formales ni la validación real de contenedores y
staging mientras esas filas continúen incompletas.

## Fuentes detalladas

- [Estrategia de pruebas](testing/TEST_STRATEGY.md)
- [Puertas por fase](testing/QUALITY_GATES.md)
- [Pruebas obligatorias antes del despliegue](testing/PRE_DEPLOYMENT_TESTS.md)
- [Inventario de pruebas](../test/README.md)
- [Criterios de aceptación](requirements/ACCEPTANCE_CRITERIA.md)
