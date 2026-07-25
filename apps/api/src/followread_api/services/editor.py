from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import (
    AuditLog,
    Chapter,
    ContentTranslation,
    ContentVersion,
    Language,
    Paragraph,
    ReadingContent,
    utc_now,
)
from followread_api.services.errors import ContentNotFoundError, EditorConflictError


@dataclass(frozen=True)
class EditorParagraph:
    stable_key: str
    position: int
    text: str


@dataclass(frozen=True)
class EditorChapter:
    stable_key: str
    position: int
    title: str | None
    paragraphs: tuple[EditorParagraph, ...]


@dataclass(frozen=True)
class EditorTranslation:
    language: Language
    title: str
    summary: str | None
    chapters: tuple[EditorChapter, ...]


@dataclass(frozen=True)
class EditorDocument:
    content_id: UUID
    slug: str
    version: int
    status: str
    updated_at: datetime
    translations: tuple[EditorTranslation, ...]


class EditorialEditorService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_document(self, content_id: UUID) -> EditorDocument:
        content, version = self._load(content_id)
        return self._document(content, version)

    def save_document(
        self,
        content_id: UUID,
        *,
        expected_updated_at: datetime,
        translations: tuple[EditorTranslation, ...],
        actor_user_id: UUID,
        correlation_id: str,
    ) -> EditorDocument:
        content, version = self._load(content_id)
        if self._as_utc(version.updated_at) != self._as_utc(expected_updated_at):
            raise EditorConflictError

        for translation in list(version.translations):
            self._session.delete(translation)
        self._session.flush()
        version.translations = [
            ContentTranslation(
                language=translation.language,
                title=translation.title,
                summary=translation.summary,
                chapters=[
                    Chapter(
                        stable_key=chapter.stable_key,
                        position=chapter.position,
                        title=chapter.title,
                        paragraphs=[
                            Paragraph(
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
            for translation in translations
        ]
        version.updated_at = utc_now()
        self._session.add(
            AuditLog(
                actor_user_id=actor_user_id,
                action="content.editor_saved",
                target_type="content",
                target_id=content.id,
                outcome="succeeded",
                correlation_id=correlation_id,
                event_metadata={"version": version.version_number},
            ),
        )
        self._session.flush()
        document = self._document(content, version)
        self._session.commit()
        return document

    def _load(self, content_id: UUID) -> tuple[ReadingContent, ContentVersion]:
        content = self._session.scalar(
            select(ReadingContent)
            .where(ReadingContent.id == content_id)
            .options(
                selectinload(ReadingContent.versions)
                .selectinload(ContentVersion.translations)
                .selectinload(ContentTranslation.chapters)
                .selectinload(Chapter.paragraphs),
            ),
        )
        if content is None or not content.versions:
            raise ContentNotFoundError(str(content_id))
        return content, max(content.versions, key=lambda item: item.version_number)

    @staticmethod
    def _document(content: ReadingContent, version: ContentVersion) -> EditorDocument:
        return EditorDocument(
            content_id=content.id,
            slug=content.slug,
            version=version.version_number,
            status=version.status.value,
            updated_at=version.updated_at,
            translations=tuple(
                EditorTranslation(
                    language=translation.language,
                    title=translation.title,
                    summary=translation.summary,
                    chapters=tuple(
                        EditorChapter(
                            stable_key=chapter.stable_key,
                            position=chapter.position,
                            title=chapter.title,
                            paragraphs=tuple(
                                EditorParagraph(
                                    stable_key=paragraph.stable_key,
                                    position=paragraph.position,
                                    text=paragraph.text,
                                )
                                for paragraph in sorted(
                                    chapter.paragraphs,
                                    key=lambda value: value.position,
                                )
                            ),
                        )
                        for chapter in sorted(
                            translation.chapters,
                            key=lambda value: value.position,
                        )
                    ),
                )
                for translation in sorted(
                    version.translations,
                    key=lambda value: value.language.value,
                )
            ),
        )

    @staticmethod
    def _as_utc(value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC)
