from dataclasses import dataclass, replace
from datetime import datetime
from typing import Literal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import (
    Audience,
    AuditLog,
    Category,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    Language,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
)
from followread_api.services.errors import InvalidCatalogQueryError

EditorialSort = Literal["recent", "title", "status"]


@dataclass(frozen=True)
class EditorialCatalogFilters:
    search: str | None = None
    status: EditorialStatus | None = None
    content_type: ContentType | None = None
    sort: EditorialSort = "recent"
    limit: int = 10
    offset: int = 0


@dataclass(frozen=True)
class EditorialCatalogItem:
    id: UUID
    slug: str
    title: str
    content_type: ContentType
    audience: str
    languages: tuple[Language, ...]
    version: int
    status: EditorialStatus
    updated_at: datetime
    actions: tuple[str, ...]


@dataclass(frozen=True)
class EditorialCatalogPage:
    items: tuple[EditorialCatalogItem, ...]
    total: int
    limit: int
    offset: int


@dataclass(frozen=True)
class CreateEditorialContent:
    slug: str
    title: str
    content_type: ContentType
    audience: Audience
    reading_level: ReadingLevelCode
    languages: tuple[Language, ...]
    categories: tuple[str, ...]


class EditorialCatalogService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_content(
        self,
        filters: EditorialCatalogFilters,
        permissions: frozenset[str],
    ) -> EditorialCatalogPage:
        contents = self._session.scalars(
            select(ReadingContent).options(
                selectinload(ReadingContent.versions).selectinload(ContentVersion.translations),
            ),
        ).all()
        items = [
            self._item(content, max(content.versions, key=lambda version: version.version_number))
            for content in contents
            if content.versions
        ]
        search = (filters.search or "").strip().casefold()
        filtered = [
            item
            for item in items
            if (not search or search in f"{item.title} {item.slug}".casefold())
            and (filters.status is None or item.status == filters.status)
            and (filters.content_type is None or item.content_type == filters.content_type)
        ]
        sort_keys = {
            "recent": lambda item: (-item.updated_at.timestamp(), item.title.casefold()),
            "title": lambda item: (item.title.casefold(),),
            "status": lambda item: (item.status.value, item.title.casefold()),
        }
        ordered = sorted(filtered, key=sort_keys[filters.sort])
        page_items = tuple(
            replace(item, actions=self._actions(item.status, permissions))
            for item in ordered[filters.offset : filters.offset + filters.limit]
        )
        return EditorialCatalogPage(
            items=page_items,
            total=len(filtered),
            limit=filters.limit,
            offset=filters.offset,
        )

    def create_draft(
        self,
        command: CreateEditorialContent,
        *,
        actor_user_id: UUID,
        permissions: frozenset[str],
        correlation_id: str,
    ) -> EditorialCatalogItem:
        existing = self._session.scalar(
            select(ReadingContent).where(ReadingContent.slug == command.slug),
        )
        if existing is not None:
            raise InvalidCatalogQueryError("slug", "A content item already uses this slug.")

        level = self._session.scalar(
            select(ReadingLevel).where(ReadingLevel.code == command.reading_level),
        )
        if level is None:
            level_codes = list(ReadingLevelCode)
            level = ReadingLevel(
                code=command.reading_level,
                label=command.reading_level.value.replace("-", " ").title(),
                display_order=level_codes.index(command.reading_level),
            )
            self._session.add(level)

        stored_categories = {
            category.slug: category
            for category in self._session.scalars(
                select(Category).where(Category.slug.in_(command.categories)),
            ).all()
        }
        categories = [
            stored_categories.get(slug) or Category(slug=slug, name=slug.replace("-", " ").title())
            for slug in command.categories
        ]
        version = ContentVersion(
            version_number=1,
            status=EditorialStatus.DRAFT,
            minimum_app_version="1.0.0",
            translations=[
                ContentTranslation(language=language, title=command.title)
                for language in command.languages
            ],
        )
        content = ReadingContent(
            slug=command.slug,
            content_type=command.content_type,
            audience=command.audience,
            reading_level=level,
            categories=categories,
            versions=[version],
        )
        self._session.add(content)
        self._session.flush()
        self._session.add(
            AuditLog(
                actor_user_id=actor_user_id,
                action="content.created",
                target_type="content",
                target_id=content.id,
                outcome="succeeded",
                correlation_id=correlation_id,
                event_metadata={"slug": command.slug},
            ),
        )
        item = replace(
            self._item(content, version),
            actions=self._actions(version.status, permissions),
        )
        self._session.commit()
        return item

    @staticmethod
    def _item(content: ReadingContent, version: ContentVersion) -> EditorialCatalogItem:
        translations = sorted(
            version.translations,
            key=lambda translation: (
                translation.language != Language.SPANISH,
                translation.language.value,
            ),
        )
        return EditorialCatalogItem(
            id=content.id,
            slug=content.slug,
            title=translations[0].title if translations else content.slug.replace("-", " ").title(),
            content_type=content.content_type,
            audience=content.audience.value,
            languages=tuple(
                sorted(
                    (translation.language for translation in version.translations),
                    key=lambda language: language.value,
                ),
            ),
            version=version.version_number,
            status=version.status,
            updated_at=version.updated_at,
            actions=(),
        )

    @staticmethod
    def _actions(status: EditorialStatus, permissions: frozenset[str]) -> tuple[str, ...]:
        actions = ["view"]
        if "content.edit" in permissions and status not in {
            EditorialStatus.PUBLISHED,
            EditorialStatus.ARCHIVED,
        }:
            actions.append("edit")
        if "content.process" in permissions and status in {
            EditorialStatus.DRAFT,
            EditorialStatus.PROCESSING_FAILED,
            EditorialStatus.REVIEW_REJECTED,
        }:
            actions.append("process")
        if "content.review" in permissions and status == EditorialStatus.READY_FOR_REVIEW:
            actions.append("review")
        if "content.publish" in permissions and status == EditorialStatus.APPROVED:
            actions.append("publish")
        return tuple(actions)
