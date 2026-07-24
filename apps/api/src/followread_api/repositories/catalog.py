from dataclasses import dataclass

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from followread_api.models import (
    Audience,
    Category,
    Chapter,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    Language,
    Publication,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
)


@dataclass(frozen=True, slots=True)
class CatalogFilters:
    language: Language | None = None
    content_type: ContentType | None = None
    audience: Audience | None = None
    reading_level: ReadingLevelCode | None = None
    category_slug: str | None = None
    limit: int = 20
    offset: int = 0


@dataclass(frozen=True, slots=True)
class CatalogPage:
    items: list[ReadingContent]
    total: int
    limit: int
    offset: int


class PublishedCatalogRepository:
    """Read-only queries over complete, active publications."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def list(self, filters: CatalogFilters) -> CatalogPage:
        statement = self._apply_filters(self._published_statement(), filters)
        total_statement = select(func.count()).select_from(
            statement.with_only_columns(ReadingContent.id).order_by(None).subquery(),
        )
        total = self._session.scalar(total_statement) or 0

        items_statement = (
            statement.options(
                joinedload(ReadingContent.reading_level),
                selectinload(ReadingContent.categories),
                joinedload(ReadingContent.publication)
                .joinedload(Publication.version)
                .selectinload(ContentVersion.translations),
            )
            .order_by(ReadingContent.slug, ReadingContent.id)
            .limit(filters.limit)
            .offset(filters.offset)
        )
        items = list(self._session.scalars(items_statement).unique())
        return CatalogPage(
            items=items,
            total=total,
            limit=filters.limit,
            offset=filters.offset,
        )

    def get_by_slug(self, slug: str) -> ReadingContent | None:
        statement = (
            self._published_statement()
            .where(ReadingContent.slug == slug)
            .options(
                joinedload(ReadingContent.reading_level),
                selectinload(ReadingContent.categories),
                joinedload(ReadingContent.publication)
                .joinedload(Publication.version)
                .selectinload(ContentVersion.translations)
                .selectinload(ContentTranslation.chapters)
                .selectinload(Chapter.paragraphs),
            )
        )
        return self._session.scalars(statement).unique().one_or_none()

    @staticmethod
    def _published_statement() -> Select[tuple[ReadingContent]]:
        return (
            select(ReadingContent)
            .join(Publication, Publication.reading_content_id == ReadingContent.id)
            .join(ContentVersion, ContentVersion.id == Publication.content_version_id)
            .where(
                Publication.is_active.is_(True),
                ContentVersion.status == EditorialStatus.PUBLISHED,
                ContentVersion.checksum.is_not(None),
                ContentVersion.package_url.is_not(None),
            )
        )

    @staticmethod
    def _apply_filters(
        statement: Select[tuple[ReadingContent]],
        filters: CatalogFilters,
    ) -> Select[tuple[ReadingContent]]:
        if filters.language is not None:
            statement = statement.where(
                ContentVersion.translations.any(
                    ContentTranslation.language == filters.language,
                ),
            )
        if filters.content_type is not None:
            statement = statement.where(ReadingContent.content_type == filters.content_type)
        if filters.audience is not None:
            statement = statement.where(ReadingContent.audience == filters.audience)
        if filters.reading_level is not None:
            statement = statement.where(
                ReadingContent.reading_level.has(ReadingLevel.code == filters.reading_level),
            )
        if filters.category_slug is not None:
            statement = statement.where(
                ReadingContent.categories.any(Category.slug == filters.category_slug),
            )
        return statement
