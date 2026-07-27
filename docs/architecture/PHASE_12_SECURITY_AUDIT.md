# Auditoría de seguridad de Fase 12

**Fecha:** 2026-07-26
**Resultado:** PASS

## Controles verificados

- errores inesperados devuelven un contrato estable y un `request_id`, sin detalles internos;
- logs y métricas usan rutas normalizadas y no incluyen query strings, cuerpos, cookies ni tokens;
- autenticación, administración, sincronización y operaciones no GET usan `Cache-Control: no-store`;
- catálogo público usa caché corta y los paquetes soportan `ETag`/`If-None-Match`;
- la API entrega `nosniff`, denegación de frames, referrer restrictivo, permissions policy y
  resource policy;
- CORS conserva orígenes explícitos, credenciales y métodos limitados;
- GZip sólo comprime respuestas suficientemente grandes;
- la barrera frontend no imprime el mensaje privado del error en el reporte estructurado;
- SQLite continúa siendo propiedad exclusiva de la API.

## Dependencias

La primera ejecución encontró 17 avisos JavaScript transitivos en herramientas de desarrollo de
Capacitor y seis avisos en el `pip` del entorno. Se aplicaron overrides mínimos y verificables para
`tar`, `minimatch`, `brace-expansion` y `uuid`; `pip` se fija en una versión corregida durante el
setup. La generación de assets móviles siguió funcionando después del cambio.

Resultados finales:

```text
pnpm audit --audit-level moderate
No known vulnerabilities found

pnpm security:audit:python
No known vulnerabilities found
```

`pip-audit` omite el paquete editable local `followread-api` porque no está publicado en PyPI; sí
audita todas sus dependencias instaladas.

## Comando reproducible

```powershell
pnpm security:audit
```

La auditoría consulta bases externas y debe ejecutarse periódicamente y en CI. Un resultado futuro
no debe silenciarse mediante excepciones sin fecha, responsable y mitigación.
