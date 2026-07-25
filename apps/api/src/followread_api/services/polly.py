import json
from collections.abc import Sequence
from dataclasses import dataclass
from decimal import Decimal
from hashlib import sha256
from pathlib import Path
from typing import Any, Protocol
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from followread_api.models import (
    AudioAsset,
    Chapter,
    ContentTranslation,
    ContentVersion,
    JobStatus,
    Language,
    Paragraph,
    ProcessingJob,
    ResourceStatus,
    SpeechMark,
)
from followread_api.services.errors import ContentNotFoundError, InvalidCatalogQueryError

VOICE_LANGUAGES = {
    "Lucia": Language.SPANISH,
    "Sergio": Language.SPANISH,
    "Joanna": Language.ENGLISH,
    "Matthew": Language.ENGLISH,
}
COST_PER_CHARACTER = Decimal("0.000004")


@dataclass(frozen=True)
class GeneratedMark:
    value: str
    start_ms: int
    end_ms: int
    char_start: int
    char_end: int


@dataclass(frozen=True)
class SynthesizedChunk:
    audio: bytes
    duration_ms: int
    marks: tuple[GeneratedMark, ...]


class PollyAdapter(Protocol):
    def synthesize(self, text: str, voice_id: str, language: Language) -> SynthesizedChunk: ...


class AudioStorage(Protocol):
    def store(self, filename: str, payload: bytes) -> str: ...


class AwsPollyClient(Protocol):
    def synthesize_speech(self, **kwargs: Any) -> dict[str, Any]: ...


class FakePollyAdapter:
    def synthesize(self, text: str, voice_id: str, language: Language) -> SynthesizedChunk:
        del language
        marks: list[GeneratedMark] = []
        cursor = 0
        for position, word in enumerate(text.split()):
            start = text.find(word, cursor)
            end = start + len(word)
            start_ms = position * 280
            marks.append(
                GeneratedMark(
                    value=word,
                    start_ms=start_ms,
                    end_ms=start_ms + 240,
                    char_start=start,
                    char_end=end,
                ),
            )
            cursor = end
        duration = max(400, len(marks) * 280)
        return SynthesizedChunk(
            audio=f"FOLLOWREAD_FAKE_MP3|{voice_id}|{text}".encode(),
            duration_ms=duration,
            marks=tuple(marks),
        )


class AwsPollyAdapter:
    """Thin Polly boundary; automated tests never contact AWS."""

    def __init__(self, client: AwsPollyClient) -> None:
        self._client = client

    def synthesize(self, text: str, voice_id: str, language: Language) -> SynthesizedChunk:
        del language
        audio_response = self._client.synthesize_speech(
            OutputFormat="mp3",
            Text=text,
            TextType="text",
            VoiceId=voice_id,
        )
        marks_response = self._client.synthesize_speech(
            OutputFormat="json",
            SpeechMarkTypes=["word"],
            Text=text,
            TextType="text",
            VoiceId=voice_id,
        )
        audio = self._read_stream(audio_response)
        raw_marks = self._read_stream(marks_response).decode("utf-8")
        parsed = [json.loads(line) for line in raw_marks.splitlines() if line.strip()]
        duration_ms = max(
            400,
            max((int(mark["time"]) for mark in parsed), default=0) + 280,
        )
        marks = tuple(
            GeneratedMark(
                value=str(mark["value"]),
                start_ms=int(mark["time"]),
                end_ms=(
                    int(parsed[position + 1]["time"]) if position + 1 < len(parsed) else duration_ms
                ),
                char_start=int(mark["start"]),
                char_end=int(mark["end"]),
            )
            for position, mark in enumerate(parsed)
        )
        return SynthesizedChunk(audio=audio, duration_ms=duration_ms, marks=marks)

    @staticmethod
    def _read_stream(response: dict[str, Any]) -> bytes:
        stream = response.get("AudioStream")
        if stream is None or not hasattr(stream, "read"):
            raise RuntimeError("Amazon Polly returned no readable AudioStream.")
        payload: bytes = stream.read()
        return payload


