from datetime import datetime
from typing import cast
from uuid import UUID

from pydantic import BaseModel

from followread_api.models import (
    Audience,
    ContentTranslation,
    ContentType,
    ContentVersion,
    Language,
    Publication,
    ReadingContent,
    ReadingLevelCode,
)
from followread_api.repositories import CatalogPage


class ReadingLevelResponse(BaseModel):
    code: ReadingLevelCode
    label: str


class CategoryResponse(BaseModel):
    slug: str
    name: str


class CatalogItemResponse(BaseModel):
    id: UUID
    slug: str
    content_type: ContentType
    audience: Audience
    reading_level: ReadingLevelResponse
    categories: list[CategoryResponse]
    languages: list[Language]
    version: int
    checksum: str
    package_url: str
    minimum_app_version: str
    published_at: datetime


class CatalogPageResponse(BaseModel):
    items: list[CatalogItemResponse]
    total: int
    limit: int
    offset: int


class ParagraphResponse(BaseModel):
    stable_key: str
    position: int
    text: str


class ChapterResponse(BaseModel):
    stable_key: str
    position: int
    title: str | None
    paragraphs: list[ParagraphResponse]


class TranslationResponse(BaseModel):
    language: Language
    title: str
    summary: str | None
    chapters: list[ChapterResponse]


class ContentDetailResponse(CatalogItemResponse):
    translations: list[TranslationResponse]


def catalog_page_response(page: CatalogPage) -> CatalogPageResponse:
    return CatalogPageResponse(
        items=[catalog_item_response(content) for content in page.items],
        total=page.total,
        limit=page.limit,
        offset=page.offset,
    )


def catalog_item_response(content: ReadingContent) -> CatalogItemResponse:
    publication = cast(Publication, content.publication)
    version = publication.version
    return CatalogItemResponse(
        id=content.id,
        slug=content.slug,
        content_type=content.content_type,
        audience=content.audience,
        reading_level=ReadingLevelResponse(
            code=content.reading_level.code,
            label=content.reading_level.label,
        ),
        categories=[
            CategoryResponse(slug=category.slug, name=category.name)
            for category in sorted(content.categories, key=lambda item: item.slug)
        ],
        languages=_languages(version),
        version=version.version_number,
        checksum=cast(str, version.checksum),
        package_url=cast(str, version.package_url),
        minimum_app_version=version.minimum_app_version,
        published_at=publication.published_at,
    )


def content_detail_response(content: ReadingContent) -> ContentDetailResponse:
    item = catalog_item_response(content)
    publication = cast(Publication, content.publication)
    return ContentDetailResponse(
        **item.model_dump(),
        translations=[
            _translation_response(translation)
            for translation in sorted(
                publication.version.translations,
                key=lambda value: value.language.value,
            )
        ],
    )


def _languages(version: ContentVersion) -> list[Language]:
    return sorted(
        (translation.language for translation in version.translations),
        key=lambda language: language.value,
    )


def _translation_response(translation: ContentTranslation) -> TranslationResponse:
    return TranslationResponse(
        language=translation.language,
        title=translation.title,
        summary=translation.summary,
        chapters=[
            ChapterResponse(
                stable_key=chapter.stable_key,
                position=chapter.position,
                title=chapter.title,
                paragraphs=[
                    ParagraphResponse(
                        stable_key=paragraph.stable_key,
                        position=paragraph.position,
                        text=paragraph.text,
                    )
                    for paragraph in sorted(
                        chapter.paragraphs,
                        key=lambda value: value.position,
                    )
                ],
            )
            for chapter in sorted(translation.chapters, key=lambda value: value.position)
        ],
    )
