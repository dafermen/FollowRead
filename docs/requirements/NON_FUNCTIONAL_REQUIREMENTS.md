# Requisitos no funcionales

**Estado del documento:** Validado para Fase 0 - FR-PH00-TASK-006 COMPLETED.  
Las metas son umbrales iniciales verificables; una decisión registrada puede ajustarlas con evidencia.

## Accesibilidad

| ID | Requisito | Prioridad | Meta | Fuente | Verificación |
|---|---|---|---|---|---|
| NFR-ACCESSIBILITY-001 | Admin y Reader cumplirán WCAG 2.2 AA en flujos MVP | Must | Cero defectos críticos; revisión manual de criterios aplicables | Prompt §22 | axe + auditoría |
| NFR-ACCESSIBILITY-002 | Toda acción principal funcionará con teclado | Must | 100% sin trampas y con foco visible | Prompt §22 | Manual/E2E |
| NFR-ACCESSIBILITY-003 | Controles tendrán nombre, estado y mensaje accesible | Must | 100% de controles críticos | Prompt §22 | Componentes |
| NFR-ACCESSIBILITY-004 | Objetivos táctiles serán adecuados | Must | 24x24 CSS px mínimo; 44x44 infantil | WCAG 2.2 / Prompt | Inspección |
| NFR-ACCESSIBILITY-005 | Movimiento y mano podrán reducirse u ocultarse | Must | 100% respeta preferencia y ajuste | Prompt §11/22 | Preferencias |
| NFR-ACCESSIBILITY-006 | Color no será el único indicador | Must | 100% de estados críticos con señal adicional | Prompt §22 | Visual/manual |

## Rendimiento y fiabilidad

| ID | Requisito | Prioridad | Meta | Fuente | Verificación |
|---|---|---|---|---|---|
| NFR-PERFORMANCE-001 | La reproducción responderá sin bloqueo perceptible | Must | Ninguna tarea UI >50 ms en control crítico | Prompt §22 | Perfil |
| NFR-PERFORMANCE-002 | Resolver palabra activa será eficiente | Must | p95 <2 ms con 10.000 marcas en referencia | Prompt §10/22 | Benchmark |
| NFR-PERFORMANCE-003 | Catálogo e imágenes usarán carga diferida | Should | Sin recursos fuera de vista salvo prefetch documentado | Prompt §22 | Red |
| NFR-PERFORMANCE-004 | El resaltado seguirá el reloj de audio | Must | Actualización visual <=150 ms p95 desde timestamp observado | FR-OV-002 | Integración |
| NFR-PERFORMANCE-005 | Contenido local abrirá rápidamente | Must | p75 <=2 s en dispositivo de referencia | Prompt §22 | E2E |
| NFR-RELIABILITY-001 | Progreso confirmado no se perderá silenciosamente | Must | 100% de escenarios de interrupción conserva o explica | Prompt §2 | Fallos |
| NFR-RELIABILITY-002 | Paquetes locales se activarán atómicamente | Must | Cero versiones parciales activas | Prompt §7 | Descarga cortada |
| NFR-RELIABILITY-003 | Reintentos serán idempotentes | Must | Mismo estado tras 3 reenvíos | Prompt §12 | Integración |
| NFR-AVAILABILITY-001 | Contenido descargado abrirá sin backend | Must | 100% del flujo crítico offline | Prompt §22 | E2E offline |
| NFR-AVAILABILITY-002 | Recuperación operativa tendrá objetivo | Should | RTO 4 h y RPO 24 h para MVP | Estrategia de despliegue | Simulación |

## Seguridad y privacidad

