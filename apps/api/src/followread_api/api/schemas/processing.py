from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from followread_api.models import JobStatus, Language, ProcessingJob
from followread_api.services import VOICE_LABELS, VOICE_LANGUAGES


class StartProcessingRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    content_version_id: UUID
    language: Language
    voice_id: str = Field(min_length=1, max_length=120)
    idempotency_key: str = Field(min_length=8, max_length=160)


class ProcessingJobResponse(BaseModel):
    id: UUID
    content_version_id: UUID
    language: Language | None
    status: JobStatus
    stage: str | None
    progress_percent: int
    estimated_cost: Decimal
    error_code: str | None
    error_detail: str | None
    created_at: datetime
    updated_at: datetime


class ProcessingJobsResponse(BaseModel):
    items: list[ProcessingJobResponse]


class VoiceResponse(BaseModel):
    id: str
    language: Language
    label: str


class VoicesResponse(BaseModel):
    items: list[VoiceResponse]


def processing_job_response(job: ProcessingJob) -> ProcessingJobResponse:
    return ProcessingJobResponse(
        id=job.id,
        content_version_id=job.content_version_id,
        language=job.language,
        status=job.status,
        stage=job.stage,
        progress_percent=job.progress_percent,
        estimated_cost=job.estimated_cost,
        error_code=job.error_code,
        error_detail=job.error_detail,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


def voices_response() -> VoicesResponse:
    return VoicesResponse(
        items=[
            VoiceResponse(
                id=voice_id,
                language=language,
                label=VOICE_LABELS.get(voice_id, voice_id),
            )
            for voice_id, language in VOICE_LANGUAGES.items()
        ],
    )
