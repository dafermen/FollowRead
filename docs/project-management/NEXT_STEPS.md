# Próximos pasos

## Siguiente tarea exacta

**FR-PH13-TASK-012 - Validar Docker, GitHub y staging reales**

### Objetivo

Cerrar los gates externos que no pueden ejecutarse en la estación actual y dejar evidencia de una
entrega reproducible antes de cerrar la Fase 13.

### Orden de trabajo

1. Completar las filas parciales/no implementadas de `docs/testing/PRE_DEPLOYMENT_TESTS.md`.
2. Instalar o disponer de Docker y construir las imágenes de API, Admin y Reader.
3. Ejecutar `pnpm deploy:local` y `pnpm deploy:smoke`.
4. Confirmar `ci.yml` en el repositorio público `dafermen/FollowRead` y conservar la evidencia del
   runner real.
5. Elegir un proveedor y crear un entorno development o staging protegido.
6. Demostrar migración, backup, smoke y rollback; registrar URLs y evidencias sin secretos.
7. Registrar aceptación y actualizar `CURRENT_STATUS.md` antes de decidir el cierre de la fase.

## No hacer todavía

- No marcar Fase 13 completada sin ejecutar Docker y GitHub reales.
- No seleccionar ni crear cuentas en un proveedor cloud sin decisión del propietario.
- No incluir SQLite, secretos, `.env`, certificados ni credenciales en artefactos.
- No desplegar producción ni publicar en tiendas sin aprobación explícita.
- No omitir auditorías o regresiones para acelerar un pipeline.
- No ejecutar migraciones de producción sin backup, readiness y rollback.
- No interpretar `pnpm check` como sustituto de las trece categorías predespliegue.

## Gate externo conservado

TASK-011 quedó completada con `pnpm check`, regresión total, auditorías, 103 pruebas API, builds y
smoke local en verde. El remote GitHub ya está disponible; TASK-012 todavía requiere confirmar CI,
Docker y staging. La validación física de
iOS en macOS/Xcode sigue siendo obligatoria antes de TestFlight. Además, el gate de despliegue
requiere cerrar propiedades/invariantes, mutation testing, fuzzing, contratos y resiliencia.
