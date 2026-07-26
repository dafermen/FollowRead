from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from followread_api.services.reader_sync import ReaderSyncResult


class ProgressOperationRequest(BaseModel):
    operation_id: UUID
    slug: str = Field(min_length=1, max_length=160, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    version: int = Field(ge=1)
    stable_anchor: str = Field(min_length=1, max_length=160)
    position_ms: int = Field(ge=0)
    occurred_at: datetime


class ReaderSyncRequest(BaseModel):
    client_id: UUID
    operations: list[ProgressOperationRequest] = Field(min_length=1, max_length=100)


class ProgressConfirmationResponse(BaseModel):
    operation_id: UUID
    slug: str
    version: int
    stable_anchor: str
    position_ms: int
    applied: bool


class ProgressRejectionResponse(BaseModel):
    operation_id: UUID
    slug: str
    reason: str


class ReaderSyncResponse(BaseModel):
    confirmed: list[ProgressConfirmationResponse]
    rejected: list[ProgressRejectionResponse]


def reader_sync_response(result: ReaderSyncResult) -> ReaderSyncResponse:
    return ReaderSyncResponse(
        confirmed=[
            ProgressConfirmationResponse(
                operation_id=item.operation_id,
                slug=item.slug,
                version=item.version,
                stable_anchor=item.stable_anchor,
                position_ms=item.position_ms,
                applied=item.applied,
            )
            for item in result.confirmed
        ],
        rejected=[
            ProgressRejectionResponse(
                operation_id=item.operation_id,
                slug=item.slug,
                reason=item.reason,
            )
            for item in result.rejected
        ],
    )
