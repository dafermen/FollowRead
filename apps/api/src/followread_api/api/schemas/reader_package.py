from pydantic import BaseModel

from followread_api.models import Language
from followread_api.services import ReaderPackage


class ReaderMarkResponse(BaseModel):
    value: str
    start_ms: int
    end_ms: int
    char_start: int
    char_end: int
    paragraph_key: str
    chapter_key: str


class ReaderAudioResponse(BaseModel):
    uri: str
    duration_ms: int
    voice_id: str
    simulated: bool
    marks: list[ReaderMarkResponse]


class ReaderParagraphResponse(BaseModel):
    stable_key: str
    text: str


class ReaderChapterResponse(BaseModel):
    stable_key: str
    title: str | None
    image_uri: str | None
    image_alt_text: str | None
    paragraphs: list[ReaderParagraphResponse]


class ReaderTranslationResponse(BaseModel):
    language: Language
    title: str
    summary: str | None
    chapters: list[ReaderChapterResponse]
    audio: ReaderAudioResponse


class ReaderPackageResponse(BaseModel):
    content_id: str
    slug: str
    version: int
    cover_uri: str | None
    cover_alt_text: str | None
    translations: list[ReaderTranslationResponse]


def reader_package_response(package: ReaderPackage) -> ReaderPackageResponse:
    return ReaderPackageResponse(
        content_id=str(package.content_id),
        slug=package.slug,
        version=package.version,
        cover_uri=package.cover_uri,
        cover_alt_text=package.cover_alt_text,
        translations=[
            ReaderTranslationResponse(
                language=translation.language,
                title=translation.title,
                summary=translation.summary,
                chapters=[
                    ReaderChapterResponse(
                        stable_key=chapter.stable_key,
                        title=chapter.title,
                        image_uri=chapter.image_uri,
                        image_alt_text=chapter.image_alt_text,
                        paragraphs=[
                            ReaderParagraphResponse(
                                stable_key=paragraph.stable_key,
                                text=paragraph.text,
                            )
                            for paragraph in chapter.paragraphs
                        ],
                    )
                    for chapter in translation.chapters
                ],
                audio=ReaderAudioResponse(
                    uri=translation.audio.uri,
                    duration_ms=translation.audio.duration_ms,
                    voice_id=translation.audio.voice_id,
                    simulated=translation.audio.simulated,
                    marks=[
                        ReaderMarkResponse(
                            value=mark.value,
                            start_ms=mark.start_ms,
                            end_ms=mark.end_ms,
                            char_start=mark.char_start,
                            char_end=mark.char_end,
                            paragraph_key=mark.paragraph_key,
                            chapter_key=mark.chapter_key,
                        )
                        for mark in translation.audio.marks
                    ],
                ),
            )
            for translation in package.translations
        ],
    )
