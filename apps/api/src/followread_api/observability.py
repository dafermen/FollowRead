import json
import logging
import re
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from threading import Lock
from time import perf_counter
from typing import Any
from uuid import uuid4

from fastapi import Request, Response
from fastapi.responses import JSONResponse

REQUEST_ID_HEADER = "X-Request-ID"
REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]{1,64}$")
LOG_FIELDS = ("request_id", "method", "path", "route", "status_code", "duration_ms")
logger = logging.getLogger("followread.api")


@dataclass(frozen=True)
class MetricsSnapshot:
    uptime_seconds: float
    requests_total: int
    errors_total: int
    average_duration_ms: float
    maximum_duration_ms: float
    status_codes: dict[int, int]
    routes: dict[str, int]


class RequestMetrics:
    def __init__(self) -> None:
        self._started_at = perf_counter()
        self._lock = Lock()
        self._requests_total = 0
        self._errors_total = 0
        self._duration_total_ms = 0.0
        self._maximum_duration_ms = 0.0
        self._status_codes: dict[int, int] = {}
        self._routes: dict[str, int] = {}

    def record(self, route: str, status_code: int, duration_ms: float) -> None:
        with self._lock:
            self._requests_total += 1
            if status_code >= 500:
                self._errors_total += 1
            self._duration_total_ms += duration_ms
            self._maximum_duration_ms = max(self._maximum_duration_ms, duration_ms)
            self._status_codes[status_code] = self._status_codes.get(status_code, 0) + 1
            self._routes[route] = self._routes.get(route, 0) + 1

    def snapshot(self) -> MetricsSnapshot:
        with self._lock:
            request_count = self._requests_total
            return MetricsSnapshot(
                uptime_seconds=round(perf_counter() - self._started_at, 3),
                requests_total=request_count,
                errors_total=self._errors_total,
                average_duration_ms=round(
                    self._duration_total_ms / request_count if request_count else 0.0,
                    3,
                ),
                maximum_duration_ms=round(self._maximum_duration_ms, 3),
                status_codes=dict(self._status_codes),
                routes=dict(self._routes),
            )

    def reset(self) -> None:
        with self._lock:
            self._started_at = perf_counter()
            self._requests_total = 0
            self._errors_total = 0
            self._duration_total_ms = 0.0
            self._maximum_duration_ms = 0.0
            self._status_codes.clear()
            self._routes.clear()


request_metrics = RequestMetrics()


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for field in LOG_FIELDS:
            if hasattr(record, field):
                payload[field] = getattr(record, field)
        if record.exc_info is not None:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, separators=(",", ":"), ensure_ascii=True)


def configure_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logger.handlers.clear()
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    logger.propagate = False


def resolve_request_id(candidate: str | None) -> str:
    if candidate is not None and REQUEST_ID_PATTERN.fullmatch(candidate) is not None:
        return candidate
    return uuid4().hex


async def request_observability(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    request_id = resolve_request_id(request.headers.get(REQUEST_ID_HEADER))
    request.state.request_id = request_id
    started_at = perf_counter()
    status_code = 500
    route = request.url.path
    try:
        response = await call_next(request)
        status_code = response.status_code
        route = _route_template(request)
    except Exception:
        duration_ms = _duration_ms(started_at)
        request_metrics.record(route, status_code, duration_ms)
        logger.exception(
            "request.failed",
            extra=_request_log_fields(
                request,
                request_id,
                route,
                status_code,
                duration_ms,
            ),
        )
        response = JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "internal_error",
                    "message": "An unexpected error occurred.",
                    "details": {"request_id": request_id},
                },
            },
        )
    else:
        duration_ms = _duration_ms(started_at)
        request_metrics.record(route, status_code, duration_ms)
        logger.info(
            "request.completed",
            extra=_request_log_fields(
                request,
                request_id,
                route,
                status_code,
                duration_ms,
            ),
        )
    response.headers[REQUEST_ID_HEADER] = request_id
    response.headers["Server-Timing"] = f'app;dur={duration_ms:.3f};desc="FollowRead API"'
    return response


async def response_security_policy(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"

    path = request.url.path
    if (
        request.method != "GET"
        or path.startswith(("/auth", "/admin", "/reader/sync"))
        or path in {"/health", "/ready", "/metrics", "/docs", "/openapi.json"}
    ):
        response.headers["Cache-Control"] = "no-store"
    elif path.startswith("/catalog"):
        response.headers.setdefault(
            "Cache-Control",
            "public, max-age=60, stale-while-revalidate=300",
        )
    return response


def render_prometheus_metrics(snapshot: MetricsSnapshot) -> str:
    lines = [
        "# HELP followread_uptime_seconds Process uptime in seconds.",
        "# TYPE followread_uptime_seconds gauge",
        f"followread_uptime_seconds {snapshot.uptime_seconds}",
        "# HELP followread_http_requests_total HTTP requests handled.",
        "# TYPE followread_http_requests_total counter",
        f"followread_http_requests_total {snapshot.requests_total}",
        "# HELP followread_http_errors_total HTTP responses with status 500 or greater.",
        "# TYPE followread_http_errors_total counter",
        f"followread_http_errors_total {snapshot.errors_total}",
        "# HELP followread_http_request_duration_ms Average request duration.",
        "# TYPE followread_http_request_duration_ms gauge",
        f"followread_http_request_duration_ms {snapshot.average_duration_ms}",
        "# HELP followread_http_request_duration_max_ms Maximum request duration.",
        "# TYPE followread_http_request_duration_max_ms gauge",
        f"followread_http_request_duration_max_ms {snapshot.maximum_duration_ms}",
    ]
    for status_code, count in sorted(snapshot.status_codes.items()):
        lines.append(
            f'followread_http_responses_total{{status="{status_code}"}} {count}',
        )
    for route, count in sorted(snapshot.routes.items()):
        safe_route = route.replace("\\", "\\\\").replace('"', '\\"')
        lines.append(
            f'followread_http_route_requests_total{{route="{safe_route}"}} {count}',
        )
    return "\n".join(lines) + "\n"


def _request_log_fields(
    request: Request,
    request_id: str,
    route: str,
    status_code: int,
    duration_ms: float,
) -> dict[str, str | int | float]:
    return {
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "route": route,
        "status_code": status_code,
        "duration_ms": duration_ms,
    }


def _duration_ms(started_at: float) -> float:
    return round((perf_counter() - started_at) * 1000, 3)


def _route_template(request: Request) -> str:
    route = request.scope.get("route")
    route_path = getattr(route, "path", None)
    return route_path if isinstance(route_path, str) else request.url.path
