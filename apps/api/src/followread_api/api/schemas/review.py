from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from followread_api.models import EditorialStatus
from followread_api.services import ReviewSnapshot


class ReviewTransitionRequest(BaseModel):
    note: str | None = Field(default=None, max_length=1000)


class ReviewCheckResponse(BaseModel):
    code: str
    label: str
    passed: bool


class ReviewEventResponse(BaseModel):
    action: str
    created_at: datetime
    note: str | None


class ReviewSnapshotResponse(BaseModel):
    content_id: UUID
    content_version_id: UUID
    title: str
    version: int
    status: EditorialStatus
    checks: list[ReviewCheckResponse]
    history: list[ReviewEventResponse]


def review_snapshot_response(snapshot: ReviewSnapshot) -> ReviewSnapshotResponse:
    return ReviewSnapshotResponse(
        content_id=snapshot.content_id,
        content_version_id=snapshot.content_version_id,
        title=snapshot.title,
        version=snapshot.version,
        status=snapshot.status,
        checks=[
            ReviewCheckResponse(code=item.code, label=item.label, passed=item.passed)
            for item in snapshot.checks
        ],
        history=[
            ReviewEventResponse(action=item.action, created_at=item.created_at, note=item.note)
            for item in snapshot.history
        ],
    )
