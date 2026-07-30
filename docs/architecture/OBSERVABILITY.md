# Observability and resilience

## Scope

FollowRead maintains local observability and is compatible with future infrastructure without sending data to third parties. The implementation does not log tokens, cookies, query parameters, read text, vocabulary, or data of minors.

## API

- Each response includes `X-Request-ID`; an external identifier is only retained if it meets the secure format.
- Logs are JSON Lines with UTC date, level, event, method, normalized route, status, and duration. Unexpected errors keep details exclusively in the server log.
- `Server-Timing` allows observing API duration from the browser.
- `GET /metrics` exposes aggregated counters, 5xx errors, average/max duration, statuses, and normalized routes in Prometheus format.
- `GET /health` confirms process and `GET /ready` confirms SQLite.

`/metrics` does not contain personal identifiers, but in a public deployment it must be limited to the operations network or platform.

## Interfaces

Admin and Reader install handlers for `error` and `unhandledrejection`, and have a global React boundary. The local report includes only application, failure origin, date, and route. The recovery screen does not show technical detail and offers an explicit reload.

## Recommended alerts for deployment

| Signal | Initial threshold |
|---|---:|
| Availability `/ready` | below 99.5% |
| 5xx responses | greater than 1% for 5 minutes |
| p95 duration | greater than 750 ms for 10 minutes |
| Frontend errors | greater than 5 per minute per application |

These thresholds are initial. Phase 13 should configure them in the chosen platform and separate development, staging, and production.

## Local operation

```powershell
Invoke-WebRequest http://localhost:8000/health
Invoke-WebRequest http://localhost:8000/ready
Invoke-WebRequest http://localhost:8000/metrics
```
