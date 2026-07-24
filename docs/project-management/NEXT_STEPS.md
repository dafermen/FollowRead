# Próximos pasos

## Siguiente tarea exacta

**FR-PH03-TASK-005 - Modelar identidad, roles y permisos sin autenticación**

### Objetivo de la próxima sesión

Implementar identidad y RBAC persistentes sin adelantar login, tokens ni contraseñas.

### Orden de trabajo

1. Leer los archivos de gestión requeridos por el prompt maestro.
2. Crear User y Administrator con relación uno a uno.
3. Crear Role y Permission.
4. Crear asociaciones normalizadas de RBAC.
5. Probar unicidad, asociaciones y borrado restringido.
6. Completar FR-PH03-TASK-005 y continuar con datos de lectura.

## No hacer todavía

- No implementar autenticación ni autorización de Fase 4.
- No conectar credenciales, AWS ni servicios remotos.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm migrate
```
