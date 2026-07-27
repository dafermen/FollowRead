# Próximos pasos

## Siguiente tarea exacta

**FR-PH13-TASK-012 - Validar Docker, GitHub y staging reales**

### Objetivo

Cerrar los gates externos que no pueden ejecutarse en la estación actual y dejar evidencia de una
entrega reproducible antes de cerrar la Fase 13.

### Orden de trabajo

1. Instalar o disponer de Docker y construir las imágenes de API, Admin y Reader.
2. Ejecutar `pnpm deploy:local` y `pnpm deploy:smoke`.
3. Conectar un remote GitHub y comprobar `ci.yml` en un runner real.
4. Elegir un proveedor y crear un entorno development o staging protegido.
5. Demostrar migración, backup, smoke y rollback; registrar URLs y evidencias sin secretos.
6. Actualizar `CURRENT_STATUS.md` y decidir el cierre de la Fase 13.

## No hacer todavía

- No marcar Fase 13 completada sin ejecutar Docker y GitHub reales.
- No seleccionar ni crear cuentas en un proveedor cloud sin decisión del propietario.
- No incluir SQLite, secretos, `.env`, certificados ni credenciales en artefactos.
- No desplegar producción ni publicar en tiendas sin aprobación explícita.
- No omitir auditorías o regresiones para acelerar un pipeline.
- No ejecutar migraciones de producción sin backup, readiness y rollback.

## Gate externo conservado

TASK-011 quedó completada con `pnpm check`, regresión total, auditorías, 103 pruebas API, builds y
smoke local en verde. TASK-012 requiere Docker, remote GitHub y staging. La validación física de
iOS en macOS/Xcode sigue siendo obligatoria antes de TestFlight.
