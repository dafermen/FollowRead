# Próximos pasos

## Siguiente tarea exacta

**Completar FR-PH05-TASK-003 - Acceso y sesión en Admin**

### Objetivo de la próxima sesión

Convertir el acceso visual actual en un flujo completo que restaure y cierre sesiones de forma segura.

### Orden de trabajo

1. Consultar `/auth/session` al iniciar y conservar sólo identidad y permisos en memoria.
2. Aplicar los permisos del servidor a la navegación y acciones visibles.
3. Implementar logout enviando el token CSRF de la cookie.
4. Probar sesión válida, expirada, acceso denegado y salida.

## No hacer todavía

- No almacenar tokens o contraseñas en logs ni almacenamiento web.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm check
```
