# Contribuir a FollowRead

## Antes de comenzar

1. Leer `AGENTS.md`, `CURRENT_STATUS.md` y `docs/project-management/NEXT_STEPS.md`.
2. Confirmar que la tarea está dentro de la fase activa.
3. Ejecutar `pnpm setup` y `pnpm check`.
4. No añadir secretos, datos personales ni servicios externos obligatorios.

## Cambios

- mantener pruebas cerca del código cuando sean unitarias;
- usar `test/` como inventario y para fixtures transversales;
- actualizar los documentos canónicos y la fuente detallada correspondiente;
- registrar decisiones arquitectónicas en `docs/adr/` y en el log canónico de decisiones;
- usar commits descriptivos y mantener el árbol limpio;
- no reducir cobertura o puertas para hacer pasar una entrega.

## Validación

Todo cambio debe pasar:

```powershell
pnpm docs:validate
pnpm check
```

Los cambios críticos también deben pasar `pnpm quality:regression`. Antes de cualquier despliegue
externo se aplica, sin omisiones silenciosas, la matriz de
[`docs/testing/PRE_DEPLOYMENT_TESTS.md`](docs/testing/PRE_DEPLOYMENT_TESTS.md).

## Pull requests

La descripción debe incluir alcance, riesgo, pruebas, documentación, migraciones, seguridad y plan
de rollback. Una excepción de pruebas requiere riesgo registrado y aprobación explícita.
