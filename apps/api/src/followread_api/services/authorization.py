from types import MappingProxyType

from sqlalchemy import select
from sqlalchemy.orm import Session

from followread_api.models import Permission, Role
from followread_api.services.authentication import AuthenticatedUser
from followread_api.services.errors import PermissionDeniedError

PERMISSION_DESCRIPTIONS = MappingProxyType(
    {
        "admin.access": "Access the editorial administration application.",
        "users.manage": "Create, disable, and assign roles to adult accounts.",
        "content.create": "Create editorial content and drafts.",
        "content.edit": "Edit unpublished editorial content.",
        "content.process": "Request audio and illustration processing.",
        "content.review": "Review and approve editorial versions.",
        "content.publish": "Publish and unpublish approved content.",
        "audit.read": "Read security and editorial audit records.",
    },
)

ROLE_PERMISSION_MATRIX = MappingProxyType(
    {
        "super_admin": frozenset(PERMISSION_DESCRIPTIONS),
        "content_admin": frozenset(
            {
                "admin.access",
                "content.create",
                "content.edit",
                "content.process",
                "content.publish",
            },
        ),
        "reviewer": frozenset({"admin.access", "content.review"}),
        "reader": frozenset(),
    },
)


def ensure_rbac_matrix(session: Session) -> dict[str, Role]:
    permissions = {
        permission.code: permission for permission in session.scalars(select(Permission)).all()
    }
    for code, description in PERMISSION_DESCRIPTIONS.items():
        if code not in permissions:
            permissions[code] = Permission(code=code, description=description)

    roles = {role.name: role for role in session.scalars(select(Role)).all()}
    for role_name, permission_codes in ROLE_PERMISSION_MATRIX.items():
        role = roles.get(role_name)
        if role is None:
            role = Role(name=role_name, description=_role_description(role_name))
            roles[role_name] = role
        existing_codes = {permission.code for permission in role.permissions}
        role.permissions.extend(
            permissions[code] for code in sorted(permission_codes - existing_codes)
        )
    session.add_all(permissions.values())
    session.add_all(roles.values())
    return roles


def require_permission(user: AuthenticatedUser, permission_code: str) -> AuthenticatedUser:
    if permission_code not in user.permissions:
        raise PermissionDeniedError
    return user


def _role_description(role_name: str) -> str:
    descriptions = {
        "super_admin": "Unrestricted administrative access for the FollowRead MVP.",
        "content_admin": "Create, process, and publish editorial content.",
        "reviewer": "Review and approve editorial content independently.",
        "reader": "Adult reader account without editorial access.",
    }
    return descriptions[role_name]
