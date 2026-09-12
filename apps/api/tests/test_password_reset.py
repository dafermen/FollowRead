from datetime import UTC, datetime, timedelta
from unittest.mock import Mock

import pytest
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import Base, PasswordResetToken, User
from followread_api.services import AuthenticationService, bootstrap_superadmin
from followread_api.services.errors import AuthenticationRequiredError, InvalidCredentialsError
from followread_api.services.password_reset import issue_reset, reset_password

OLD = "a long initial test password"
NEW = "a different long test password"


def test_reset_is_hashed_once_only_and_revokes_previous_sessions() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        owner = bootstrap_superadmin(
            session, email="owner@example.com", display_name="Owner", password=OLD
        )
        session.commit()
        auth = AuthenticationService(session)
        previous = auth.login(owner.email, OLD)
        link = issue_reset(session, owner.email)
        assert link is not None
        token = link.split("#token=")[1]
        stored = session.scalar(select(PasswordResetToken))
        assert stored is not None and stored.token_hash != token and len(stored.token_hash) == 64
        assert issue_reset(session, owner.email) is None
        assert reset_password(session, token, NEW) == owner.user_id
        with pytest.raises(ValueError):
            reset_password(session, token, OLD)
        with pytest.raises(AuthenticationRequiredError):
            auth.current(previous.session_token)
        with pytest.raises(InvalidCredentialsError):
            auth.login(owner.email, OLD)
        assert auth.login(owner.email, NEW).user.id == owner.user_id
    engine.dispose()


def test_reset_rejects_expired_disabled_unknown_and_superseded_tokens() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        owner = bootstrap_superadmin(
            session, email="owner@example.com", display_name="Owner", password=OLD
        )
        session.commit()
        assert issue_reset(session, "missing@example.com") is None
        assert issue_reset(session, "not an email") is None
        expired = issue_reset(session, owner.email, now=datetime.now(UTC) - timedelta(hours=2))
        assert expired is not None
        with pytest.raises(ValueError):
            reset_password(session, expired.split("#token=")[1], NEW)
        first = issue_reset(session, owner.email, cooldown=False)
        second = issue_reset(session, owner.email, cooldown=False)
        assert first is not None and second is not None
        with pytest.raises(ValueError):
            reset_password(session, first.split("#token=")[1], NEW)
        session.execute(update(User).where(User.id == owner.user_id).values(status="disabled"))
        session.commit()
        with pytest.raises(ValueError):
            reset_password(session, second.split("#token=")[1], NEW)
        assert issue_reset(session, owner.email, cooldown=False) is None
    engine.dispose()


def test_recovery_api_enforces_origin_and_does_not_expose_account_or_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import asyncio

    from test_authentication_api import build_auth_client

    from followread_api.api.routes import password_reset as routes

    async def exercise() -> None:
        client, engine = build_auth_client()
        delivery = Mock()
        monkeypatch.setattr(routes, "deliver_reset", delivery)
        monkeypatch.setattr(routes, "mail_settings", lambda: None)
        async with client:
            unavailable = await client.post(
                "/auth/password-reset/request",
                json={"email": "admin@example.com"},
                headers={"Origin": "http://localhost:5173"},
            )
            assert unavailable.status_code == 503
            assert delivery.call_count == 0
            monkeypatch.setattr(routes, "mail_settings", lambda: object())
            rejected = await client.post(
                "/auth/password-reset/request", json={"email": "admin@example.com"}
            )
            assert rejected.status_code == 403
            responses = [
                await client.post(
                    "/auth/password-reset/request",
                    json={"email": email},
                    headers={"Origin": "http://localhost:5173"},
                )
                for email in ["admin@example.com", "nobody@example.com"]
            ]
            assert [r.status_code for r in responses] == [202, 202]
            assert responses[0].json() == responses[1].json()
            assert "token" not in responses[0].text
            assert responses[0].headers["cache-control"] == "no-store"
            assert delivery.call_count == 2
            invalid = await client.post(
                "/auth/password-reset/confirm",
                json={"token": "x" * 43, "password": NEW},
                headers={"Origin": "http://localhost:5173"},
            )
            assert invalid.status_code == 400
        engine.dispose()

    asyncio.run(exercise())
