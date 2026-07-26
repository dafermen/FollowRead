# Estrategia inicial de despliegue

**Estado:** Validada para Fase 0 - FR-PH00-TASK-011 COMPLETED.
Los proveedores y comandos concretos se decidirán en fases de infraestructura.

## Entornos

| Entorno | Propósito | Datos/servicios |
|---|---|---|
| local | Desarrollo individual | Contenedores y adaptadores falsos |
| development | Integración continua del equipo | Recursos aislados de bajo costo |
| staging | Validación semejante a producción | Datos sintéticos, migraciones y rollback |
| production | Usuarios reales | Controles, backups y monitoreo |

## Unidades desplegables

- Admin web estático o servido, separado de Reader;
- Reader web/PWA;
- API FastAPI;
- worker de procesamiento cuando se agregue;
- archivo SQLite persistente del MVP;
- almacenamiento de objetos;
- apps móviles Reader a partir de Fase 10.

## Principios

- configuración por entorno;
- secretos en un almacén apropiado, nunca en artefactos;
- artefactos versionados e inmutables;
- migraciones revisadas y ejecutadas de forma controlada;
- despliegue API compatible con clientes anteriores razonables;
- contenido versionado independiente del build;
- rollback de aplicación no elimina datos ni contenido.

## Flujo futuro de entrega

1. lint, type-check y pruebas;
2. build reproducible;
3. análisis de seguridad;
4. publicación de artefactos;
5. despliegue a development;
6. migración y pruebas en staging;
7. aprobación;
8. despliegue production;
9. smoke tests y monitoreo;
10. rollback si fallan indicadores.

## Móvil

Reader web es la única fuente que Capacitor empaqueta. Permisos, plugins, iconos y configuraciones
nativas se versionan por plataforma. Contenido nuevo no obliga a publicar otra app.

Fase 10 dejó Android/iOS bajo `apps/reader`, recursos reproducibles, build Android debug y guías de
firma/publicación en `MOBILE_RELEASES.md`. La ejecución iOS final se realiza en macOS/Xcode antes de
TestFlight; firmas, cuentas y credenciales de tiendas siguen fuera del repositorio.

## Pendientes

- proveedor y regiones;
- alta disponibilidad, RTO y RPO;
- dominio, TLS y CDN;
- backup/restore de SQLite y futura migración a PostgreSQL;
- ciclo de vida S3;
- estrategia de migraciones sin interrupción;
- firma y cuentas de tiendas;
- observabilidad y alertas.

## Migraciones

- Toda migración se versiona y revisa.
- Primero se prueba con copia/datos sintéticos en staging.
- Cambios destructivos usan expansión/contracción: agregar, migrar, verificar y retirar después.
- La aplicación debe tolerar la versión anterior/nueva durante despliegue cuando aplique.
- Backup y restauración se prueban antes de una migración de alto riesgo.

## Rollback

1. Detener promoción y cambios incompatibles.
2. Revertir artefacto a una versión conocida.
3. No revertir esquema destructivamente sin plan probado.
4. Restaurar datos sólo con evidencia de corrupción y autorización.
5. Ejecutar smoke tests de Admin, Reader, API y catálogo.
6. Registrar incidente, impacto y decisión.

## Validación de entornos

- `local`: adaptadores falsos y datos sintéticos: PASS.
- `development`: integración compartida aislada: PASS.
- `staging`: migración, rollback y pruebas semejantes a producción: PASS.
- `production`: secretos, backups, observabilidad y aprobación: PASS.
- Despliegue de contenido independiente del build: PASS.
