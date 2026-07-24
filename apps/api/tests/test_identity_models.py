import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from followread_api.database import create_database_engine
from followread_api.models import Administrator, Base, Permission, Role, User


def test_administrator_roles_and_permissions_persist_without_credentials() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        permission = Permission(code="content:publish", description="Publish approved content")
        role = Role(name="publisher", permissions=[permission])
        user = User(
            external_subject="future-idp|admin-1",
            email_normalized="editor@example.test",
            administrator=Administrator(display_name="Editor"),
            roles=[role],
        )
        session.add(user)
        session.commit()

        assert user.administrator is not None
        assert user.administrator.display_name == "Editor"
        assert user.roles[0].permissions[0].code == "content:publish"
        assert not hasattr(user, "password")
        assert not hasattr(user, "token")

    engine.dispose()


def test_role_and_permission_codes_are_unique() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all([Role(name="editor"), Role(name="editor")])
        with pytest.raises(IntegrityError):
            session.commit()

    engine.dispose()