class RetryingPollyAdapter:
    def __init__(self, adapter: PollyAdapter, maximum_attempts: int = 3) -> None:
        self._adapter = adapter
        self._maximum_attempts = maximum_attempts

    def synthesize(self, text: str, voice_id: str, language: Language) -> SynthesizedChunk:
        return self._attempt(text, voice_id, language, attempt=1)

    def _attempt(
        self,
        text: str,
        voice_id: str,
        language: Language,
        *,
        attempt: int,
    ) -> SynthesizedChunk:
        try:
            return self._adapter.synthesize(text, voice_id, language)
        except Exception:
            if attempt >= self._maximum_attempts:
                raise
            return self._attempt(text, voice_id, language, attempt=attempt + 1)


class LocalAudioStorage:
    def __init__(self, root: str | Path) -> None:
        self._root = Path(root)

    def store(self, filename: str, payload: bytes) -> str:
        self._root.mkdir(parents=True, exist_ok=True)
        target = self._root / filename
        target.write_bytes(payload)
        return target.as_posix()


class TextChunker:
    def __init__(self, maximum_characters: int) -> None:
        self._maximum = maximum_characters

    def split(self, text: str) -> tuple[str, ...]:
        if not text:
            return ()
        chunks: list[str] = []
        remaining = text
        while len(remaining) > self._maximum:
            boundary = remaining.rfind(" ", 0, self._maximum + 1)
            if boundary <= 0:
                boundary = self._maximum
            chunks.append(remaining[:boundary].strip())
            remaining = remaining[boundary:].strip()
        if remaining:
            chunks.append(remaining)
        return tuple(chunks)


