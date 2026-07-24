import asyncio

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from followread_api.services import ContentNotFoundError, DomainError, ErrorCode


def test_domain_error_handler_returns_stable_http_contract() -> None:
    from followread_api.main import create_app

    application = create_app()

    @application.get("/test-domain-error")
    def raise_domain_error() -> None:
        raise ContentNotFoundError("missing-story")

    async def request_error() -> tuple[int, object]:
        transport = ASGITransport(app=application)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/test-domain-error")
        return response.status_code, response.json()

    status_code, payload = asyncio.run(request_error())

    assert status_code == 404
    assert payload == {
        "error": {
            "code": "content.not_found",
            "message": "The requested content is not available.",
            "details": {"slug": "missing-story"},
        },
    }


def test_domain_error_supports_empty_details_and_invalid_query_maps_to_422() -> None:
    from followread_api.api.errors import domain_error_handler

    error = DomainError(ErrorCode.INVALID_CATALOG_QUERY, "Invalid")
    request = object()

    response = asyncio.run(domain_error_handler(request, error))  # type: ignore[arg-type]

    assert response.status_code == 422
    assert response.body == (
        b'{"error":{"code":"catalog.invalid_query","message":"Invalid","details":{}}}'
    )


def test_error_schema_is_registered_on_plain_fastapi_apps() -> None:
    from followread_api.api.errors import ErrorResponse

    application = FastAPI()
    schema = ErrorResponse.model_json_schema()

    assert application.title == "FastAPI"
    assert schema["properties"]["error"]["description"] == "Stable, machine-readable error"
