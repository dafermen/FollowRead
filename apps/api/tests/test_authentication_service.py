from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import (
    Administrator,
    AuditLog,
    Base,
    Role,
    User,
    UserCredential,
    UserSession,
)
from followread_api.security import PasswordService, TokenService
from followread_api.services import (
    ROLE_PERMISSION_MATRIX,
    AuthenticationRequiredError,
    AuthenticationService,
    InvalidCredentialsError,
    InvalidCsrfTokenError,
    bootstrap_superadmin,
)

PASSWORD = "a sufficiently long password"


def build_authenticated_session() -> tuple[Engine, Session, AuthenticationService]:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = Session(engine, expire_on_commit=False)
    bootstrap_superadmin(
        session,
        email="admin@example.com",
        display_name="FollowRead Owner",
        password=PASSWORD,
    )
    role = session.scalar(select(Role).where(Role.name == "super_admin"))
    assert role is not None
    session.commit()
    return engine, session, AuthenticationService(session)


def test_login_current_and_idempotent_logout_use_revocable_tokens() -> None:
    engine, session, service = build_authenticated_session()
    now = datetime.now(UTC)

    issued = service.login(
        " ADMIN@example.com ",
        PASSWORD,
        now=now,
        correlation_id="request-login",
    )
    stored = session.scalar(select(UserSession))
    assert stored is not None
    assert issued.user.email == "admin@example.com"
    assert issued.user.display_name == "FollowRead Owner"
    assert issued.user.roles == ("super_admin",)
    assert issued.user.permissions == tuple(sorted(ROLE_PERMISSION_MATRIX["super_admin"]))
    assert issued.session_token not in stored.token_hash
    assert issued.csrf_token not in stored.csrf_token_hash
    assert stored.idle_expires_at == now + timedelta(minutes=30)
    assert stored.absolute_expires_at == now + timedelta(hours=8)

    later = now + timedelta(minutes=10)
    assert service.current(issued.session_token, now=later) == issued.user
    assert stored.last_seen_at == later
    assert stored.idle_expires_at == later + timedelta(minutes=30)

    service.logout(issued.session_token, now=later, correlation_id="request-logout")
    service.logout(issued.session_token, now=later)
    assert stored.revocation_reason == "logout"
    with pytest.raises(AuthenticationRequiredError):
        service.current(issued.session_token, now=later)
    audit = session.scalars(select(AuditLog).order_by(AuditLog.created_at)).all()
    assert [(event.action, event.outcome, event.correlation_id) for event in audit] == [
        ("auth.login", "succeeded", "request-login"),
        ("auth.logout", "succeeded", "request-logout"),
    ]
    assert all(event.event_metadata == {} for event in audit)

    session.close()
    engine.dispose()


def test_login_attempt_window_locks_and_recovers_without_exposing_secrets() -> None:
    engine, session, service = build_authenticated_session()
    now = datetime.now(UTC)

    for attempt in range(5):
        with pytest.raises(InvalidCredentialsError):
            service.login(
                "admin@example.com",
                f"incorrect password {attempt}",
                now=now + timedelta(minutes=attempt),
                correlation_id=f"failure-{attempt}",
            )

    user = session.scalar(select(User).where(User.email_normalized == "admin@example.com"))
    assert user is not None
    assert user.credential is not None
    assert user.credential.failed_attempt_count == 5
    assert user.credential.locked_until is not None
    assert user.credential.locked_until.replace(tzinfo=UTC) == now + timedelta(minutes=19)

    with pytest.raises(InvalidCredentialsError):
        service.login("admin@example.com", PASSWORD, now=now + timedelta(minutes=5))

    recovered = service.login(
        "admin@example.com",
        PASSWORD,
        now=now + timedelta(minutes=20),
    )
    assert recovered.user.email == "admin@example.com"
    assert user.credential.failed_attempt_count == 0
    assert user.credential.failed_attempt_window_started_at is None
    assert user.credential.locked_until is None

    audit = session.scalars(select(AuditLog).order_by(AuditLog.created_at)).all()
    assert [event.outcome for event in audit[:5]] == ["failed"] * 5
    assert audit[5].outcome == "denied"
    assert audit[6].outcome == "succeeded"
    serialized_audit = repr(
        [(event.correlation_id, event.event_metadata) for event in audit],
    )
    assert PASSWORD not in serialized_audit
    assert "incorrect password" not in serialized_audit

    session.close()
    engine.dispose()


