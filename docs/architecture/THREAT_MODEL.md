# Modelo inicial de amenazas

**Estado:** Validado para Fase 0  
**Tarea responsable:** FR-PH00-TASK-006 - COMPLETED

## Método

Análisis STRIDE ligero sobre límites de confianza. Se refinará cuando existan diagramas de despliegue,
endpoints y almacenamiento concretos.

## Límites

1. Navegador/dispositivo -> Admin o Reader.
2. Admin/Reader -> API pública.
3. API -> archivo SQLite local.
4. API/worker -> Polly y S3.
5. Reader -> almacenamiento local modificable.
6. Pipeline de build -> artefactos desplegados.

## Amenazas y controles

| ID | Categoría | Escenario | Impacto | Control requerido | Prueba |
|---|---|---|---|---|---|
| FR-THREAT-001 | Spoofing | Sesión Admin robada | Publicación no autorizada | TLS, TTL, revocación, hash seguro | Seguridad |
| FR-THREAT-002 | Tampering | Paquete local alterado | Texto/audio incorrecto | Checksum/manifiesto/inmutabilidad | E2E corrupto |
| FR-THREAT-003 | Repudiation | Usuario niega publicación | Pérdida de trazabilidad | Auditoría actor/fecha/resultado | Integración |
| FR-THREAT-004 | Information disclosure | Secreto AWS en bundle/log | Compromiso cloud | Backend only, redacción, escaneo | Build/security |
| FR-THREAT-005 | Denial of service | Abuso de Polly | Costo/indisponibilidad | Permiso, cuota, límite, cola | Adaptador falso |
| FR-THREAT-006 | Elevation | Reviewer publica sin permiso | Contenido inválido | Autorización servidor | Matriz de permisos |
| FR-THREAT-007 | IDOR | Lee progreso/vocabulario ajeno | Privacidad | Propiedad por recurso | API negativa |
| FR-THREAT-008 | Injection | Texto/metadatos maliciosos | Datos/cliente | Validación, parametrización, escape | Negativas |
| FR-THREAT-009 | Supply chain | Dependencia comprometida | Build/usuarios | Lockfile, review, escaneo | CI |
| FR-THREAT-010 | Privacy | Telemetría identifica menor | Riesgo legal/daño | FR-DEC-009 y DATA_POLICY | Inventario |
| FR-THREAT-011 | Replay | Reenvío duplica trabajo | Costo/estado incoherente | Clave idempotente | Integración |
| FR-THREAT-012 | Tampering | Transición de estado salteada | Publicación defectuosa | Máquina de estados servidor | Unit/API |

## Severidad prioritaria

Critical/High antes de producción: secretos, autorización de publicación, PII infantil, IDOR, abuso de
procesamiento e integridad de paquetes.

## Criterios de salida futuros

- Ninguna amenaza High sin control y prueba asignada.
- Matriz rol-permiso revisada.
- Inventario de datos coincide con modelos.
- Escaneo de secretos/dependencias en CI.
- Respuesta a incidentes y rotación de secretos documentadas.
