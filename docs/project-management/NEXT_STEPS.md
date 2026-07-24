# Próximos pasos

## Siguiente tarea exacta

**FR-PH02-TASK-007 - Preparar Docker y PostgreSQL local**

### Objetivo de la próxima sesión

Desbloquear Docker y preparar PostgreSQL local reproducible.

### Orden de trabajo

1. Leer los archivos de gestión requeridos por el prompt maestro.
2. Confirmar que Docker Desktop está instalado e iniciado.
3. Ejecutar `docker --version` y `docker compose version`.
4. Ejecutar `docker compose config`.
5. Levantar `postgres` y confirmar el estado `healthy`.
6. Resolver FR-ISSUE-005 y completar FR-PH02-TASK-007.

## No hacer todavía

- No implementar funcionalidad de producto.
- No conectar credenciales, AWS ni servicios remotos.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
docker compose up -d postgres
```
