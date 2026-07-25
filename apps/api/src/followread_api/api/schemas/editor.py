from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from followread_api.models import Language
from followread_api.services import (
    EditorChapter,
    EditorDocument,
    EditorParagraph,
    EditorTranslation,
)


class EditorParagraphPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    stable_key: str = Field(min_length=1, max_length=120)
    position: int = Field(ge=0)
    text: str = Field(min_length=1)

    def to_domain(self) -> EditorParagraph:
        return EditorParagraph(**self.model_dump())


class EditorChapterPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    stable_key: str = Field(min_length=1, max_length=120)
    position: int = Field(ge=0)
    title: str | None = Field(default=None, max_length=240)
    paragraphs: list[EditorParagraphPayload] = Field(min_length=1)

    @field_validator("paragraphs")
    @classmethod
    def paragraph_positions_are_unique(
        cls,
        paragraphs: list[EditorParagraphPayload],
    ) -> list[EditorParagraphPayload]:
        if len({paragraph.position for paragraph in paragraphs}) != len(paragraphs):
            raise ValueError("Paragraph positions must be unique.")
        return paragraphs

    def to_domain(self) -> EditorChapter:
        return EditorChapter(
            stable_key=self.stable_key,
            position=self.position,
            title=self.title,
            paragraphs=tuple(paragraph.to_domain() for paragraph in self.paragraphs),
        )


class EditorTranslationPayload(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    language: Language
    title: str = Field(min_length=2, max_length=240)
    summary: str | None = None
    chapters: list[EditorChapterPayload] = Field(default_factory=list)

    @field_validator("chapters")
    @classmethod
    def chapter_positions_are_unique(
        cls,
        chapters: list[EditorChapterPayload],
    ) -> list[EditorChapterPayload]:
        if len({chapter.position for chapter in chapters}) != len(chapters):
            raise ValueError("Chapter positions must be unique.")
        return chapters

    def to_domain(self) -> EditorTranslation:
        return EditorTranslation(
            language=self.language,
            title=self.title,
            summary=self.summary,
            chapters=tuple(chapter.to_domain() for chapter in self.chapters),
        )


class SaveEditorDocumentRequest(BaseModel):
    expected_updated_at: datetime
    translations: list[EditorTranslationPayload] = Field(min_length=1, max_length=2)

    @field_validator("translations")
    @classmethod
    def languages_are_unique(
        cls,
        translations: list[EditorTranslationPayload],
    ) -> list[EditorTranslationPayload]:
        if len({translation.language for translation in translations}) != len(translations):
            raise ValueError("Translation languages must be unique.")
        return translations


class EditorDocumentResponse(BaseModel):
    content_id: UUID
    content_version_id: UUID
    slug: str
    version: int
    status: str
    updated_at: datetime
    translations: list[EditorTranslationPayload]


def editor_document_response(document: EditorDocument) -> EditorDocumentResponse:
    return EditorDocumentResponse(
        content_id=document.content_id,
        content_version_id=document.content_version_id,
        slug=document.slug,
        version=document.version,
        status=document.status,
        updated_at=document.updated_at,
        translations=[
            EditorTranslationPayload(
                language=translation.language,
                title=translation.title,
                summary=translation.summary,
                chapters=[
                    EditorChapterPayload(
                        stable_key=chapter.stable_key,
                        position=chapter.position,
                        title=chapter.title,
                        paragraphs=[
                            EditorParagraphPayload(
                                stable_key=paragraph.stable_key,
                                position=paragraph.position,
                                text=paragraph.text,
                            )
                            for paragraph in chapter.paragraphs
                        ],
                    )
                    for chapter in translation.chapters
                ],
            )
            for translation in document.translations
        ],
    )
