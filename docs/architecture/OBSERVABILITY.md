# Observabilidad y resiliencia

## Alcance

FollowRead mantiene observabilidad local y compatible con infraestructura futura sin enviar datos
a terceros. La implementación no registra tokens, cookies, parámetros de consulta, texto leído,
vocabulario ni datos de menores.

## API

- Cada respuesta incluye `X-Request-ID`; un identificador externo sólo se conserva si cumple el
  formato seguro.
- Los logs son JSON por línea con fecha UTC, nivel, evento, método, ruta normalizada, estado y
  duración. Los errores inesperados conservan el detalle exclusivamente en el log del servidor.
- `Server-Timing` permite observar la duración de la API desde el navegador.
- `GET /metrics` expone contadores agregados, errores 5xx, duración media/máxima, estados y rutas
  normalizadas en formato Prometheus.
- `GET /health` confirma proceso y `GET /ready` confirma SQLite.

`/metrics` no contiene identificadores personales, pero en un despliegue público debe quedar
limitado a la red o plataforma de operaciones.

## Interfaces

Admin y Reader instalan manejadores de `error` y `unhandledrejection`, y tienen una barrera React
global. El reporte local sólo incluye aplicación, origen del fallo, fecha y ruta. La pantalla de
recuperación no muestra el detalle técnico y ofrece una recarga explícita.

## Alertas recomendadas para despliegue

| Señal | Umbral inicial |
|---|---:|
| Disponibilidad `/ready` | menor a 99.5% |
| Respuestas 5xx | mayor a 1% durante 5 minutos |
| Duración p95 | mayor a 750 ms durante 10 minutos |
| Errores frontend | mayor a 5 por minuto por aplicación |

Estos umbrales son iniciales. La Fase 13 debe configurarlos en la plataforma elegida y separar
desarrollo, staging y producción.

## Operación local

```powershell
Invoke-WebRequest http://localhost:8000/health
Invoke-WebRequest http://localhost:8000/ready
Invoke-WebRequest http://localhost:8000/metrics
```
