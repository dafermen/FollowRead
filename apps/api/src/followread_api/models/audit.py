from uuid import UUID

from sqlalchemy import JSON, CheckConstraint, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from followread_api.models.base import Base, TimestampMixin, UuidPrimaryKeyMixin
from followread_api.models.identity import User


class AuditLog(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        CheckConstraint("outcome IN ('succeeded', 'failed', 'denied')", name="valid_outcome"),
    )

    actor_user_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
    )
    action: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    target_type: Mapped[str] = mapped_column(String(120), nullable=False)
    target_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False, index=True)
    outcome: Mapped[str] = mapped_column(String(16), nullable=False)
    correlation_id: Mapped[str | None] = mapped_column(String(160), index=True)
    event_metadata: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False, default=dict)

    actor: Mapped[User | None] = relationship()
