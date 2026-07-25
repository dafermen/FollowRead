# Próximos pasos

## Siguiente tarea exacta

**FR-PH04-TASK-005 - Exponer login, logout y sesión actual**

### Objetivo de la próxima sesión

Crear contratos de sesión seguros sobre los modelos y primitivas ya validados.

### Orden de trabajo

1. Implementar el servicio de autenticación sin enumerar cuentas.
2. Emitir sesiones con inactividad de 30 minutos y máximo absoluto de 8 horas.
3. Exponer login, logout y sesión actual.
4. Probar éxito, credencial inválida, expiración, revocación y repetición de logout.
5. Continuar con cookie, CSRF, origen, caché y CORS en FR-PH04-TASK-006.

## No hacer todavía

- No conectar credenciales, AWS ni servicios remotos.
- No almacenar tokens o contraseñas en logs ni almacenamiento web.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm check
```
