import asyncio
from unittest.mock import Mock

from httpx import ASGITransport, AsyncClient
from sqlalchemy import Engine
from sqlalchemy.exc import OperationalError

from followread_api.api.routes.health import database_is_ready
from followread_api.database import create_database_engine, get_database_engine
from followread_api.main import create_app


def test_readiness_reports_database_success_and_failure() -> None:
    application = create_app()
    ready_engine = create_database_engine("sqlite:///:memory:")
    application.dependency_overrides[get_database_engine] = lambda: ready_engine

    async def request_ready() -> tuple[int, object]:
        transport = ASGITransport(app=application)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/ready")
        return response.status_code, response.json()

    status_code, payload = asyncio.run(request_ready())

    assert status_code == 200
    assert payload == {
        "service": "FollowRead API",
        "status": "ready",
        "checks": {"database": "ok"},
    }

    unavailable_engine = Mock(spec=Engine)
    unavailable_engine.connect.side_effect = OperationalError("SELECT 1", {}, Exception("offline"))
    application.dependency_overrides[get_database_engine] = lambda: unavailable_engine

    status_code, payload = asyncio.run(request_ready())

    assert status_code == 503
    assert payload == {
        "service": "FollowRead API",
        "status": "not_ready",
        "checks": {"database": "unavailable"},
    }
    assert not database_is_ready(unavailable_engine)
    ready_engine.dispose()


def test_openapi_exposes_operational_and_catalog_contracts() -> None:
    schema = create_app().openapi()

    assert {"/health", "/ready", "/catalog", "/catalog/{slug}"}.issubset(schema["paths"])
    assert schema["paths"]["/catalog"]["get"]["responses"]["200"]["content"]["application/json"][
        "schema"
    ]["$ref"].endswith("/CatalogPageResponse")
    assert schema["paths"]["/catalog/{slug}"]["get"]["responses"]["404"]["content"][
        "application/json"
    ]["schema"]["$ref"].endswith("/ErrorResponse")
    assert schema["paths"]["/ready"]["get"]["responses"]["503"]["content"]["application/json"][
        "schema"
    ]["$ref"].endswith("/ReadinessErrorResponse")
    assert "ContentDetailResponse" in schema["components"]["schemas"]
