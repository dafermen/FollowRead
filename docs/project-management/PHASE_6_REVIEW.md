# Revisión de Fase 6

**Fase:** Integración de audio con Amazon Polly  
**Fecha:** 2026-07-25  
**Resultado:** PASS

## Criterios de salida

| Criterio | Evidencia | Estado |
|---|---|---|
| Cliente desacoplado y configurable | Adaptadores `fake` y `aws`, selección por entorno | PASS |
| Texto dividido de forma segura | `TextChunker` y pruebas de límites | PASS |
| Audio almacenado con integridad | almacenamiento local y checksum SHA-256 | PASS |
| Speech Marks procesados | tiempos, caracteres y párrafo persistidos | PASS |
| Sincronización validable | marcas ordenadas y vinculadas a estructura editorial | PASS |
| Costos controlados | estimación previa y límite configurable | PASS |
| Errores y reintentos | diagnóstico persistido, tres intentos y reintento manual | PASS |
| Experiencia administrativa | progreso, voz, idioma, costo, cancelación y diagnóstico | PASS |
| Seguridad | sesión, permiso, origen, CSRF e idempotencia | PASS |
| Pruebas sin AWS real | cliente AWS simulado y adaptador local predeterminado | PASS |

## Validación

- puerta rápida del monorepo en verde;
- 12 pruebas de Admin;
- 91 pruebas de API;
- cobertura backend de 100%;
- lint y tipos estáticos en verde;
- compilación de aplicaciones pendiente de la puerta final de integración.

## Restricción consciente del MVP

No se instala ni configura una cuenta AWS. El límite real está preparado y probado con un cliente
simulado; activarlo requiere `boto3`, credenciales gestionadas externamente y
`FOLLOWREAD_POLLY_PROVIDER=aws`. Esta restricción elimina costo y dependencia de red en el MVP sin
cambiar el contrato de procesamiento.
