from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from followread_api.models import Audience, ContentType, EditorialStatus, Language, ReadingLevelCode
from followread_api.services.editorial_catalog import (
    CreateEditorialContent,
    EditorialCatalogItem,
    EditorialCatalogPage,
)


class CreateEditorialContentRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    slug: str = Field(
        min_length=3,
        max_length=120,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    title: str = Field(min_length=2, max_length=240)
    content_type: ContentType
    audience: Audience
    reading_level: ReadingLevelCode
    languages: list[Language] = Field(min_length=1, max_length=2)
    categories: list[str] = Field(default_factory=list, max_length=5)

    @field_validator("languages")
    @classmethod
    def languages_are_unique(cls, languages: list[Language]) -> list[Language]:
        if len(set(languages)) != len(languages):
            raise ValueError("Languages must be unique.")
        return languages

    @field_validator("categories")
    @classmethod
    def categories_are_valid(cls, categories: list[str]) -> list[str]:
        if len(set(categories)) != len(categories):
            raise ValueError("Categories must be unique.")
        if any(
            len(category) > 80
            or not category
            or any(
                character not in "abcdefghijklmnopqrstuvwxyz0123456789-" for character in category
            )
            for category in categories
        ):
            raise ValueError("Categories must use lowercase slugs.")
        return categories

    def to_command(self) -> CreateEditorialContent:
        return CreateEditorialContent(
            slug=self.slug,
            title=self.title,
            content_type=self.content_type,
            audience=self.audience,
            reading_level=self.reading_level,
            languages=tuple(self.languages),
            categories=tuple(self.categories),
        )


class EditorialCatalogItemResponse(BaseModel):
    id: UUID
    slug: str
    title: str
    content_type: ContentType
    audience: str
    languages: list[Language]
    version: int
    status: EditorialStatus
    updated_at: datetime
    actions: list[str]


class EditorialCatalogPageResponse(BaseModel):
    items: list[EditorialCatalogItemResponse]
    total: int
    limit: int
    offset: int


def editorial_catalog_page_response(page: EditorialCatalogPage) -> EditorialCatalogPageResponse:
    return EditorialCatalogPageResponse(
        items=[
            EditorialCatalogItemResponse(
                id=item.id,
                slug=item.slug,
                title=item.title,
                content_type=item.content_type,
                audience=item.audience,
                languages=list(item.languages),
                version=item.version,
                status=item.status,
                updated_at=item.updated_at,
                actions=list(item.actions),
            )
            for item in page.items
        ],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


def editorial_catalog_item_response(item: EditorialCatalogItem) -> EditorialCatalogItemResponse:
    return EditorialCatalogItemResponse(
        id=item.id,
        slug=item.slug,
        title=item.title,
        content_type=item.content_type,
        audience=item.audience,
        languages=list(item.languages),
        version=item.version,
        status=item.status,
        updated_at=item.updated_at,
        actions=list(item.actions),
    )
