import asyncio

import pytest
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError

from followread_api.config import Settings
from followread_api.main import app


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


def test_settings_reject_invalid_environment_and_prefix() -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate({"environment": "preview"})

    with pytest.raises(ValidationError):
        Settings.model_validate({"api_prefix": "api"})

    with pytest.raises(ValidationError):
        Settings.model_validate(
            {"database_url": "postgresql://followread:secret@localhost/followread"}
        )
