from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import Base, User, UserCredential, UserSession


def build_user_with_authentication(now: datetime) -> User:
    user = User(email_normalized="editor@example.com")
    user.credential = UserCredential(
        password_hash="$argon2id$placeholder",
        password_changed_at=now,
    )
    user.sessions.append(
        UserSession(
            token_hash="a" * 64,
            csrf_token_hash="b" * 64,
            last_seen_at=now,
            idle_expires_at=now + timedelta(minutes=30),
            absolute_expires_at=now + timedelta(hours=8),
        ),
    )
    return user


def test_credentials_and_sessions_persist_without_plain_tokens() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime.now(UTC)

    with Session(engine) as session:
        user = build_user_with_authentication(now)
        session.add(user)
        session.commit()
        session.refresh(user)

        assert user.credential is not None
        assert user.credential.failed_attempt_count == 0
        assert user.credential.locked_until is None
        assert user.sessions[0].token_hash == "a" * 64
        assert user.sessions[0].is_active(now)
        assert not user.sessions[0].is_active(now + timedelta(minutes=31))

        user.sessions[0].revoked_at = now + timedelta(minutes=1)
        user.sessions[0].revocation_reason = "logout"
        assert not user.sessions[0].is_active(now + timedelta(minutes=2))

    engine.dispose()


def test_credential_and_session_constraints_reject_duplicates() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime.now(UTC)

    with Session(engine) as session:
        user = build_user_with_authentication(now)
        session.add(user)
        session.commit()

        session.add(
            UserCredential(
                user_id=user.id,
                password_hash="$argon2id$duplicate",
                password_changed_at=now,
            ),
        )
        with pytest.raises(IntegrityError):
            session.commit()
        session.rollback()

        session.add(
            UserSession(
                user_id=user.id,
                token_hash="a" * 64,
                csrf_token_hash="c" * 64,
                last_seen_at=now,
                idle_expires_at=now + timedelta(minutes=30),
                absolute_expires_at=now + timedelta(hours=8),
            ),
        )
        with pytest.raises(IntegrityError):
            session.commit()

    engine.dispose()
