# Próximos pasos

## Siguiente tarea exacta

**FR-PH13-TASK-001 - Descomponer y activar la Fase 13**

### Objetivo

Convertir CI/CD y despliegue del prompt maestro en una secuencia segura para validar, empaquetar y
entregar API, Admin, Reader web/PWA y aplicaciones móviles.

### Orden de trabajo

1. Revisar el workflow base y definir ambientes, artefactos y gates.
2. Diseñar despliegue reproducible de API SQLite, Admin y Reader sin inventar proveedor.
3. Separar entrega web de publicación Android/iOS y conservar el gate físico iOS.
4. Definir secretos, migraciones, backups, rollback, observabilidad y aprobaciones.
5. Activar únicamente la primera tarea implementable.

## No hacer todavía

- No seleccionar ni crear cuentas en un proveedor cloud sin decisión del propietario.
- No incluir SQLite, secretos, `.env`, certificados ni credenciales en artefactos.
- No desplegar producción ni publicar en tiendas sin aprobación explícita.
- No omitir auditorías o regresiones para acelerar un pipeline.
- No ejecutar migraciones de producción sin backup, readiness y rollback.

## Gate externo conservado

La validación física de iOS en macOS/Xcode sigue siendo obligatoria antes de TestFlight, pero no
bloquea la publicación iOS de Fase 13.
