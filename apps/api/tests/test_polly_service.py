from datetime import UTC, datetime
from decimal import Decimal
from io import BytesIO
from pathlib import Path
from types import SimpleNamespace
from typing import Any
from uuid import UUID, uuid4

import pytest
from httpx import Client, MockTransport, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from followread_api.api import dependencies
from followread_api.config import Settings
from followread_api.database import create_database_engine
from followread_api.models import (
    Audience,
    AudioAsset,
    Base,
    Chapter,
    ContentTranslation,
    ContentType,
    ContentVersion,
    EditorialStatus,
    JobStatus,
    Language,
    Paragraph,
    ProcessingJob,
    Publication,
    ReadingContent,
    ReadingLevel,
    ReadingLevelCode,
    ResourceStatus,
    SpeechMark,
)
from followread_api.services import (
    AwsPollyAdapter,
    ContentNotFoundError,
    FakePollyAdapter,
    InvalidCatalogQueryError,
    LocalAudioStorage,
    OpenAITtsAdapter,
    PollyProcessingService,
    ReaderPackageService,
    RetryingPollyAdapter,
    TextChunker,
)
from followread_api.services.package_integrity import reader_package_checksum
from followread_api.services.polly import PollyAdapter, SynthesizedChunk


class MemoryStorage:
    def __init__(self) -> None:
        self.payloads: dict[str, bytes] = {}

    def store(self, filename: str, payload: bytes) -> str:
        self.payloads[filename] = payload
        return f"memory://{filename}"

    def exists(self, uri: str) -> bool:
        return uri.removeprefix("memory://") in self.payloads


class CountingAdapter:
    cache_identity = "counting:v1"

    def __init__(self) -> None:
        self.calls = 0

    def synthesize(self, text: str, voice_id: str, language: Language) -> SynthesizedChunk:
        self.calls += 1
        return FakePollyAdapter().synthesize(text, voice_id, language)


class FailingAdapter:
    def synthesize(
        self,
        text: str,
        voice_id: str,
        language: Language,
    ) -> SynthesizedChunk:
        del text, voice_id, language
        raise RuntimeError("simulated provider failure")


class StubAwsClient:
    def synthesize_speech(self, **kwargs: object) -> dict[str, Any]:
        if kwargs["OutputFormat"] == "mp3":
            return {"AudioStream": BytesIO(b"aws-mp3")}
        return {
            "AudioStream": BytesIO(
                b'{"time":0,"type":"word","start":0,"end":4,"value":"Hola"}\n'
                b'{"time":300,"type":"word","start":5,"end":10,"value":"Mundo"}\n'
            ),
        }


class FlakyAdapter:
    def __init__(self) -> None:
        self.calls = 0

    def synthesize(self, text: str, voice_id: str, language: Language) -> SynthesizedChunk:
        self.calls += 1
        if self.calls < 3:
            raise RuntimeError("temporary")
        return FakePollyAdapter().synthesize(text, voice_id, language)


def test_aws_adapter_parses_speech_marks_and_retry_policy() -> None:
    adapter = AwsPollyAdapter(StubAwsClient())
    generated = adapter.synthesize("Hola Mundo", "Lucia", Language.SPANISH)
    assert generated.audio == b"aws-mp3"
    assert generated.duration_ms == 580
    assert [mark.value for mark in generated.marks] == ["Hola", "Mundo"]
    assert generated.marks[0].end_ms == 300
    assert generated.marks[1].end_ms == 580

    flaky = FlakyAdapter()
    retried = RetryingPollyAdapter(flaky).synthesize(
        "Hola Mundo",
        "Lucia",
        Language.SPANISH,
    )
    assert retried.audio.startswith(b"FOLLOWREAD_FAKE_MP3")
    assert flaky.calls == 3
    with pytest.raises(RuntimeError, match="simulated provider failure"):
        RetryingPollyAdapter(FailingAdapter(), maximum_attempts=2).synthesize(
            "Hola",
            "Lucia",
            Language.SPANISH,
        )
    with pytest.raises(RuntimeError, match="no readable AudioStream"):
        AwsPollyAdapter._read_stream({})


