from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from followread_api.services import AuthenticatedUser, IssuedSession


class LoginRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=1, max_length=128)


class AuthenticatedUserResponse(BaseModel):
    id: UUID
    email: str
    display_name: str
    roles: list[str]
    permissions: list[str]


class SessionResponse(BaseModel):
    user: AuthenticatedUserResponse
    idle_expires_at: datetime | None = None
    absolute_expires_at: datetime | None = None


def authenticated_user_response(user: AuthenticatedUser) -> AuthenticatedUserResponse:
    return AuthenticatedUserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        roles=list(user.roles),
        permissions=list(user.permissions),
    )


def issued_session_response(session: IssuedSession) -> SessionResponse:
    return SessionResponse(
        user=authenticated_user_response(session.user),
        idle_expires_at=session.idle_expires_at,
        absolute_expires_at=session.absolute_expires_at,
    )
