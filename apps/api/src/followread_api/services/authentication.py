from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import Role, User, UserSession
from followread_api.security import PasswordService, TokenService
from followread_api.services.bootstrap import normalize_email
from followread_api.services.errors import (
    AuthenticationRequiredError,
    InvalidCredentialsError,
    InvalidCsrfTokenError,
)

SESSION_IDLE_TTL = timedelta(minutes=30)
SESSION_ABSOLUTE_TTL = timedelta(hours=8)
_DUMMY_PASSWORD_HASH = PasswordService().hash("followread-invalid-credential-timing-value")


def _as_utc(timestamp: datetime) -> datetime:
    if timestamp.tzinfo is None:
        return timestamp.replace(tzinfo=UTC)
    return timestamp.astimezone(UTC)


@dataclass(frozen=True)
class AuthenticatedUser:
    id: UUID
    email: str
    display_name: str
    roles: tuple[str, ...]
    permissions: tuple[str, ...]


@dataclass(frozen=True)
class IssuedSession:
    user: AuthenticatedUser
    session_token: str
    csrf_token: str
    idle_expires_at: datetime
    absolute_expires_at: datetime


class AuthenticationService:
    def __init__(
        self,
        session: Session,
        password_service: PasswordService | None = None,
        token_service: TokenService | None = None,
    ) -> None:
        self._session = session
        self._passwords = password_service or PasswordService()
        self._tokens = token_service or TokenService()

    def login(
        self,
        email: str,
        password: str,
        *,
        now: datetime | None = None,
    ) -> IssuedSession:
        now = now or datetime.now(UTC)
        user = self._find_user(email)
        credential_hash = (
            user.credential.password_hash
            if user is not None and user.credential is not None
            else _DUMMY_PASSWORD_HASH
        )
        verified, updated_hash = self._passwords.verify_and_update(password, credential_hash)
        if (
            user is None
            or user.credential is None
            or user.administrator is None
            or user.status != "active"
            or not verified
        ):
            raise InvalidCredentialsError

        if updated_hash is not None:
            user.credential.password_hash = updated_hash
            user.credential.password_changed_at = now

        session_token = self._tokens.issue()
        csrf_token = self._tokens.issue()
        absolute_expires_at = now + SESSION_ABSOLUTE_TTL
        idle_expires_at = now + SESSION_IDLE_TTL
        user.sessions.append(
            UserSession(
                token_hash=session_token.digest,
                csrf_token_hash=csrf_token.digest,
                last_seen_at=now,
                idle_expires_at=idle_expires_at,
                absolute_expires_at=absolute_expires_at,
            ),
        )
        self._session.commit()
        return IssuedSession(
            user=self._authenticated_user(user),
            session_token=session_token.plain,
            csrf_token=csrf_token.plain,
            idle_expires_at=idle_expires_at,
            absolute_expires_at=absolute_expires_at,
        )

    def current(
        self,
        session_token: str,
        *,
        now: datetime | None = None,
    ) -> AuthenticatedUser:
        now = now or datetime.now(UTC)
        stored_session = self._find_session(session_token)
        if stored_session is None or not stored_session.is_active(now):
            raise AuthenticationRequiredError

        stored_session.last_seen_at = now
        stored_session.idle_expires_at = min(
            now + SESSION_IDLE_TTL,
            _as_utc(stored_session.absolute_expires_at),
        )
        self._session.commit()
        return self._authenticated_user(stored_session.user)

    def logout(
        self,
        session_token: str,
        *,
        now: datetime | None = None,
    ) -> None:
        now = now or datetime.now(UTC)
        stored_session = self._find_session(session_token)
        if stored_session is not None and stored_session.revoked_at is None:
            stored_session.revoked_at = now
            stored_session.revocation_reason = "logout"
            self._session.commit()

    def validate_csrf(
        self,
        session_token: str,
        csrf_token: str,
        *,
        now: datetime | None = None,
    ) -> None:
        now = now or datetime.now(UTC)
        stored_session = self._find_session(session_token)
        if stored_session is None or not stored_session.is_active(now):
            raise AuthenticationRequiredError
        if not self._tokens.matches(csrf_token, stored_session.csrf_token_hash):
            raise InvalidCsrfTokenError

    def _find_user(self, email: str) -> User | None:
        try:
            normalized_email = normalize_email(email)
        except ValueError:
            return None
        return self._session.scalar(
            select(User)
            .where(User.email_normalized == normalized_email)
            .options(
                selectinload(User.administrator),
                selectinload(User.credential),
                selectinload(User.roles).selectinload(Role.permissions),
            ),
        )

    def _find_session(self, plain_token: str) -> UserSession | None:
        return self._session.scalar(
            select(UserSession)
            .where(UserSession.token_hash == self._tokens.digest(plain_token))
            .options(
                selectinload(UserSession.user).selectinload(User.administrator),
                selectinload(UserSession.user)
                .selectinload(User.roles)
                .selectinload(Role.permissions),
            ),
        )

    def _authenticated_user(self, user: User) -> AuthenticatedUser:
        administrator = user.administrator
        if administrator is None:
            raise AuthenticationRequiredError
        return AuthenticatedUser(
            id=user.id,
            email=user.email_normalized or "",
            display_name=administrator.display_name,
            roles=tuple(sorted(role.name for role in user.roles)),
            permissions=tuple(
                sorted(
                    {permission.code for role in user.roles for permission in role.permissions},
                ),
            ),
        )
