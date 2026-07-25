from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import Base, Permission, Role
from followread_api.services import (
    PERMISSION_DESCRIPTIONS,
    ROLE_PERMISSION_MATRIX,
    AuthenticatedUser,
    PermissionDeniedError,
    ensure_rbac_matrix,
    require_permission,
)


def test_rbac_matrix_is_complete_and_idempotent() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        ensure_rbac_matrix(session)
        session.commit()
        ensure_rbac_matrix(session)
        session.commit()

        roles = {role.name: role for role in session.scalars(select(Role)).all()}
        permissions = session.scalars(select(Permission)).all()
        assert roles.keys() == ROLE_PERMISSION_MATRIX.keys()
        assert {permission.code for permission in permissions} == set(
            PERMISSION_DESCRIPTIONS,
        )
        for role_name, expected_codes in ROLE_PERMISSION_MATRIX.items():
            assert {
                permission.code for permission in roles[role_name].permissions
            } == expected_codes

    engine.dispose()


def test_permission_requirement_denies_by_default() -> None:
    allowed = AuthenticatedUser(
        id=uuid4(),
        email="admin@example.com",
        display_name="Admin",
        roles=("content_admin",),
        permissions=("admin.access",),
    )
    denied = AuthenticatedUser(
        id=uuid4(),
        email="reader@example.com",
        display_name="Reader",
        roles=("reader",),
        permissions=(),
    )

    assert require_permission(allowed, "admin.access") is allowed
    with pytest.raises(PermissionDeniedError):
        require_permission(denied, "admin.access")
