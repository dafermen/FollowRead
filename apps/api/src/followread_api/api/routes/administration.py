from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status

from followread_api.api.dependencies import (
    AuthenticationServiceDependency,
    DatabaseSession,
    PermissionRequirement,
    ProcessingServiceDependency,
)
from followread_api.api.errors import ErrorResponse
from followread_api.api.schemas import (
    AuthenticatedUserResponse,
    CreateEditorialContentRequest,
    DashboardSummaryResponse,
    EditorDocumentResponse,
    EditorialCatalogItemResponse,
    EditorialCatalogPageResponse,
    IllustrationResponse,
    ProcessingJobResponse,
    ProcessingJobsResponse,
    ReviewSnapshotResponse,
    ReviewTransitionRequest,
    SaveEditorDocumentRequest,
    StartProcessingRequest,
    UploadIllustrationRequest,
    VoicesResponse,
    authenticated_user_response,
    dashboard_summary_response,
    editor_document_response,
    editorial_catalog_item_response,
    editorial_catalog_page_response,
    illustration_response,
    processing_job_response,
    review_snapshot_response,
    voices_response,
)
from followread_api.config import get_settings
from followread_api.models import ContentType, EditorialStatus
from followread_api.security.session import CSRF_COOKIE, SESSION_COOKIE
from followread_api.services import (
    AuthenticatedUser,
    DashboardService,
    EditorialCatalogFilters,
    EditorialCatalogService,
    EditorialEditorService,
    EditorialReviewService,
    IllustrationService,
    InvalidCsrfTokenError,
    InvalidOriginError,
)

router = APIRouter(prefix="/admin", tags=["administration"])
ACCESS_ERRORS: dict[int | str, dict[str, Any]] = {
    401: {"model": ErrorResponse, "description": "A valid session is required"},
    403: {"model": ErrorResponse, "description": "The account lacks the required permission"},
}
AdminAccessUser = Annotated[
    AuthenticatedUser,
    Depends(PermissionRequirement("admin.access")),
]
ContentCreatorUser = Annotated[
    AuthenticatedUser,
    Depends(PermissionRequirement("content.create")),
]
ContentEditorUser = Annotated[
    AuthenticatedUser,
    Depends(PermissionRequirement("content.edit")),
]
ContentProcessorUser = Annotated[
    AuthenticatedUser,
    Depends(PermissionRequirement("content.process")),
]
ContentReviewerUser = Annotated[
    AuthenticatedUser,
    Depends(PermissionRequirement("content.review")),
]
ContentPublisherUser = Annotated[
    AuthenticatedUser,
    Depends(PermissionRequirement("content.publish")),
]


@router.get(
    "/access",
    response_model=AuthenticatedUserResponse,
    responses=ACCESS_ERRORS,
)
def verify_admin_access(user: AdminAccessUser) -> AuthenticatedUserResponse:
    return authenticated_user_response(user)


@router.get(
    "/dashboard",
    response_model=DashboardSummaryResponse,
    responses=ACCESS_ERRORS,
)
def get_dashboard_summary(
    session: DatabaseSession,
    _user: AdminAccessUser,
) -> DashboardSummaryResponse:
    return dashboard_summary_response(DashboardService(session).get_summary())


@router.get(
    "/content",
    response_model=EditorialCatalogPageResponse,
    responses=ACCESS_ERRORS,
)
def list_editorial_content(
    session: DatabaseSession,
    user: AdminAccessUser,
    search: Annotated[str | None, Query(max_length=240)] = None,
    status: EditorialStatus | None = None,
    content_type: ContentType | None = None,
    sort: Literal["recent", "title", "status"] = "recent",
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> EditorialCatalogPageResponse:
    page = EditorialCatalogService(session).list_content(
        EditorialCatalogFilters(
            search=search,
            status=status,
            content_type=content_type,
            sort=sort,
            limit=limit,
            offset=offset,
        ),
        frozenset(user.permissions),
    )
    return editorial_catalog_page_response(page)


@router.post(
    "/content",
    response_model=EditorialCatalogItemResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        **ACCESS_ERRORS,
        422: {"model": ErrorResponse, "description": "Invalid or duplicate content metadata"},
    },
)
def create_editorial_content(
    body: CreateEditorialContentRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: ContentCreatorUser,
) -> EditorialCatalogItemResponse:
    _validate_mutation_request(request, authentication)
    item = EditorialCatalogService(session).create_draft(
        body.to_command(),
        actor_user_id=user.id,
        permissions=frozenset(user.permissions),
        correlation_id=request.state.request_id,
    )
    return editorial_catalog_item_response(item)


