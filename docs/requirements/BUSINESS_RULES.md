# Reglas de negocio

**Estado:** Validado para Fase 0 - FR-PH00-TASK-005 COMPLETED.

| ID | Regla | Fuente | Verificación |
|---|---|---|---|
| FR-BR-001 | Sólo `published` aparece en el catálogo público | Prompt §13 | Consulta por cada estado |
| FR-BR-002 | Cada publicación referencia una versión inmutable | Prompt §7/13 | Intento de edición rechazado |
| FR-BR-003 | Una corrección publicada crea otra versión | Prompt §6/7 | Versionado incremental |
| FR-BR-004 | Toda transición se valida y audita | Prompt §13 | Matriz válida/inválida |
| FR-BR-005 | Sólo permisos explícitos aprueban o publican | Prompt Fase 4 | Casos por rol |
| FR-BR-006 | Audio y marcas pertenecen a la misma versión/idioma del texto | Prompt §12 | Integridad referencial |
| FR-BR-007 | Checksum inválido nunca reemplaza copia local válida | Prompt §7 | Corrupción simulada |
| FR-BR-008 | Una falla de actualización no bloquea contenido local válido | Prompt §7 | Interrupción E2E |
| FR-BR-009 | Progreso se identifica por perfil/cuenta, contenido, versión y anclaje | Prompt §2/10 | Guardar/recuperar |
| FR-BR-010 | Una actualización intenta migrar progreso por anclaje estable | Prompt §7 | Versión compatible |
| FR-BR-011 | Mano y animaciones son opcionales | Prompt §9/11 | Preferencias y reduced motion |
| FR-BR-012 | Reader y Admin no reciben credenciales AWS | Prompt §4/12 | Escaneo y arquitectura |
| FR-BR-013 | Automatización no invoca AWS real | Prompt Fase 6 | Adaptadores falsos |
| FR-BR-014 | Idiomas iniciales son inglés y español | Prompt §8 | Enum/validación |
| FR-BR-015 | Niveles iniciales usan el enum definido en §8 | Prompt §8 | Enum/validación |
| FR-BR-016 | Tipos son `story`, `article`, `book`, `lesson`; documento usa `article` | Prompt §8; FR-DEC-007 | Contrato de tipo |
| FR-BR-017 | Traducción esencial publicada es editorial y versionada | FR-DEC-008 | Revisión/publicación |
| FR-BR-018 | MVP infantil no crea cuenta personal ni PII de menor | FR-DEC-009 | Inventario de datos |
| FR-BR-019 | Un trabajo de procesamiento usa clave idempotente | Prompt §12 | Reenvío no duplica |
| FR-BR-020 | Publicación requiere procesamiento/revisión válidos | Prompt §12/13 | Transición rechazada |
| FR-BR-021 | Un paquete incompatible no se activa | Prompt §7 | Versión mínima mayor |
| FR-BR-022 | Eliminación local no elimina progreso remoto autorizado | Prompt Fase 9 | Flujo de eliminación |
| FR-BR-023 | Sincronización repetida produce el mismo estado | Prompt Fase 9 | Reenvío de operaciones |
| FR-BR-024 | Errores de usuario no exponen secretos ni detalles internos | Prompt §22/27 | Pruebas de respuesta |
| FR-BR-025 | Notas libres quedan fuera del MVP | FR-DEC-010 | Revisión de alcance |

## Máquina de estados propuesta

```text
draft
  -> ready_for_processing
  -> processing
     -> processing_failed -> ready_for_processing
     -> ready_for_review
        -> review_rejected -> draft
        -> approved
           -> published
              -> unpublished -> published
              -> archived
           -> archived
draft -> archived
```

Toda transición no dibujada se considera inválida hasta que una decisión registrada la autorice.

## Condiciones de publicación

Una versión sólo puede publicarse si:

1. tiene contenido estructurado y metadatos obligatorios;
2. sus idiomas declarados tienen recursos coherentes;
3. audio y marcas fueron validados cuando la narración aplica;
4. portada/recursos requeridos son accesibles;
5. compatibilidad y checksum fueron calculados;
6. un actor con permiso la aprobó;
7. la transición queda auditada.

## Resolución inicial de progreso

- Mayor `updatedAt` no gana automáticamente si representa una posición anterior.
- Operaciones llevan ID idempotente.
- El cliente conserva una copia pendiente hasta confirmación.
- Una política definitiva de conflicto se aprobará antes de Fase 9.

## Validación

- Reglas de publicación, versión, integridad, permisos y progreso: PASS.
- Cada regla tiene fuente y verificación: PASS.
