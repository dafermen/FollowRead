from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import Administrator, User, UserCredential
from followread_api.security import PasswordService
from followread_api.services.authorization import ensure_rbac_matrix
from followread_api.services.identity import InvalidEmailError, normalize_email

SUPERADMIN_ROLE = "super_admin"
MINIMUM_PASSWORD_LENGTH = 15
MAXIMUM_PASSWORD_LENGTH = 128


class BootstrapInputError(ValueError):
    pass


class BootstrapConflictError(RuntimeError):
    pass


@dataclass(frozen=True)
class BootstrapResult:
    user_id: UUID
    email: str
    created: bool


def validate_display_name(display_name: str) -> str:
    normalized = display_name.strip()
    if not normalized or len(normalized) > 160:
        raise BootstrapInputError("Display name must contain between 1 and 160 characters.")
    return normalized


def validate_password(password: str) -> None:
    if not MINIMUM_PASSWORD_LENGTH <= len(password) <= MAXIMUM_PASSWORD_LENGTH:
        raise BootstrapInputError(
            "Password must contain between 15 and 128 characters.",
        )


def bootstrap_superadmin(
    session: Session,
    *,
    email: str,
    display_name: str,
    password: str,
    password_service: PasswordService | None = None,
    now: datetime | None = None,
) -> BootstrapResult:
    try:
        normalized_email = normalize_email(email)
    except InvalidEmailError as error:
        raise BootstrapInputError(str(error)) from error
    normalized_display_name = validate_display_name(display_name)
    validate_password(password)
    password_service = password_service or PasswordService()
    now = now or datetime.now(UTC)

    roles = ensure_rbac_matrix(session)
    existing_user = session.scalar(
        select(User)
        .where(User.email_normalized == normalized_email)
        .options(
            selectinload(User.administrator),
            selectinload(User.credential),
            selectinload(User.roles),
        ),
    )
    if existing_user is not None:
        is_superadministrator = (
            existing_user.administrator is not None
            and existing_user.credential is not None
            and any(role.name == SUPERADMIN_ROLE for role in existing_user.roles)
        )
        if not is_superadministrator:
            raise BootstrapConflictError(
                "The email already belongs to an account that is not a superadministrator.",
            )
        return BootstrapResult(
            user_id=existing_user.id,
            email=normalized_email,
            created=False,
        )

    user = User(
        email_normalized=normalized_email,
        administrator=Administrator(display_name=normalized_display_name),
        credential=UserCredential(
            password_hash=password_service.hash(password),
            password_changed_at=now,
        ),
        roles=[roles[SUPERADMIN_ROLE]],
    )
    session.add(user)
    session.flush()
    return BootstrapResult(user_id=user.id, email=normalized_email, created=True)
