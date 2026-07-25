# Próximos pasos

## Siguiente tarea exacta

**FR-PH04-TASK-008 - Añadir auditoría y límite de intentos**

### Objetivo de la próxima sesión

Limitar abuso de login y conservar evidencia útil sin registrar secretos.

### Orden de trabajo

1. Definir ventana, umbral y recuperación del límite de login.
2. Registrar éxito/fallo/bloqueo con identificadores internos, nunca contraseña o token.
3. Añadir correlación de solicitud a los eventos relevantes.
4. Probar ventana, desbloqueo, cuenta inexistente y redacción.
5. Continuar con la verificación de seguridad y OpenAPI.

## No hacer todavía

- No conectar credenciales, AWS ni servicios remotos.
- No almacenar tokens o contraseñas en logs ni almacenamiento web.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm check
```
