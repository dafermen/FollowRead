from dataclasses import dataclass, replace
from datetime import datetime
from typing import Literal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import (
    ContentType,
    ContentVersion,
    EditorialStatus,
    Language,
    ReadingContent,
)

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