@router.get(
    "/content/{content_id}/editor",
    response_model=EditorDocumentResponse,
    responses={
        **ACCESS_ERRORS,
        404: {"model": ErrorResponse, "description": "Content draft not found"},
    },
)
def get_editor_document(
    content_id: UUID,
    session: DatabaseSession,
    _user: AdminAccessUser,
) -> EditorDocumentResponse:
    return editor_document_response(EditorialEditorService(session).get_document(content_id))


@router.put(
    "/content/{content_id}/editor",
    response_model=EditorDocumentResponse,
    responses={
        **ACCESS_ERRORS,
        404: {"model": ErrorResponse, "description": "Content draft not found"},
        409: {"model": ErrorResponse, "description": "Draft changed in another session"},
    },
)
def save_editor_document(
    content_id: UUID,
    body: SaveEditorDocumentRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: ContentEditorUser,
) -> EditorDocumentResponse:
    _validate_mutation_request(request, authentication)
    document = EditorialEditorService(session).save_document(
        content_id,
        expected_updated_at=body.expected_updated_at,
        translations=tuple(translation.to_domain() for translation in body.translations),
        actor_user_id=user.id,
        correlation_id=request.state.request_id,
    )
    return editor_document_response(document)


@router.post(
    "/content/{content_id}/illustrations",
    response_model=IllustrationResponse,
    status_code=status.HTTP_201_CREATED,
    responses=ACCESS_ERRORS,
)
def upload_illustration(
    content_id: UUID,
    body: UploadIllustrationRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: ContentEditorUser,
) -> IllustrationResponse:
    _validate_mutation_request(request, authentication)
    resource = IllustrationService(
        session,
        get_settings().illustration_output_dir,
    ).upload(
        content_id,
        content_type=body.content_type,
        payload_base64=body.payload_base64,
        alt_text=body.alt_text,
        position=body.position,
        paragraph_id=body.paragraph_id,
        actor_user_id=user.id,
        correlation_id=request.state.request_id,
    )
    return illustration_response(resource)


@router.get(
    "/voices",
    response_model=VoicesResponse,
    responses=ACCESS_ERRORS,
)
def list_voices(_user: AdminAccessUser) -> VoicesResponse:
    return voices_response()


@router.get(
    "/processing",
    response_model=ProcessingJobsResponse,
    responses=ACCESS_ERRORS,
)
def list_processing_jobs(
    processing: ProcessingServiceDependency,
    _user: AdminAccessUser,
) -> ProcessingJobsResponse:
    return ProcessingJobsResponse(
        items=[processing_job_response(job) for job in processing.list_jobs()],
    )


@router.post(
    "/processing",
    response_model=ProcessingJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=ACCESS_ERRORS,
)
def start_processing(
    body: StartProcessingRequest,
    request: Request,
    authentication: AuthenticationServiceDependency,
    processing: ProcessingServiceDependency,
    _user: ContentProcessorUser,
) -> ProcessingJobResponse:
    _validate_mutation_request(request, authentication)
    return processing_job_response(
        processing.process(
            content_version_id=body.content_version_id,
            language=body.language,
            voice_id=body.voice_id,
            idempotency_key=body.idempotency_key,
        ),
    )


