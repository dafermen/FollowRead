from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import Administrator, Role, User, UserCredential
from followread_api.security import PasswordService

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


def normalize_email(email: str) -> str:
    normalized = email.strip().casefold()
    local_part, separator, domain = normalized.partition("@")
    if (
        separator != "@"
        or not local_part
        or not domain
        or len(normalized) > 320
        or any(character.isspace() for character in normalized)
    ):
        raise BootstrapInputError("Enter a valid email address.")
    return normalized


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
    normalized_email = normalize_email(email)
    normalized_display_name = validate_display_name(display_name)
    validate_password(password)
    password_service = password_service or PasswordService()
    now = now or datetime.now(UTC)

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

    role = session.scalar(select(Role).where(Role.name == SUPERADMIN_ROLE))
    if role is None:
        role = Role(
            name=SUPERADMIN_ROLE,
            description="Unrestricted administrative access for the FollowRead MVP.",
        )

    user = User(
        email_normalized=normalized_email,
        administrator=Administrator(display_name=normalized_display_name),
        credential=UserCredential(
            password_hash=password_service.hash(password),
            password_changed_at=now,
        ),
        roles=[role],
    )
    session.add(user)
    session.flush()
    return BootstrapResult(user_id=user.id, email=normalized_email, created=True)
