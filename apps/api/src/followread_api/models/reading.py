from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    CheckConstraint,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from followread_api.models.base import Base, TimestampMixin, UuidPrimaryKeyMixin
from followread_api.models.content import ContentVersion, Paragraph, ReadingContent
from followread_api.models.enums import DownloadStatus, Language
from followread_api.models.identity import User

LANGUAGE_ENUM = Enum(
    Language,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="vocabulary_language",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)
DOWNLOAD_STATUS_ENUM = Enum(
    DownloadStatus,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="download_status",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)


class ReadingProgress(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reading_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "reading_content_id"),
        UniqueConstraint("last_operation_id"),
        CheckConstraint("position_ms >= 0", name="non_negative_position"),
    )

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reading_content_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("reading_contents.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    content_version_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.id", ondelete="RESTRICT"),
        nullable=False,
    )
    stable_anchor: Mapped[str] = mapped_column(String(160), nullable=False)
    position_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_operation_id: Mapped[str] = mapped_column(String(160), nullable=False)

    user: Mapped[User] = relationship()
    content: Mapped[ReadingContent] = relationship()
    version: Mapped[ContentVersion] = relationship()


class Favorite(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "reading_content_id"),)

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reading_content_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("reading_contents.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    user: Mapped[User] = relationship()
    content: Mapped[ReadingContent] = relationship()


class VocabularyWord(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "vocabulary_words"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "content_version_id",
            "language",
            "normalized_word",
            "stable_anchor",
        ),
    )

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content_version_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    paragraph_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("paragraphs.id", ondelete="SET NULL")
    )
    language: Mapped[Language] = mapped_column(LANGUAGE_ENUM, nullable=False)
    word: Mapped[str] = mapped_column(String(160), nullable=False)
    normalized_word: Mapped[str] = mapped_column(String(160), nullable=False)
    stable_anchor: Mapped[str] = mapped_column(String(160), nullable=False)
    context: Mapped[str | None] = mapped_column(Text)

    user: Mapped[User] = relationship()
    version: Mapped[ContentVersion] = relationship()
    paragraph: Mapped[Paragraph | None] = relationship()


class DownloadRecord(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "download_records"
    __table_args__ = (
        UniqueConstraint("operation_id"),
        UniqueConstraint("user_id", "content_version_id", "client_id"),
    )

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content_version_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    client_id: Mapped[str] = mapped_column(String(160), nullable=False)
    operation_id: Mapped[str] = mapped_column(String(160), nullable=False)
    status: Mapped[DownloadStatus] = mapped_column(
        DOWNLOAD_STATUS_ENUM, nullable=False, default=DownloadStatus.REQUESTED, index=True
    )
    checksum: Mapped[str | None] = mapped_column(String(71))
    verified_at: Mapped[datetime | None]

    user: Mapped[User] = relationship()
    version: Mapped[ContentVersion] = relationship()