class PollyProcessingService:
    def __init__(
        self,
        session: Session,
        *,
        adapter: PollyAdapter,
        storage: AudioStorage,
        chunk_characters: int,
        maximum_cost: Decimal,
    ) -> None:
        self._session = session
        self._adapter = adapter
        self._storage = storage
        self._chunker = TextChunker(chunk_characters)
        self._maximum_cost = maximum_cost

    def process(
        self,
        *,
        content_version_id: UUID,
        language: Language,
        voice_id: str,
        idempotency_key: str,
    ) -> ProcessingJob:
        existing = self._session.scalar(
            select(ProcessingJob).where(ProcessingJob.idempotency_key == idempotency_key),
        )
        if existing is not None:
            return existing
        if VOICE_LANGUAGES.get(voice_id) != language:
            raise InvalidCatalogQueryError(
                "voice_id", "The voice is incompatible with the language."
            )

        version = self._session.scalar(
            select(ContentVersion)
            .where(ContentVersion.id == content_version_id)
            .options(
                selectinload(ContentVersion.translations)
                .selectinload(ContentTranslation.chapters)
                .selectinload(Chapter.paragraphs),
            ),
        )
        if version is None:
            raise ContentNotFoundError(str(content_version_id))
        translation = next(
            (item for item in version.translations if item.language == language),
            None,
        )
        if translation is None:
            raise InvalidCatalogQueryError("language", "The translation does not exist.")
        paragraphs = [
            paragraph
            for chapter in sorted(translation.chapters, key=lambda item: item.position)
            for paragraph in sorted(chapter.paragraphs, key=lambda item: item.position)
        ]
        text, ranges = self._join_paragraphs(paragraphs)
        if not text:
            raise InvalidCatalogQueryError("content", "The translation has no readable text.")
        estimated_cost = Decimal(len(text)) * COST_PER_CHARACTER
        if estimated_cost > self._maximum_cost:
            raise InvalidCatalogQueryError(
                "cost", "The estimated processing cost exceeds the limit."
            )

        job = ProcessingJob(
            content_version_id=version.id,
            language=language,
            job_type="polly_audio",
            idempotency_key=idempotency_key,
            status=JobStatus.RUNNING,
            stage="synthesizing",
            progress_percent=10,
            estimated_cost=estimated_cost,
        )
        self._session.add(job)
        self._session.flush()
        try:
            chunks = self._chunker.split(text)
            audio_parts: list[bytes] = []
            all_marks: list[GeneratedMark] = []
            character_offset = 0
            time_offset = 0
            for chunk in chunks:
                generated = self._adapter.synthesize(chunk, voice_id, language)
                audio_parts.append(generated.audio)
                all_marks.extend(
                    GeneratedMark(
                        value=mark.value,
                        start_ms=mark.start_ms + time_offset,
                        end_ms=mark.end_ms + time_offset,
                        char_start=mark.char_start + character_offset,
                        char_end=mark.char_end + character_offset,
                    )
                    for mark in generated.marks
                )
                character_offset += len(chunk) + 1
                time_offset += generated.duration_ms
            payload = b"".join(audio_parts)
            checksum = f"sha256:{sha256(payload).hexdigest()}"
            uri = self._storage.store(f"{version.id}-{language.value}-{voice_id}.mp3", payload)
            asset = AudioAsset(
                content_version_id=version.id,
                language=language,
                voice_id=voice_id,
                uri=uri,
                checksum=checksum,
                duration_ms=time_offset,
                status=ResourceStatus.READY,
            )
            self._session.add(asset)
            self._session.flush()
            asset.speech_marks = [
                SpeechMark(
                    paragraph_id=self._paragraph_for_mark(mark.char_start, ranges),
                    position=position,
                    mark_type="word",
                    value=mark.value,
                    start_ms=mark.start_ms,
                    end_ms=mark.end_ms,
                    char_start=mark.char_start,
                    char_end=mark.char_end,
                )
                for position, mark in enumerate(all_marks)
            ]
            job.status = JobStatus.SUCCEEDED
            job.stage = "completed"
            job.progress_percent = 100
        except Exception as error:
            job.status = JobStatus.FAILED
            job.stage = "failed"
            job.error_code = "polly.processing_failed"
            job.error_detail = str(error)[:500]
        self._session.commit()
        return job

    def list_jobs(self, limit: int = 20) -> tuple[ProcessingJob, ...]:
        return tuple(
            self._session.scalars(
                select(ProcessingJob).order_by(ProcessingJob.created_at.desc()).limit(limit),
            ).all(),
        )

    def retry(self, job_id: UUID) -> ProcessingJob:
        job = self._session.get(ProcessingJob, job_id)
        if job is None:
            raise ContentNotFoundError(str(job_id))
        if job.status != JobStatus.FAILED or job.language is None:
            raise InvalidCatalogQueryError("job", "Only a failed language job can be retried.")
        return self.process(
            content_version_id=job.content_version_id,
            language=job.language,
            voice_id=self._voice_from_failed_job(job),
            idempotency_key=f"{job.idempotency_key}:retry",
        )

    def cancel(self, job_id: UUID) -> ProcessingJob:
        job = self._session.get(ProcessingJob, job_id)
        if job is None:
            raise ContentNotFoundError(str(job_id))
        if job.status in {JobStatus.QUEUED, JobStatus.RUNNING}:
            job.status = JobStatus.CANCELLED
            job.stage = "cancelled"
            self._session.commit()
        return job

    def _voice_from_failed_job(self, job: ProcessingJob) -> str:
        asset = self._session.scalar(
            select(AudioAsset).where(
                AudioAsset.content_version_id == job.content_version_id,
                AudioAsset.language == job.language,
            ),
        )
        if asset is not None:
            return asset.voice_id
        return "Lucia" if job.language == Language.SPANISH else "Joanna"

    @staticmethod
    def _join_paragraphs(
        paragraphs: Sequence[Paragraph],
    ) -> tuple[str, tuple[tuple[int, int, UUID], ...]]:
        parts: list[str] = []
        ranges: list[tuple[int, int, UUID]] = []
        cursor = 0
        for paragraph in paragraphs:
            clean = paragraph.text.strip()
            if not clean:
                continue
            parts.append(clean)
            ranges.append((cursor, cursor + len(clean), paragraph.id))
            cursor += len(clean) + 2
        return "\n\n".join(parts), tuple(ranges)

    @staticmethod
    def _paragraph_for_mark(
        character_start: int,
        ranges: tuple[tuple[int, int, UUID], ...],
    ) -> UUID | None:
        return next(
            (paragraph_id for start, end, paragraph_id in ranges if start <= character_start < end),
            None,
        )