def test_openai_adapter_generates_natural_audio_and_word_alignment() -> None:
    requests: list[Request] = []

    def respond(request: Request) -> Response:
        requests.append(request)
        if request.url.path.endswith("/speech"):
            return Response(200, content=b"ID3-openai-audio")
        return Response(
            200,
            json={
                "duration": 1.2,
                "words": [
                    {"word": "Hola", "start": 0.0, "end": 0.5},
                    {"word": "luna", "start": 0.55, "end": 1.2},
                ],
            },
        )

    adapter = OpenAITtsAdapter(
        "test-secret",
        tts_model="gpt-4o-mini-tts-2025-12-15",
        alignment_model="whisper-1",
        client=Client(transport=MockTransport(respond)),
    )
    generated = adapter.synthesize("Hola luna", "marin", Language.SPANISH)

    assert generated.audio == b"ID3-openai-audio"
    assert generated.duration_ms == 1200
    assert [(mark.value, mark.start_ms, mark.end_ms) for mark in generated.marks] == [
        ("Hola", 0, 500),
        ("luna", 550, 1200),
    ]
    assert len(requests) == 2
    assert all(request.headers["authorization"] == "Bearer test-secret" for request in requests)
    assert b'"voice":"marin"' in requests[0].content
    assert b'name="timestamp_granularities[]"' in requests[1].content


def test_openai_alignment_falls_back_to_monotonic_editorial_words() -> None:
    marks = OpenAITtsAdapter._aligned_marks(
        "bien-estar siempre",
        [{"word": "bien"}, {"word": "estar"}, {"word": "siempre"}],
        1000,
    )

    assert [mark.value for mark in marks] == ["bien-estar", "siempre"]
    assert marks[0].start_ms == 0
    assert marks[0].end_ms <= marks[1].start_ms
    assert marks[-1].end_ms == 1000


