# Próximos pasos

## Siguiente tarea exacta

**FR-PH04-TASK-002 - Modelar credenciales y sesiones revocables**

### Objetivo de la próxima sesión

Materializar FR-DEC-014 sin implementar todavía login ni cookies.

### Orden de trabajo

1. Leer los archivos de gestión requeridos por el prompt maestro.
2. Añadir `UserCredential` uno a uno con `User`.
3. Añadir `UserSession` con hash único, expiración y revocación.
4. Crear y revisar la migración Alembic.
5. Probar integridad, expiración lógica y downgrade/upgrade.
6. Completar tarea e iniciar primitivas criptográficas.

## No hacer todavía

- No implementar autenticación ni autorización de Fase 4.
- No conectar credenciales, AWS ni servicios remotos.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm check
```
