from datetime import UTC, datetime

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import Base, Role, User
from followread_api.security import PasswordService
from followread_api.services import (
    BootstrapConflictError,
    BootstrapInputError,
    bootstrap_superadmin,
)

PASSWORD = "a sufficiently long password"


def test_bootstrap_creates_superadministrator_and_is_idempotent() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    now = datetime.now(UTC)

    with Session(engine, expire_on_commit=False) as session:
        created = bootstrap_superadmin(
            session,
            email="  Admin@Example.COM ",
            display_name=" FollowRead Owner ",
            password=PASSWORD,
            now=now,
        )
        session.commit()
        repeated = bootstrap_superadmin(
            session,
            email="admin@example.com",
            display_name="Ignored on safe repeat",
            password="another sufficiently long password",
            now=now,
        )

        user = session.scalar(select(User).where(User.id == created.user_id))
        assert user is not None
        assert created.created
        assert not repeated.created
        assert repeated.user_id == created.user_id
        assert user.email_normalized == "admin@example.com"
        assert user.administrator is not None
        assert user.administrator.display_name == "FollowRead Owner"
        assert user.credential is not None
        assert user.credential.password_hash.startswith("$argon2id$")
        assert PasswordService().verify_and_update(
            PASSWORD,
            user.credential.password_hash,
        )[0]
        assert [role.name for role in user.roles] == ["super_admin"]
        assert session.scalars(select(Role)).all() == user.roles

    engine.dispose()


@pytest.mark.parametrize(
    ("email", "display_name", "password"),
    [
        ("invalid", "Owner", PASSWORD),
        ("admin@example.com", " ", PASSWORD),
        ("admin@example.com", "Owner", "too short"),
    ],
)
def test_bootstrap_rejects_invalid_input(
    email: str,
    display_name: str,
    password: str,
) -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session, pytest.raises(BootstrapInputError):
        bootstrap_superadmin(
            session,
            email=email,
            display_name=display_name,
            password=password,
        )

    engine.dispose()


def test_bootstrap_rejects_an_existing_non_admin_account() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add(User(email_normalized="reader@example.com"))
        session.commit()

        with pytest.raises(BootstrapConflictError):
            bootstrap_superadmin(
                session,
                email="reader@example.com",
                display_name="Owner",
                password=PASSWORD,
            )

    engine.dispose()