def test_processing_dependency_can_select_the_aws_boundary(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    module = SimpleNamespace(client=lambda _name: StubAwsClient())
    monkeypatch.setattr(dependencies, "import_module", lambda _name: module)
    monkeypatch.setattr(
        dependencies,
        "get_settings",
        lambda: Settings(polly_provider="aws"),
    )
    with Session(engine) as session:
        service = dependencies.get_processing_service(session)
        assert isinstance(service._adapter, RetryingPollyAdapter)


def test_processing_dependency_requires_an_openai_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    monkeypatch.setattr(
        dependencies,
        "get_settings",
        lambda: Settings(polly_provider="openai", openai_api_key=None),
    )
    with Session(engine) as session, pytest.raises(RuntimeError, match="OPENAI_API_KEY"):
        dependencies.get_processing_service(session)
    engine.dispose()


def test_fake_polly_processing_generates_audio_marks_cost_and_idempotency() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    storage = MemoryStorage()
    adapter = CountingAdapter()
    with Session(engine) as session:
        version_id = _seed_version(session, Language.ENGLISH, "Hello world. Follow Read.")
        service = _service(session, storage=storage, adapter=adapter)

        job = service.process(
            content_version_id=version_id,
            language=Language.ENGLISH,
            voice_id="Joanna",
            idempotency_key="english-audio-v1",
        )
        repeated = service.process(
            content_version_id=version_id,
            language=Language.ENGLISH,
            voice_id="Joanna",
            idempotency_key="english-audio-v1",
        )
        regenerated = service.process(
            content_version_id=version_id,
            language=Language.ENGLISH,
            voice_id="Joanna",
            idempotency_key="english-audio-v2",
        )

        assert repeated.id == job.id
        assert job.status == JobStatus.SUCCEEDED
        assert regenerated.status == JobStatus.SUCCEEDED
        assert regenerated.stage == "cached"
        assert regenerated.estimated_cost == 0
        assert adapter.calls == 1
        assert job.progress_percent == 100
        assert job.estimated_cost > 0
        assert len(storage.payloads) == 1
        assert len(session.scalars(select(AudioAsset)).all()) == 1
        asset = session.scalar(select(AudioAsset))
        assert asset is not None
        assert asset.status == ResourceStatus.READY
        assert asset.source_checksum is not None
        assert service._voice_from_failed_job(job) == "Joanna"
        marks = session.scalars(select(SpeechMark).order_by(SpeechMark.position)).all()
        assert [mark.value for mark in marks] == ["Hello", "world.", "Follow", "Read."]
        assert all(mark.paragraph_id is not None for mark in marks)
        assert service.list_jobs()[0].id == regenerated.id
        assert service.cancel(job.id).status == JobStatus.SUCCEEDED

    engine.dispose()


def test_audio_cache_invalidates_when_text_changes_or_file_is_missing() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    storage = MemoryStorage()
    adapter = CountingAdapter()
    with Session(engine) as session:
        version_id = _seed_version(session, Language.SPANISH, "Hola luna.")
        service = _service(session, storage=storage, adapter=adapter)

        first = service.process(
            content_version_id=version_id,
            language=Language.SPANISH,
            voice_id="Lucia",
            idempotency_key="cache-invalidation-v1",
        )
        paragraph = session.scalar(select(Paragraph))
        assert paragraph is not None
        paragraph.text = "Hola luna brillante."
        session.commit()
        changed = service.process(
            content_version_id=version_id,
            language=Language.SPANISH,
            voice_id="Lucia",
            idempotency_key="cache-invalidation-v2",
        )
        storage.payloads.clear()
        missing = service.process(
            content_version_id=version_id,
            language=Language.SPANISH,
            voice_id="Lucia",
            idempotency_key="cache-invalidation-v3",
        )

        assert first.stage == "completed"
        assert changed.stage == "completed"
        assert missing.stage == "completed"
        assert adapter.calls == 3

    engine.dispose()


def test_processing_refreshes_the_checksum_of_an_active_publication() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        version_id = _seed_version(session, Language.SPANISH, "Hola luna.")
        service = _service(session)
        service.process(
            content_version_id=version_id,
            language=Language.SPANISH,
            voice_id="Lucia",
            idempotency_key="published-checksum-v1",
        )
        version = session.get(ContentVersion, version_id)
        assert version is not None
        version.status = EditorialStatus.PUBLISHED
        version.package_url = f"/catalog/{version.content.slug}/reader-package"
        version.checksum = f"sha256:{'0' * 64}"
        session.add(
            Publication(
                content=version.content,
                version=version,
                is_active=True,
                published_at=datetime.now(UTC),
            ),
        )
        session.commit()
        paragraph = session.scalar(select(Paragraph))
        assert paragraph is not None
        paragraph.text = "Hola luna brillante."
        session.commit()

        processed = service.process(
            content_version_id=version_id,
            language=Language.SPANISH,
            voice_id="Lucia",
            idempotency_key="published-checksum-v2",
        )
        package = ReaderPackageService(session).get_package(version.content.slug)

        assert processed.status == JobStatus.SUCCEEDED
        assert version.checksum == reader_package_checksum(package)
        assert version.checksum != f"sha256:{'0' * 64}"

    engine.dispose()


def test_processing_validates_inputs_handles_failure_retry_and_cancel() -> None:
    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        version_id = _seed_version(session, Language.SPANISH, "Hola mundo.")
        service = _service(session)

        with pytest.raises(InvalidCatalogQueryError):
            service.process(
                content_version_id=version_id,
                language=Language.SPANISH,
                voice_id="Joanna",
                idempotency_key="wrong-voice",
            )
        with pytest.raises(ContentNotFoundError):
            service.process(
                content_version_id=uuid4(),
                language=Language.SPANISH,
                voice_id="Lucia",
                idempotency_key="missing-version",
            )
        with pytest.raises(InvalidCatalogQueryError):
            service.process(
                content_version_id=version_id,
                language=Language.ENGLISH,
                voice_id="Joanna",
                idempotency_key="missing-language",
            )
        expensive = _service(session, maximum_cost=Decimal("0"))
        with pytest.raises(InvalidCatalogQueryError):
            expensive.process(
                content_version_id=version_id,
                language=Language.SPANISH,
                voice_id="Lucia",
                idempotency_key="too-expensive",
            )

        failed_service = PollyProcessingService(
            session,
            adapter=FailingAdapter(),  # type: ignore[arg-type]
            storage=MemoryStorage(),
            chunk_characters=100,
            maximum_cost=Decimal("1"),
        )
        failed = failed_service.process(
            content_version_id=version_id,
            language=Language.SPANISH,
            voice_id="Lucia",
            idempotency_key="provider-failure",
        )
        assert failed.status == JobStatus.FAILED
        assert failed.error_code == "polly.processing_failed"

        retried = service.retry(failed.id)
        assert retried.status == JobStatus.SUCCEEDED
        with pytest.raises(InvalidCatalogQueryError):
            service.retry(retried.id)
        with pytest.raises(ContentNotFoundError):
            service.retry(uuid4())

        queued = ProcessingJob(
            content_version_id=version_id,
            language=Language.SPANISH,
            job_type="polly_audio",
            idempotency_key="queued-cancel",
            status=JobStatus.QUEUED,
            progress_percent=0,
            estimated_cost=Decimal("0.01"),
        )
        session.add(queued)
        session.commit()
        assert service.cancel(queued.id).status == JobStatus.CANCELLED
        with pytest.raises(ContentNotFoundError):
            service.cancel(uuid4())

    engine.dispose()


def test_chunking_local_storage_and_empty_content(tmp_path: Path) -> None:
    assert TextChunker(5).split("") == ()
    assert TextChunker(5).split("abcdefghij") == ("abcde", "fghij")
    assert TextChunker(8).split("one two three") == ("one two", "three")

    storage = LocalAudioStorage(tmp_path / "audio")
    uri = storage.store("sample.mp3", b"audio")
    assert Path(uri).read_bytes() == b"audio"
    public_storage = LocalAudioStorage(tmp_path / "public-audio", public_prefix="/audio")
    assert public_storage.store("published.mp3", b"audio") == "/audio/published.mp3"
    assert (tmp_path / "public-audio" / "published.mp3").read_bytes() == b"audio"

    engine = create_database_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        version_id = _seed_version(session, Language.ENGLISH, None)
        with pytest.raises(InvalidCatalogQueryError):
            _service(session).process(
                content_version_id=version_id,
                language=Language.ENGLISH,
                voice_id="Joanna",
                idempotency_key="empty-content",
            )
        assert PollyProcessingService._paragraph_for_mark(10, ()) is None
        blank = Paragraph(stable_key="blank", position=0, text=" ")
        assert PollyProcessingService._join_paragraphs([blank]) == ("", ())
    engine.dispose()


def _service(
    session: Session,
    *,
    storage: MemoryStorage | None = None,
    adapter: PollyAdapter | None = None,
    chunk_characters: int = 100,
    maximum_cost: Decimal = Decimal("1"),
) -> PollyProcessingService:
    return PollyProcessingService(
        session,
        adapter=adapter or FakePollyAdapter(),
        storage=storage or MemoryStorage(),
        chunk_characters=chunk_characters,
        maximum_cost=maximum_cost,
    )


def _seed_version(session: Session, language: Language, text: str | None) -> UUID:
    level = session.scalar(
        select(ReadingLevel).where(ReadingLevel.code == ReadingLevelCode.BEGINNER),
    )
    if level is None:
        level = ReadingLevel(
            code=ReadingLevelCode.BEGINNER,
            label="Beginner",
            display_order=0,
        )
    paragraphs = (
        [] if text is None else [Paragraph(stable_key="paragraph-1", position=0, text=text)]
    )
    version = ContentVersion(
        version_number=1,
        status=EditorialStatus.DRAFT,
        minimum_app_version="1.0.0",
        translations=[
            ContentTranslation(
                language=language,
                title="Test content",
                chapters=[
                    Chapter(
                        stable_key="chapter-1",
                        position=0,
                        title="Chapter",
                        paragraphs=paragraphs,
                    ),
                ],
            ),
        ],
    )
    content = ReadingContent(
        slug=f"content-{uuid4()}",
        content_type=ContentType.STORY,
        audience=Audience.ALL,
        reading_level=level,
        versions=[version],
    )
    session.add(content)
    session.commit()
    return version.id
