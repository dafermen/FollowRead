from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import (
    AudioAsset,
    Illustration,
    Language,
    Paragraph,
    Publication,
    ResourceStatus,
    SpeechMark,
)
from followread_api.repositories import PublishedCatalogRepository
from followread_api.services.errors import ContentNotFoundError, InvalidCatalogQueryError


@dataclass(frozen=True)
class ReaderMark:
    value: str
    start_ms: int
    end_ms: int
    char_start: int
    char_end: int
    paragraph_key: str
    chapter_key: str


@dataclass(frozen=True)
class ReaderAudio:
    uri: str
    duration_ms: int
    voice_id: str
    simulated: bool
    marks: tuple[ReaderMark, ...]


@dataclass(frozen=True)
class ReaderParagraph:
    stable_key: str
    text: str


@dataclass(frozen=True)
class ReaderChapter:
    stable_key: str
    title: str | None
    image_uri: str | None
    image_alt_text: str | None
    paragraphs: tuple[ReaderParagraph, ...]


@dataclass(frozen=True)
class ReaderTranslation:
    language: Language
    title: str
    summary: str | None
    chapters: tuple[ReaderChapter, ...]
    audio: ReaderAudio


@dataclass(frozen=True)
class ReaderPackage:
    content_id: UUID
    slug: str
    version: int
    cover_uri: str | None
    cover_alt_text: str | None
    translations: tuple[ReaderTranslation, ...]


class ReaderPackageService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_package(self, slug: str) -> ReaderPackage:
        content = PublishedCatalogRepository(self._session).get_by_slug(slug)
        if content is None or content.publication is None:
            raise ContentNotFoundError(slug)
        publication: Publication = content.publication
        version = publication.version
        assets: dict[Language, AudioAsset] = {}
        for candidate in self._session.scalars(
            select(AudioAsset)
            .where(AudioAsset.content_version_id == version.id)
            .options(
                selectinload(AudioAsset.speech_marks)
                .selectinload(SpeechMark.paragraph)
                .selectinload(Paragraph.chapter),
            )
            .order_by(AudioAsset.created_at.desc(), AudioAsset.id.desc()),
        ).all():
            assets.setdefault(candidate.language, candidate)
        illustrations = self._session.scalars(
            select(Illustration)
            .where(
                Illustration.content_version_id == version.id,
                Illustration.status == ResourceStatus.READY,
            )
            .order_by(Illustration.position),
        ).all()
        illustration_by_position = {item.position: item for item in illustrations}
        cover = illustration_by_position.get(0)
        if cover is None and illustrations:
            cover = illustrations[0]
        translations: list[ReaderTranslation] = []
        for translation in sorted(version.translations, key=lambda item: item.language.value):
            asset = assets.get(translation.language)
            if asset is None:
                raise InvalidCatalogQueryError(
                    "audio",
                    f"Published language {translation.language.value} has no audio.",
                )
            chapters: list[ReaderChapter] = []
            for chapter in sorted(
                translation.chapters,
                key=lambda item: item.position,
            ):
                # Position zero is the cover. Chapter illustrations use one-based positions, so
                # position 2 belongs to the second chapter in every language.
                chapter_illustration = illustration_by_position.get(chapter.position + 1)
                chapters.append(
                    ReaderChapter(
                        stable_key=chapter.stable_key,
                        title=chapter.title,
                        image_uri=(
                            chapter_illustration.uri if chapter_illustration is not None else None
                        ),
                        image_alt_text=(
                            chapter_illustration.alt_text
                            if chapter_illustration is not None
                            else None
                        ),
                        paragraphs=tuple(
                            ReaderParagraph(
                                stable_key=paragraph.stable_key,
                                text=paragraph.text,
                            )
                            for paragraph in sorted(
                                chapter.paragraphs,
                                key=lambda item: item.position,
                            )
                        ),
                    ),
                )
            translations.append(
                ReaderTranslation(
                    language=translation.language,
                    title=translation.title,
                    summary=translation.summary,
                    chapters=tuple(chapters),
                    audio=ReaderAudio(
                        uri=asset.uri,
                        duration_ms=asset.duration_ms,
                        voice_id=asset.voice_id,
                        simulated=not asset.uri.startswith(
                            ("/audio/", "http://", "https://"),
                        ),
                        marks=tuple(
                            self._mark(mark)
                            for mark in sorted(
                                asset.speech_marks,
                                key=lambda item: item.position,
                            )
                        ),
                    ),
                ),
            )
        return ReaderPackage(
            content_id=content.id,
            slug=content.slug,
            version=version.version_number,
            cover_uri=cover.uri if cover is not None else None,
            cover_alt_text=cover.alt_text if cover is not None else None,
            translations=tuple(translations),
        )

    @staticmethod
    def _mark(mark: SpeechMark) -> ReaderMark:
        paragraph = mark.paragraph
        if paragraph is None:
            raise InvalidCatalogQueryError("speech_marks", "A word has no paragraph mapping.")
        return ReaderMark(
            value=mark.value,
            start_ms=mark.start_ms,
            end_ms=mark.end_ms,
            char_start=mark.char_start,
            char_end=mark.char_end,
            paragraph_key=paragraph.stable_key,
            chapter_key=paragraph.chapter.stable_key,
        )
