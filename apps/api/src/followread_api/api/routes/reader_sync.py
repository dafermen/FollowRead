from fastapi import APIRouter

from followread_api.api.dependencies import DatabaseSession
from followread_api.api.schemas.reader_sync import (
    ReaderSyncRequest,
    ReaderSyncResponse,
    reader_sync_response,
)
from followread_api.services.reader_sync import ProgressOperation, ReaderSyncService

router = APIRouter(prefix="/reader", tags=["reader"])


@router.post("/sync", response_model=ReaderSyncResponse)
def synchronize_reader(request: ReaderSyncRequest, session: DatabaseSession) -> ReaderSyncResponse:
    result = ReaderSyncService(session).synchronize(
        request.client_id,
        tuple(
            ProgressOperation(
                operation_id=item.operation_id,
                slug=item.slug,
                version=item.version,
                stable_anchor=item.stable_anchor,
                position_ms=item.position_ms,
                occurred_at=item.occurred_at,
            )
            for item in request.operations
        ),
    )
    return reader_sync_response(result)
