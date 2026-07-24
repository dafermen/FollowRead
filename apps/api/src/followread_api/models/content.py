from datetime import datetime
from uuid import UUID

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from followread_api.models.base import Base, TimestampMixin, UuidPrimaryKeyMixin
from followread_api.models.enums import (
    Audience,
    ContentType,
    EditorialStatus,
    Language,
    ReadingLevelCode,
)


def enum_values(enum_type: type[ContentType]) -> list[str]:
    return [member.value for member in enum_type]


CONTENT_TYPE_ENUM = Enum(
    ContentType,
    values_callable=enum_values,
    name="content_type",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)
AUDIENCE_ENUM = Enum(
    Audience,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="audience",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)
READING_LEVEL_ENUM = Enum(
    ReadingLevelCode,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="reading_level_code",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)
EDITORIAL_STATUS_ENUM = Enum(
    EditorialStatus,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="editorial_status",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)
LANGUAGE_ENUM = Enum(
    Language,
    values_callable=lambda enum_type: [member.value for member in enum_type],
    name="language",
    native_enum=False,
    create_constraint=True,
    validate_strings=True,
)

content_categories = Table(
    "content_categories",
    Base.metadata,
    Column(
        "reading_content_id",
        Uuid(as_uuid=True),
        ForeignKey("reading_contents.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        Uuid(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        primary_key=True,
    ),
)


class ReadingLevel(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reading_levels"
    __table_args__ = (
        UniqueConstraint("code"),
        UniqueConstraint("display_order"),
        CheckConstraint("display_order >= 0", name="non_negative_display_order"),
    )

    code: Mapped[ReadingLevelCode] = mapped_column(READING_LEVEL_ENUM, nullable=False)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)

    contents: Mapped[list["ReadingContent"]] = relationship(back_populates="reading_level")


class Category(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("slug"),)

    slug: Mapped[str] = mapped_column(String(80), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    contents: Mapped[list["ReadingContent"]] = relationship(
        secondary=content_categories,
        back_populates="categories",
    )


class ReadingContent(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reading_contents"
    __table_args__ = (UniqueConstraint("slug"),)

    slug: Mapped[str] = mapped_column(String(120), nullable=False)
    content_type: Mapped[ContentType] = mapped_column(CONTENT_TYPE_ENUM, nullable=False)
    audience: Mapped[Audience] = mapped_column(AUDIENCE_ENUM, nullable=False)
    reading_level_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("reading_levels.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    reading_level: Mapped[ReadingLevel] = relationship(back_populates="contents")
    categories: Mapped[list[Category]] = relationship(
        secondary=content_categories,
        back_populates="contents",
    )
    versions: Mapped[list["ContentVersion"]] = relationship(
        back_populates="content",
        passive_deletes=True,
        order_by="ContentVersion.version_number",
    )
    publication: Mapped["Publication | None"] = relationship(
        back_populates="content",
        passive_deletes=True,
        uselist=False,
    )


class ContentVersion(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "content_versions"
    __table_args__ = (
        UniqueConstraint("reading_content_id", "version_number"),
        CheckConstraint("version_number > 0", name="positive_version_number"),
    )

    reading_content_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("reading_contents.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[EditorialStatus] = mapped_column(
        EDITORIAL_STATUS_ENUM,
        nullable=False,
        default=EditorialStatus.DRAFT,
        index=True,
    )
    checksum: Mapped[str | None] = mapped_column(String(71))
    package_url: Mapped[str | None] = mapped_column(String(500))
    minimum_app_version: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="1.0.0",
    )

    content: Mapped[ReadingContent] = relationship(back_populates="versions")
    translations: Mapped[list["ContentTranslation"]] = relationship(
        back_populates="version",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    publication: Mapped["Publication | None"] = relationship(
        back_populates="version",
        passive_deletes=True,
        uselist=False,
    )


class ContentTranslation(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "content_translations"
    __table_args__ = (UniqueConstraint("content_version_id", "language"),)

    content_version_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    language: Mapped[Language] = mapped_column(LANGUAGE_ENUM, nullable=False)
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text)

    version: Mapped[ContentVersion] = relationship(back_populates="translations")
    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="translation",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Chapter.position",
    )


class Chapter(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "chapters"
    __table_args__ = (
        UniqueConstraint("content_translation_id", "stable_key"),
        UniqueConstraint("content_translation_id", "position"),
        CheckConstraint("position >= 0", name="non_negative_position"),
    )

    content_translation_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_translations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    stable_key: Mapped[str] = mapped_column(String(120), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str | None] = mapped_column(String(240))

    translation: Mapped[ContentTranslation] = relationship(back_populates="chapters")
    paragraphs: Mapped[list["Paragraph"]] = relationship(
        back_populates="chapter",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Paragraph.position",
    )


class Paragraph(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "paragraphs"
    __table_args__ = (
        UniqueConstraint("chapter_id", "stable_key"),
        UniqueConstraint("chapter_id", "position"),
        CheckConstraint("position >= 0", name="non_negative_position"),
        CheckConstraint("length(trim(text)) > 0", name="non_empty_text"),
    )

    chapter_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("chapters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    stable_key: Mapped[str] = mapped_column(String(120), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    chapter: Mapped[Chapter] = relationship(back_populates="paragraphs")


class Publication(UuidPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "publications"
    __table_args__ = (
        UniqueConstraint("reading_content_id"),
        UniqueConstraint("content_version_id"),
    )

    reading_content_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("reading_contents.id", ondelete="RESTRICT"),
        nullable=False,
    )
    content_version_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("content_versions.id", ondelete="RESTRICT"),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    published_at: Mapped[datetime] = mapped_column(nullable=False)
    unpublished_at: Mapped[datetime | None]

    content: Mapped[ReadingContent] = relationship(back_populates="publication")
    version: Mapped[ContentVersion] = relationship(back_populates="publication")
