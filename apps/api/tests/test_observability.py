import asyncio
import json
import logging
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient

from followread_api.main import create_app
from followread_api.observability import (
    JsonFormatter,
    RequestMetrics,
    logger,
    render_prometheus_metrics,
)


def test_request_id_is_preserved_and_log_is_structured() -> None:
    application = create_app()

    async def request_health() -> tuple[int, str]:
        transport = ASGITransport(app=application)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(
                "/health?secret=not-logged",
                headers={"X-Request-ID": "reader.test-123"},
            )
        return response.status_code, response.headers["X-Request-ID"]

    with patch.object(logger, "info") as log_info:
        status_code, request_id = asyncio.run(request_health())

    assert status_code == 200
    assert request_id == "reader.test-123"
    log_info.assert_called_once()
    assert log_info.call_args.args == ("request.completed",)
    fields = log_info.call_args.kwargs["extra"]
    assert fields["request_id"] == request_id
    assert fields["method"] == "GET"
    assert fields["path"] == "/health"
    assert fields["status_code"] == 200
    assert isinstance(fields["duration_ms"], float)
    assert "secret" not in json.dumps(fields)


def test_invalid_request_id_is_replaced_and_unexpected_error_is_safe() -> None:
    application = create_app()

    @application.get("/test-unexpected-error")
    def raise_unexpected_error() -> None:
        raise RuntimeError("sensitive database detail")

    async def request_failure() -> tuple[int, dict[str, object], str]:
        transport = ASGITransport(app=application, raise_app_exceptions=False)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get(
                "/test-unexpected-error",
                headers={"X-Request-ID": "invalid request id"},
            )
        return response.status_code, response.json(), response.headers["X-Request-ID"]

    status_code, payload, request_id = asyncio.run(request_failure())

    assert status_code == 500
    assert len(request_id) == 32
    assert request_id != "invalid request id"
    assert payload == {
        "error": {
            "code": "internal_error",
            "message": "An unexpected error occurred.",
            "details": {"request_id": request_id},
        },
    }
    assert "sensitive database detail" not in json.dumps(payload)


def test_json_formatter_omits_request_fields_when_they_are_not_present() -> None:
    record = logging.LogRecord(
        name="followread.test",
        level=logging.WARNING,
        pathname=__file__,
        lineno=1,
        msg="plain.event",
        args=(),
        exc_info=None,
    )

    payload = json.loads(JsonFormatter().format(record))

    assert payload["level"] == "WARNING"
    assert payload["message"] == "plain.event"
    assert "request_id" not in payload

    record.request_id = "request-1"
    record.method = "GET"
    record.path = "/health"
    record.status_code = 200
    record.duration_ms = 1.25
    payload = json.loads(JsonFormatter().format(record))

    assert payload["request_id"] == "request-1"
    assert payload["duration_ms"] == 1.25


def test_request_metrics_are_aggregate_and_prometheus_compatible() -> None:
    metrics = RequestMetrics()
    metrics.record("/catalog/{slug}", 200, 12.5)
    metrics.record("/catalog/{slug}", 503, 25.0)

    snapshot = metrics.snapshot()
    rendered = render_prometheus_metrics(snapshot)

    assert snapshot.requests_total == 2
    assert snapshot.errors_total == 1
    assert snapshot.average_duration_ms == 18.75
    assert snapshot.maximum_duration_ms == 25.0
    assert snapshot.routes == {"/catalog/{slug}": 2}
    assert 'followread_http_responses_total{status="503"} 1' in rendered
    assert 'followread_http_route_requests_total{route="/catalog/{slug}"} 2' in rendered