@router.post(
    "/processing/{job_id}/retry",
    response_model=ProcessingJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses=ACCESS_ERRORS,
)
def retry_processing(
    job_id: UUID,
    request: Request,
    authentication: AuthenticationServiceDependency,
    processing: ProcessingServiceDependency,
    _user: ContentProcessorUser,
) -> ProcessingJobResponse:
    _validate_mutation_request(request, authentication)
    return processing_job_response(processing.retry(job_id))


@router.post(
    "/processing/{job_id}/cancel",
    response_model=ProcessingJobResponse,
    responses=ACCESS_ERRORS,
)
def cancel_processing(
    job_id: UUID,
    request: Request,
    authentication: AuthenticationServiceDependency,
    processing: ProcessingServiceDependency,
    _user: ContentProcessorUser,
) -> ProcessingJobResponse:
    _validate_mutation_request(request, authentication)
    return processing_job_response(processing.cancel(job_id))


@router.get(
    "/content/{content_id}/review",
    response_model=ReviewSnapshotResponse,
    responses=ACCESS_ERRORS,
)
def get_review_snapshot(
    content_id: UUID,
    session: DatabaseSession,
    _user: AdminAccessUser,
) -> ReviewSnapshotResponse:
    return review_snapshot_response(EditorialReviewService(session).get_snapshot(content_id))


@router.post(
    "/content/{content_id}/review/submit",
    response_model=ReviewSnapshotResponse,
    responses=ACCESS_ERRORS,
)
def submit_for_review(
    content_id: UUID,
    body: ReviewTransitionRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: ContentEditorUser,
) -> ReviewSnapshotResponse:
    return _transition_review(content_id, "submit", body, request, session, authentication, user)


@router.post(
    "/content/{content_id}/review/approve",
    response_model=ReviewSnapshotResponse,
    responses=ACCESS_ERRORS,
)
def approve_review(
    content_id: UUID,
    body: ReviewTransitionRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: ContentReviewerUser,
) -> ReviewSnapshotResponse:
    return _transition_review(content_id, "approve", body, request, session, authentication, user)


@router.post(
    "/content/{content_id}/review/reject",
    response_model=ReviewSnapshotResponse,
    responses=ACCESS_ERRORS,
)
def reject_review(
    content_id: UUID,
    body: ReviewTransitionRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: ContentReviewerUser,
) -> ReviewSnapshotResponse:
    return _transition_review(content_id, "reject", body, request, session, authentication, user)


@router.post(
    "/content/{content_id}/review/{action}",
    response_model=ReviewSnapshotResponse,
    responses=ACCESS_ERRORS,
)
def transition_publication(
    content_id: UUID,
    action: Literal["publish", "unpublish", "archive"],
    body: ReviewTransitionRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: ContentPublisherUser,
) -> ReviewSnapshotResponse:
    return _transition_review(content_id, action, body, request, session, authentication, user)


def _transition_review(
    content_id: UUID,
    action: Literal["submit", "approve", "reject", "publish", "unpublish", "archive"],
    body: ReviewTransitionRequest,
    request: Request,
    session: DatabaseSession,
    authentication: AuthenticationServiceDependency,
    user: AuthenticatedUser,
) -> ReviewSnapshotResponse:
    _validate_mutation_request(request, authentication)
    return review_snapshot_response(
        EditorialReviewService(session).transition(
            content_id,
            action,
            actor_user_id=user.id,
            correlation_id=request.state.request_id,
            note=body.note,
        ),
    )


def _validate_mutation_request(
    request: Request,
    authentication: AuthenticationServiceDependency,
) -> None:
    if request.headers.get("origin") not in get_settings().allowed_origins:
        raise InvalidOriginError
    session_token = request.cookies.get(SESSION_COOKIE)
    csrf_cookie = request.cookies.get(CSRF_COOKIE)
    csrf_header = request.headers.get("x-csrf-token")
    if (
        session_token is None
        or csrf_cookie is None
        or csrf_header is None
        or csrf_cookie != csrf_header
    ):
        raise InvalidCsrfTokenError
    authentication.validate_csrf(session_token, csrf_header)
