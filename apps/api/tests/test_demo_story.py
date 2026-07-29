from pathlib import Path

import pytest
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from followread_api.cli.seed_demo_story import STORY_SLUG, seed_demo_story
from followread_api.database import create_database_engine
from followread_api.models import AudioAsset, Base, SpeechMark
from followread_api.services import (
    ContentNotFoundError,
    InvalidCatalogQueryError,
    ReaderPackageService,
)


def test_demo_story_seed_is_publishable_bilingual_and_idempotent(tmp_path: Path) -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    cover = tmp_path / "cover.png"
    cover.write_bytes(b"original-cover")
    chapter_two = tmp_path / "chapter-2.png"
    chapter_two.write_bytes(b"chapter-two")
    with Session(engine) as session:
        content, created = seed_demo_story(
            session,
            cover_path=cover,
            chapter_two_path=chapter_two,
            audio_output_dir=tmp_path / "audio",
        )
        repeated, repeated_created = seed_demo_story(
            session,
            cover_path=cover,
            chapter_two_path=chapter_two,
            audio_output_dir=tmp_path / "audio",
        )
        package = ReaderPackageService(session).get_package(STORY_SLUG)

        assert created is True
        assert repeated_created is False
        assert repeated.id == content.id
        assert package.cover_alt_text is not None
        assert [item.language.value for item in package.translations] == ["en", "es"]
        assert all(item.audio.marks for item in package.translations)
        assert {chapter.stable_key for chapter in package.translations[0].chapters} == {
            "chapter-1",
            "chapter-2",
        }
        assert package.translations[0].chapters[0].image_uri is None
        assert package.translations[0].chapters[1].image_uri == (
            "/stories/el-zorro-y-la-luna-chapter-2.png"
        )
    engine.dispose()


def test_reader_package_reports_missing_audio_and_invalid_marks(tmp_path: Path) -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    cover = tmp_path / "cover.png"
    cover.write_bytes(b"cover")
    with Session(engine) as session:
        seed_demo_story(session, cover_path=cover, audio_output_dir=tmp_path / "audio")
        english_asset = session.scalar(
            select(AudioAsset).where(AudioAsset.voice_id == "Joanna"),
        )
        assert english_asset is not None
        session.execute(delete(SpeechMark).where(SpeechMark.audio_asset_id == english_asset.id))
        session.delete(english_asset)
        session.commit()
        with pytest.raises(InvalidCatalogQueryError) as missing_audio:
            ReaderPackageService(session).get_package(STORY_SLUG)
        assert "has no audio" in missing_audio.value.details["audio"]

        with pytest.raises(ContentNotFoundError):
            ReaderPackageService(session).get_package("missing-story")
    engine.dispose()


def test_reader_package_rejects_unmapped_speech_mark() -> None:
    mark = SpeechMark(
        position=0,
        mark_type="word",
        value="Lost",
        start_ms=0,
        end_ms=200,
        char_start=0,
        char_end=4,
    )
    with pytest.raises(InvalidCatalogQueryError) as invalid_mark:
        ReaderPackageService._mark(mark)
    assert "no paragraph mapping" in invalid_mark.value.details["speech_marks"]
