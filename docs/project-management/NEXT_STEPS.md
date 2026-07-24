# Próximos pasos

## Siguiente tarea exacta

**FR-PH03-TASK-010 - Exponer catálogo y contenido por API**

### Objetivo de la próxima sesión

Crear el primer contrato HTTP del catálogo público sobre servicios y repositorios.

### Orden de trabajo

1. Leer los archivos de gestión requeridos por el prompt maestro.
2. Crear schemas de lista, resumen y detalle editorial.
3. Inyectar sesión/repositorio/servicio sin commits en rutas.
4. Exponer lista paginada con filtros y detalle por slug.
5. Probar 200, 404, 422, filtros y exclusión de borradores.
6. Completar FR-PH03-TASK-010 e iniciar observabilidad.

## No hacer todavía

- No implementar autenticación ni autorización de Fase 4.
- No conectar credenciales, AWS ni servicios remotos.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm migrate
```
