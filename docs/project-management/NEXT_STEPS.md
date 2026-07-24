# Próximos pasos

## Siguiente tarea exacta

**FR-PH03-TASK-006 - Modelar datos de lectura y sincronización**

### Objetivo de la próxima sesión

Implementar datos de lectura con propiedad, versionado e idempotencia.

### Orden de trabajo

1. Leer los archivos de gestión requeridos por el prompt maestro.
2. Crear ReadingProgress con anclaje estable.
3. Crear Favorite y VocabularyWord.
4. Crear DownloadRecord con clave idempotente.
5. Probar unicidad, propiedad y referencias de versión.
6. Completar FR-PH03-TASK-006 y crear la migración funcional.

## No hacer todavía

- No implementar autenticación ni autorización de Fase 4.
- No conectar credenciales, AWS ni servicios remotos.
- No crear `LICENSE` sin decisión del propietario.
- No usar credenciales ni servicios de AWS.

## Comando recomendado

```powershell
pnpm migrate
```
