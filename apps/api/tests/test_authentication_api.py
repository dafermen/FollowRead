import asyncio
from collections.abc import Generator

from fastapi import Response
from httpx import ASGITransport, AsyncClient
from sqlalchemy import Engine
from sqlalchemy.orm import Session

from followread_api.api.routes import authentication
from followread_api.config import Settings
from followread_api.database import (
    create_database_engine,
    create_session_factory,
    get_database_session,
)
from followread_api.main import create_app
from followread_api.models import Base
from followread_api.services import bootstrap_superadmin

PASSWORD = "a sufficiently long password"
TRUSTED_ORIGIN = "http://localhost:5173"


def build_auth_client() -> tuple[AsyncClient, Engine]:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = create_session_factory(engine)
    with session_factory() as session:
        bootstrap_superadmin(
            session,
            email="admin@example.com",
            display_name="FollowRead Owner",
            password=PASSWORD,
        )
        session.commit()

    def override_session() -> Generator[Session, None, None]:
        with session_factory() as session:
            yield session

    application = create_app()
    application.dependency_overrides[get_database_session] = override_session
    return (
        AsyncClient(
            transport=ASGITransport(app=application),
            base_url="http://test",
        ),
        engine,
    )


def test_authentication_api_login_current_logout_and_repeat() -> None:
    async def exercise() -> None:
        client, engine = build_auth_client()
        try:
            async with client:
                login = await client.post(
                    "/auth/login",
                    json={"email": "admin@example.com", "password": PASSWORD},
                    headers={"Origin": TRUSTED_ORIGIN},
                )
                assert login.status_code == 200
                assert login.headers["cache-control"] == "no-store"
                assert login.json()["user"]["email"] == "admin@example.com"
                assert "session_token" not in login.text
                assert "csrf_token" not in login.text
                set_cookie = login.headers.get_list("set-cookie")
                assert any(
                    "followread_session=" in value
                    and "HttpOnly" in value
                    and "SameSite=strict" in value
                    for value in set_cookie
                )
                assert any(
                    "followread_csrf=" in value and "HttpOnly" not in value for value in set_cookie
                )

                current = await client.get("/auth/session")
                assert current.status_code == 200
                assert current.json()["user"]["display_name"] == "FollowRead Owner"

                csrf_token = client.cookies.get("followread_csrf")
                assert csrf_token is not None
                logout = await client.post(
                    "/auth/logout",
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": csrf_token},
                )
                assert logout.status_code == 204
                repeated = await client.post(
                    "/auth/logout",
                    headers={"Origin": TRUSTED_ORIGIN},
                )
                assert repeated.status_code == 204
                rejected = await client.get("/auth/session")
                assert rejected.status_code == 401
                assert rejected.json()["error"]["code"] == "auth.authentication_required"
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_authentication_api_does_not_enumerate_accounts() -> None:
    async def exercise() -> None:
        client, engine = build_auth_client()
        try:
            async with client:
                wrong = await client.post(
                    "/auth/login",
                    json={"email": "admin@example.com", "password": "wrong password"},
                    headers={"Origin": TRUSTED_ORIGIN, "X-Request-ID": "wrong-login"},
                )
                missing = await client.post(
                    "/auth/login",
                    json={"email": "missing@example.com", "password": "wrong password"},
                    headers={"Origin": TRUSTED_ORIGIN},
                )
                no_cookie = await client.get("/auth/session")
                assert wrong.status_code == missing.status_code == 401
                assert wrong.json() == missing.json()
                assert wrong.headers["cache-control"] == "no-store"
                assert wrong.headers["x-request-id"] == "wrong-login"
                assert no_cookie.status_code == 401
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_production_cookies_are_secure(monkeypatch) -> None:
    monkeypatch.setattr(
        authentication,
        "get_settings",
        lambda: Settings(environment="production"),
    )
    response = Response()

    authentication._set_authentication_cookies(response, "session", "csrf")
    authentication._clear_authentication_cookies(response)

    cookies = response.headers.getlist("set-cookie")
    assert len(cookies) == 4
    assert all("Secure" in cookie and "SameSite=strict" in cookie for cookie in cookies)


def test_authentication_api_rejects_untrusted_origin_and_invalid_csrf() -> None:
    async def exercise() -> None:
        client, engine = build_auth_client()
        try:
            async with client:
                missing_origin = await client.post(
                    "/auth/login",
                    json={"email": "admin@example.com", "password": PASSWORD},
                )
                invalid_origin = await client.post(
                    "/auth/login",
                    json={"email": "admin@example.com", "password": PASSWORD},
                    headers={"Origin": "https://attacker.example"},
                )
                assert missing_origin.status_code == invalid_origin.status_code == 403
                assert invalid_origin.json()["error"]["code"] == "auth.invalid_origin"

                login = await client.post(
                    "/auth/login",
                    json={"email": "admin@example.com", "password": PASSWORD},
                    headers={"Origin": TRUSTED_ORIGIN},
                )
                assert login.status_code == 200
                missing_csrf = await client.post(
                    "/auth/logout",
                    headers={"Origin": TRUSTED_ORIGIN},
                )
                invalid_csrf = await client.post(
                    "/auth/logout",
                    headers={"Origin": TRUSTED_ORIGIN, "X-CSRF-Token": "invalid"},
                )
                assert missing_csrf.status_code == invalid_csrf.status_code == 403
                assert invalid_csrf.json()["error"]["code"] == "auth.invalid_csrf_token"
        finally:
            engine.dispose()

    asyncio.run(exercise())


def test_cors_preflight_allows_only_configured_browser_origin() -> None:
    async def exercise() -> None:
        client, engine = build_auth_client()
        try:
            async with client:
                allowed = await client.options(
                    "/auth/login",
                    headers={
                        "Origin": TRUSTED_ORIGIN,
                        "Access-Control-Request-Method": "POST",
                        "Access-Control-Request-Headers": "content-type,x-csrf-token",
                    },
                )
                rejected = await client.options(
                    "/auth/login",
                    headers={
                        "Origin": "https://attacker.example",
                        "Access-Control-Request-Method": "POST",
                    },
                )
                assert allowed.status_code == 200
                assert allowed.headers["access-control-allow-origin"] == TRUSTED_ORIGIN
                assert allowed.headers["access-control-allow-credentials"] == "true"
                assert rejected.status_code == 400
                assert "access-control-allow-origin" not in rejected.headers
        finally:
            engine.dispose()

    asyncio.run(exercise())