| ID | Requisito | Prioridad | Meta | Fuente | Verificación |
|---|---|---|---|---|---|
| NFR-SECURITY-001 | Ningún secreto se incluirá en cliente o Git | Must | Cero secretos detectados | Prompt §4/27 | Escaneo |
| NFR-SECURITY-002 | API validará todas las entradas | Must | 100% de endpoints con esquema/límites | Prompt §22 | Negativas |
| NFR-SECURITY-003 | Autorización se verificará en servidor | Must | Denegar por defecto; matriz completa | Prompt Fase 4 | Permisos |
| NFR-SECURITY-004 | Contraseñas usarán hash resistente | Must | Argon2id o estándar vigente documentado | Prompt Fase 4 | Config review |
| NFR-SECURITY-005 | CORS será restrictivo por entorno | Must | Sin wildcard con credenciales/producción | Prompt §22 | Config |
| NFR-SECURITY-006 | Eventos privilegiados serán auditables | Must | Actor, acción, objetivo, fecha y resultado | Prompt §13/22 | Auditoría |
| NFR-SECURITY-007 | Sesiones privilegiadas expirarán y podrán revocarse | Must | TTL y revocación probados | Prompt Fase 4 | Seguridad |
| NFR-PRIVACY-001 | Sólo se recopilarán datos con propósito | Must | 100% de campos en inventario | Prompt §22 | Revisión |
| NFR-PRIVACY-002 | MVP no almacenará PII de menores | Must | Cero campos/telemetría identificable infantil | FR-DEC-009 | Inventario/E2E |
| NFR-PRIVACY-003 | Eliminación/exportación se diseñará antes de cuentas Reader | Must | Flujos documentados antes de habilitar cuenta | Privacidad | Revisión |

## Mantenibilidad y compatibilidad

| ID | Requisito | Prioridad | Meta | Fuente | Verificación |
|---|---|---|---|---|---|
| NFR-MAINTAINABILITY-001 | TypeScript usará `strict` y evitará `any` | Must | Cero errores; excepciones justificadas | Prompt §25 | CI |
| NFR-MAINTAINABILITY-002 | Python usará type hints y capas claras | Must | Chequeo estático/revisión sin violación crítica | Prompt §25 | CI/review |
| NFR-MAINTAINABILITY-003 | Reader Engine no dependerá de React | Must | Cero imports prohibidos | Prompt §10 | Arquitectura |
| NFR-MAINTAINABILITY-004 | Decisiones/dependencias se documentarán | Must | 100% de cambios materiales con ADR/registro | Prompt §25 | PR |
| NFR-COMPATIBILITY-001 | Reader funcionará en navegadores modernos | Must | Últimas 2 versiones estables de Chrome, Edge, Firefox y Safari al release | Prompt §22 | Playwright/manual |
| NFR-COMPATIBILITY-002 | Reader soportará orientación y safe areas | Must | Cero controles críticos inaccesibles | Prompt §22/Fase 10 | Dispositivos |

## Operación y costos

| ID | Requisito | Prioridad | Meta | Fuente | Verificación |
|---|---|---|---|---|---|
| NFR-OBSERVABILITY-001 | API/trabajos emitirán logs estructurados | Must | Correlation ID en 100% del flujo sin datos sensibles | Prompt §22 | Inspección |
| NFR-OBSERVABILITY-002 | Health checks distinguirán vida/disponibilidad | Must | Endpoints con dependencias explícitas | Prompt Fase 3 | API |
| NFR-COST-001 | Procesamiento estimará costo y aplicará límites | Should | Límite obligatorio por entorno; exceso bloquea antes de AWS | Prompt Fase 6 | Adaptador falso |
| NFR-RECOVERY-001 | Despliegues/migraciones tendrán rollback | Must | Procedimiento probado en staging | Prompt Fase 13 | Simulación |
| NFR-STORAGE-001 | Paquetes tendrán límite configurable | Should | 250 MB por paquete por defecto; aviso desde 100 MB | Offline | Fixtures |

## Retención inicial

- auditoría privilegiada: 365 días como mínimo, configurable;
- trabajos de procesamiento y errores: 90 días después de terminar;
- borradores: hasta eliminación por editor o política organizacional;
- progreso/favoritos/vocabulario autenticado: hasta solicitud de eliminación;
- perfil local: hasta borrado de datos de la aplicación;
- temporales de descarga: limpieza inmediata o en siguiente inicio seguro.

## Validación

- Cada requisito tiene ID, prioridad, meta, fuente y verificación: PASS.
- Accesibilidad WCAG 2.2 AA tiene alcance y método: PASS.
- Rendimiento, offline, compatibilidad y recuperación tienen umbral: PASS.
- Seguridad, secretos, auditoría y privacidad infantil tienen estrategia verificable: PASS.
