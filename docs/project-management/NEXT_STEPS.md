# Próximos pasos

## Siguiente tarea exacta

**FR-PH03-TASK-011 - Añadir logging, readiness y OpenAPI verificable**

### Objetivo de la próxima sesión

Completar la base operativa de la API y verificar su contrato generado.

### Orden de trabajo

1. Leer los archivos de gestión requeridos por el prompt maestro.
2. Añadir identificador de solicitud y logs JSON seguros.
3. Exponer readiness separado de liveness y comprobar SQLite.
4. Verificar rutas, schemas y errores en OpenAPI.
5. Probar éxito, fallo y propagación de request ID.
6. Completar FR-PH03-TASK-011 e iniciar auditoría de fase.

## No hacer todavía

- No implementar autenticación ni autorización de Fase 4.
- No conectar credenciales, AWS ni servicios remotos.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm migrate
```
