"""One-use, expiring password reset with hashed tokens and session revocation."""

import logging
import smtplib
import ssl
from datetime import UTC, datetime, timedelta
from email.message import EmailMessage
from pathlib import Path
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, SecretStr
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from followread_api.config import get_settings
from followread_api.database import create_session_factory, get_database_engine
from followread_api.models import AuditLog, User, UserCredential, UserSession
from followread_api.models.password_reset import PasswordResetToken
from followread_api.security import PasswordService, TokenService
from followread_api.services.bootstrap import validate_password
from followread_api.services.identity import InvalidEmailError, normalize_email

RESET_URL = "https://followread.innovalogic.tech/admin/reset-password"
MESSAGE = "Si la cuenta puede recuperar el acceso, recibirá un enlace con los siguientes pasos."


class MailSettings(BaseModel):
    host: str = Field(min_length=1)
    port: int = Field(default=465, ge=1, le=65535)
    username: str = Field(min_length=1)
    password: SecretStr
    sender: str = Field(min_length=3)
    tls: Literal["ssl", "starttls"] = "ssl"


def mail_settings() -> MailSettings | None:
    path = get_settings().smtp_config_file
    if path is None:
        return None
    raw = Path(path).read_text(encoding="utf-8").strip()
    if raw in {"", "{}"}:
        return None
    return MailSettings.model_validate_json(raw)


def issue_reset(
    session: Session,
    email: str,
    *,
    minutes: int = 15,
    now: datetime | None = None,
    cooldown: bool = True,
) -> str | None:
    now = now or datetime.now(UTC)
    if not 1 <= minutes <= 1440:
        raise ValueError("Reset lifetime must be between 1 and 1440 minutes")
    try:
        email = normalize_email(email)
    except InvalidEmailError:
        return None
    user = session.scalar(
        select(User).where(User.email_normalized == email, User.status == "active")
    )
    if user is None or user.credential is None or user.administrator is None:
        return None
    recent = session.scalar(
        select(PasswordResetToken.id)
        .where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.created_at > now - timedelta(minutes=5),
        )
        .limit(1)
    )
    if cooldown and recent is not None:
        return None
    session.execute(
        delete(PasswordResetToken).where(PasswordResetToken.expires_at <= now - timedelta(days=1))
    )
    session.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )
    token = TokenService().issue()
    session.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=token.digest,
            expires_at=now + timedelta(minutes=minutes),
            created_at=now,
        )
    )
    session.commit()
    return f"{RESET_URL}#token={token.plain}"


def reset_password(session: Session, token: str, password: str) -> UUID:
    validate_password(password)
    now = datetime.now(UTC)
    user_id = session.scalar(
        update(PasswordResetToken)
        .where(
            PasswordResetToken.token_hash == TokenService().digest(token),
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
            PasswordResetToken.user_id.in_(select(User.id).where(User.status == "active")),
        )
        .values(used_at=now)
        .returning(PasswordResetToken.user_id)
    )
    if user_id is None:
        session.rollback()
        raise ValueError("Invalid or expired recovery link")
    result = session.scalar(
        update(UserCredential)
        .where(UserCredential.user_id == user_id)
        .values(
            password_hash=PasswordService().hash(password),
            password_changed_at=now,
            failed_attempt_count=0,
            failed_attempt_window_started_at=None,
            locked_until=None,
        )
        .returning(UserCredential.id)
    )
    if result is None:
        session.rollback()
        raise ValueError("Invalid recovery account")
    session.execute(
        update(UserSession)
        .where(UserSession.user_id == user_id, UserSession.revoked_at.is_(None))
        .values(revoked_at=now, revocation_reason="password_reset")
    )
    session.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user_id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )
    session.add(
        AuditLog(
            actor_user_id=user_id,
            action="auth.password_reset",
            target_type="User",
            target_id=user_id,
            outcome="succeeded",
        )
    )
    session.commit()
    return user_id


def send_mail(settings: MailSettings, recipient: str, subject: str, body: str) -> None:
    message = EmailMessage()
    message["From"] = settings.sender
    message["To"] = recipient
    message["Subject"] = subject
    message.set_content(body)
    context = ssl.create_default_context()
    client: smtplib.SMTP
    if settings.tls == "ssl":
        client = smtplib.SMTP_SSL(settings.host, settings.port, timeout=15, context=context)
    else:
        client = smtplib.SMTP(settings.host, settings.port, timeout=15)
    with client:
        if settings.tls == "starttls":
            client.starttls(context=context)
        client.login(settings.username, settings.password.get_secret_value())
        client.send_message(message)


def deliver_reset(email: str) -> None:
    try:
        settings = mail_settings()
        if settings is None:
            return
        with create_session_factory(get_database_engine())() as session:
            link = issue_reset(session, email)
        if link is not None:
            send_mail(
                settings,
                normalize_email(email),
                "Recupera tu acceso a FollowRead",
                (
                    "Abre este enlace para elegir una nueva contraseña. "
                    "Expira en 15 minutos y solo puede usarse una vez.\n\n"
                    f"{link}\n\nSi no lo solicitaste, ignora este correo."
                ),
            )
    except Exception:
        logging.getLogger("followread.security").error("password_reset.delivery_failed")


def notify_password_changed(user_id: UUID) -> None:
    try:
        settings = mail_settings()
        if settings is None:
            return
        with create_session_factory(get_database_engine())() as session:
            email = session.scalar(select(User.email_normalized).where(User.id == user_id))
        if email:
            send_mail(
                settings,
                email,
                "Contraseña de FollowRead actualizada",
                (
                    "Tu contraseña se actualizó y las sesiones anteriores se cerraron. "
                    "Si no reconoces este cambio, contacta al responsable del servicio."
                ),
            )
    except Exception:
        logging.getLogger("followread.security").error("password_reset.notification_failed")
