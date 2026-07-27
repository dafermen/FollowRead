import asyncio

import pytest
from httpx import ASGITransport, AsyncClient, Response
from pydantic import ValidationError

from followread_api.config import Settings
from followread_api.main import app, create_app


def test_health_reports_api_status_without_external_services() -> None:
    async def request_health() -> tuple[int, object]:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/health")
        return response.status_code, response.json()

    status_code, payload = asyncio.run(request_health())

    assert status_code == 200
    assert payload == {
        "service": "FollowRead API",
        "status": "ok",
        "version": "0.0.0",
        "environment": "development",
    }


def test_operational_endpoints_expose_safe_headers_metrics_and_compression() -> None:
    application = create_app()

    async def request_operations() -> tuple[Response, Response, Response]:
        transport = ASGITransport(app=application)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            health_response = await client.get("/health")
            openapi_response = await client.get(
                "/openapi.json",
                headers={"Accept-Encoding": "gzip"},
            )
            metrics_response = await client.get("/metrics")
        return health_response, openapi_response, metrics_response

    health_response, openapi_response, metrics_response = asyncio.run(request_operations())

    assert health_response.headers["Cache-Control"] == "no-store"
    assert health_response.headers["X-Content-Type-Options"] == "nosniff"
    assert health_response.headers["X-Frame-Options"] == "DENY"
    assert health_response.headers["Referrer-Policy"] == "no-referrer"
    assert "app;dur=" in health_response.headers["Server-Timing"]
    assert openapi_response.headers["Content-Encoding"] == "gzip"
    assert metrics_response.status_code == 200
    assert metrics_response.headers["Cache-Control"] == "no-store"
    assert "followread_http_requests_total" in metrics_response.text
    assert 'followread_http_route_requests_total{route="/health"}' in metrics_response.text


def test_settings_reject_invalid_environment_and_prefix() -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate({"environment": "preview"})

    with pytest.raises(ValidationError):
        Settings.model_validate({"api_prefix": "api"})

    with pytest.raises(ValidationError):
        Settings.model_validate(
            {"database_url": "postgresql://followread:secret@localhost/followread"}
        )
