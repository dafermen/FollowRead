from decimal import Decimal
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from followread_api.models.base import Base, TimestampMixin, UuidPrimaryKeyMixin
from followread_api.models.content import ContentVersion, Paragraph
from followread_api.models.enums import JobStatus, Language, ResourceStatus

LANGUAGE_ENUM = Enum(
    Language,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="resource_language",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)
RESOURCE_STATUS_ENUM = Enum(
    ResourceStatus,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="resource_status",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)
JOB_STATUS_ENUM = Enum(
    JobStatus,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="job_status",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)


class AudioAsset(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "audio_assets"
    __table_args__ = (
        UniqueConstraint("content_version_id", "language", "voice_id"),
        CheckConstraint("duration_ms > 0", name="positive_duration"),
    )

    content_version_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    language: Mapped[Language] = mapped_column(LANGUAGE_ENUM, nullable=False)
    voice_id: Mapped[str] = mapped_column(String(120), nullable=False)
    uri: Mapped[str] = mapped_column(String(500), nullable=False)
    checksum: Mapped[str] = mapped_column(String(71), nullable=False)
    source_checksum: Mapped[str | None] = mapped_column(String(71))
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[ResourceStatus] = mapped_column(
        RESOURCE_STATUS_ENUM,
        nullable=False,
        default=ResourceStatus.PENDING,
    )

    version: Mapped[ContentVersion] = relationship()
    speech_marks: Mapped[list["SpeechMark"]] = relationship(
        back_populates="audio_asset",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="SpeechMark.position",
    )


class SpeechMark(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "speech_marks"
    __table_args__ = (
        UniqueConstraint("audio_asset_id", "position"),
        CheckConstraint("position >= 0", name="non_negative_position"),
        CheckConstraint("start_ms >= 0", name="non_negative_start"),
        CheckConstraint("end_ms >= start_ms", name="valid_time_range"),
        CheckConstraint("char_start >= 0", name="non_negative_char_start"),
        CheckConstraint("char_end >= char_start", name="valid_char_range"),
        CheckConstraint("mark_type IN ('word', 'sentence')", name="valid_mark_type"),
    )

    audio_asset_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("audio_assets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    paragraph_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("paragraphs.id", ondelete="RESTRICT"),
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    mark_type: Mapped[str] = mapped_column(String(16), nullable=False)
    value: Mapped[str] = mapped_column(String(240), nullable=False)
    start_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    end_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    char_start: Mapped[int] = mapped_column(Integer, nullable=False)
    char_end: Mapped[int] = mapped_column(Integer, nullable=False)

    audio_asset: Mapped[AudioAsset] = relationship(back_populates="speech_marks")
    paragraph: Mapped[Paragraph | None] = relationship()


class Illustration(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "illustrations"
    __table_args__ = (
        UniqueConstraint("content_version_id", "position"),
        CheckConstraint("position >= 0", name="non_negative_position"),
    )

    content_version_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    paragraph_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("paragraphs.id", ondelete="SET NULL"),
        index=True,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    uri: Mapped[str] = mapped_column(String(500), nullable=False)
    checksum: Mapped[str] = mapped_column(String(71), nullable=False)
    alt_text: Mapped[str | None] = mapped_column(Text)
    status: Mapped[ResourceStatus] = mapped_column(
        RESOURCE_STATUS_ENUM,
        nullable=False,
        default=ResourceStatus.PENDING,
    )

    version: Mapped[ContentVersion] = relationship()
    paragraph: Mapped[Paragraph | None] = relationship()


class ProcessingJob(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "processing_jobs"
    __table_args__ = (
        UniqueConstraint("idempotency_key"),
        CheckConstraint("progress_percent >= 0", name="non_negative_progress"),
        CheckConstraint("progress_percent <= 100", name="bounded_progress"),
        CheckConstraint("estimated_cost >= 0", name="non_negative_cost"),
    )

    content_version_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    language: Mapped[Language | None] = mapped_column(LANGUAGE_ENUM)
    job_type: Mapped[str] = mapped_column(String(80), nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(160), nullable=False)
    status: Mapped[JobStatus] = mapped_column(
        JOB_STATUS_ENUM,
        nullable=False,
        default=JobStatus.QUEUED,
        index=True,
    )
    stage: Mapped[str | None] = mapped_column(String(80))
    progress_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    estimated_cost: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False, default=0)
    error_code: Mapped[str | None] = mapped_column(String(80))
    error_detail: Mapped[str | None] = mapped_column(Text)

    version: Mapped[ContentVersion] = relationship()
