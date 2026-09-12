import asyncio
import json
from unittest.mock import patch

from httpx import ASGITransport, AsyncClient

from followread_api.config import Settings
from followread_api.main import create_app
from followread_api.observability import logger, request_metrics


def test_unknown_paths_cannot_grow_metric_labels_or_leak_identifiers() -> None:
    application = create_app()
    request_metrics.reset()

    async def exercise() -> None:
        async with AsyncClient(
            transport=ASGITransport(app=application), base_url="http://test"
        ) as client:
            for index in range(50):
                response = await client.get(f"/private-identifier-{index}")
                assert response.status_code == 404

    with patch.object(logger, "info") as logged:
        asyncio.run(exercise())
    assert request_metrics.snapshot().routes == {"unmatched": 50}
    assert "private-identifier" not in str(logged.call_args_list)


def test_exception_details_are_not_logged_or_sent_to_the_browser() -> None:
    application = create_app()

    @application.get("/failure")
    def failure() -> None:
        raise RuntimeError("credential-and-content-must-not-leak")

    async def exercise() -> None:
        transport = ASGITransport(app=application, raise_app_exceptions=False)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/failure")
            assert response.status_code == 500
            assert "credential-and-content" not in json.dumps(response.json())

    with patch.object(logger, "error") as logged:
        asyncio.run(exercise())
    assert "credential-and-content" not in str(logged.call_args_list)
    assert not logged.call_args.kwargs.get("exc_info")


def test_production_does_not_expose_interactive_api_documentation() -> None:
    with patch("followread_api.main.get_settings", return_value=Settings(environment="production")):
        application = create_app()

    async def exercise() -> None:
        async with AsyncClient(
            transport=ASGITransport(app=application), base_url="http://test"
        ) as client:
            for path in ("/docs", "/openapi.json"):
                assert (await client.get(path)).status_code == 404

    asyncio.run(exercise())


def test_private_responses_remain_uncacheable_behind_api_prefix() -> None:
    application = create_app()

    async def exercise() -> None:
        transport = ASGITransport(app=application, root_path="/api")
        async with AsyncClient(transport=transport, base_url="https://test") as client:
            response = await client.get("/api/auth/session")
            assert response.status_code == 401
            assert response.headers["cache-control"] == "no-store"

    asyncio.run(exercise())