def test_failed_attempt_window_restarts_after_fifteen_minutes() -> None:
    engine, session, service = build_authenticated_session()
    now = datetime.now(UTC)

    with pytest.raises(InvalidCredentialsError):
        service.login("admin@example.com", "wrong one", now=now)
    with pytest.raises(InvalidCredentialsError):
        service.login(
            "admin@example.com",
            "wrong two",
            now=now + timedelta(minutes=16),
        )

    user = session.scalar(select(User).where(User.email_normalized == "admin@example.com"))
    assert user is not None
    assert user.credential is not None
    assert user.credential.failed_attempt_count == 1
    assert user.credential.failed_attempt_window_started_at is not None
    assert user.credential.failed_attempt_window_started_at.replace(
        tzinfo=UTC,
    ) == now + timedelta(minutes=16)

    session.close()
    engine.dispose()


def test_csrf_validation_accepts_only_the_active_session_token() -> None:
    engine, session, service = build_authenticated_session()
    now = datetime.now(UTC)
    issued = service.login("admin@example.com", PASSWORD, now=now)

    service.validate_csrf(issued.session_token, issued.csrf_token, now=now)
    with pytest.raises(InvalidCsrfTokenError):
        service.validate_csrf(issued.session_token, "invalid-csrf", now=now)
    with pytest.raises(AuthenticationRequiredError):
        service.validate_csrf("invalid-session", issued.csrf_token, now=now)

    service.logout(issued.session_token, now=now)
    with pytest.raises(AuthenticationRequiredError):
        service.validate_csrf(issued.session_token, issued.csrf_token, now=now)

    session.close()
    engine.dispose()


@pytest.mark.parametrize(
    ("email", "password"),
    [
        ("missing@example.com", PASSWORD),
        ("not-an-email", PASSWORD),
        ("admin@example.com", "incorrect password value"),
    ],
)
def test_login_uses_the_same_error_for_invalid_identity(
    email: str,
    password: str,
) -> None:
    engine, session, service = build_authenticated_session()

    with pytest.raises(InvalidCredentialsError) as error:
        service.login(email, password)

    assert error.value.message == "The email or password is invalid."
    session.close()
    engine.dispose()


def test_login_rejects_disabled_and_non_administrator_accounts() -> None:
    engine, session, service = build_authenticated_session()
    password_service = PasswordService()
    admin = session.scalar(select(User).where(User.email_normalized == "admin@example.com"))
    assert admin is not None
    admin.status = "disabled"
    reader = User(
        email_normalized="reader@example.com",
        credential=UserCredential(
            password_hash=password_service.hash(PASSWORD),
            password_changed_at=datetime.now(UTC),
        ),
    )
    incomplete_admin = User(
        email_normalized="incomplete@example.com",
        administrator=Administrator(display_name="Admin without credential"),
    )
    session.add_all([reader, incomplete_admin])
    session.commit()

    with pytest.raises(InvalidCredentialsError):
        service.login("admin@example.com", PASSWORD)
    with pytest.raises(InvalidCredentialsError):
        service.login("reader@example.com", PASSWORD)

    with pytest.raises(InvalidCredentialsError):
        AuthenticationService(session, password_service).login("incomplete@example.com", PASSWORD)

    session.close()
    engine.dispose()


def test_current_rejects_missing_expired_and_non_administrator_sessions() -> None:
    engine, session, service = build_authenticated_session()
    now = datetime.now(UTC)
    issued = service.login("admin@example.com", PASSWORD, now=now)
    stored = session.scalar(select(UserSession))
    assert stored is not None

    stored.idle_expires_at = now - timedelta(seconds=1)
    session.commit()
    with pytest.raises(AuthenticationRequiredError):
        service.current(issued.session_token, now=now)
    with pytest.raises(AuthenticationRequiredError):
        service.current("unknown-token", now=now)

    stored.idle_expires_at = now + timedelta(minutes=30)
    stored.user.administrator = None
    session.commit()
    with pytest.raises(AuthenticationRequiredError):
        service.current(issued.session_token, now=now)

    session.close()
    engine.dispose()


def test_login_updates_an_outdated_argon2_hash() -> None:
    engine, session, _ = build_authenticated_session()
    user = session.scalar(select(User).where(User.email_normalized == "admin@example.com"))
    assert user is not None
    assert user.credential is not None
    old_hash = user.credential.password_hash

    class UpdatingPasswordService:
        def verify_and_update(self, password: str, encoded_hash: str) -> tuple[bool, str]:
            assert password == PASSWORD
            assert encoded_hash == old_hash
            return True, "$argon2id$updated"

    now = datetime.now(UTC)
    service = AuthenticationService(
        session,
        password_service=UpdatingPasswordService(),  # type: ignore[arg-type]
        token_service=TokenService(),
    )
    service.login("admin@example.com", PASSWORD, now=now)

    assert user.credential.password_hash == "$argon2id$updated"
    assert user.credential.password_changed_at == now
    session.close()
    engine.dispose()
