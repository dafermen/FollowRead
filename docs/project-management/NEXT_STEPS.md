# Próximos pasos

## Siguiente tarea exacta

**FR-PH03-TASK-012 - Auditar y cerrar Fase 3**

### Objetivo de la próxima sesión

Comprobar todos los criterios de salida y cerrar formalmente la Fase 3.

### Orden de trabajo

1. Leer los archivos de gestión requeridos por el prompt maestro.
2. Crear una base SQLite vacía y aplicar todas las migraciones.
3. Ejecutar la puerta completa y comprobar una sola cabeza Alembic.
4. Revisar modelo, integridad, repositorios, API, errores, logs y OpenAPI.
5. Registrar evidencia y pasar la tarea a `READY_FOR_REVIEW`.
6. Completar la tarea/fase sólo si los ocho criterios de salida pasan.

## No hacer todavía

- No implementar autenticación ni autorización de Fase 4.
- No conectar credenciales, AWS ni servicios remotos.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm migrate
```
