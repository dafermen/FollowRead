# Próximos pasos

## Siguiente tarea exacta

**FR-PH04-TASK-007 - Aplicar autorización RBAC por permiso**

### Objetivo de la próxima sesión

Proteger cada acción administrativa con permisos de servidor y denegación por defecto.

### Orden de trabajo

1. Definir la matriz inicial de roles y permisos.
2. Crear dependencias para sesión activa y permiso explícito.
3. Aplicar denegación por defecto a acciones administrativas.
4. Probar permisos positivos/negativos, sesión revocada y usuario inactivo.
5. Continuar con auditoría y límite de intentos en FR-PH04-TASK-008.

## No hacer todavía

- No conectar credenciales, AWS ni servicios remotos.
- No almacenar tokens o contraseñas en logs ni almacenamiento web.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm check
```
