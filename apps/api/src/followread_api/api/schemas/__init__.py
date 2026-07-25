"""HTTP request and response schemas."""

from followread_api.api.schemas.authentication import (
    AuthenticatedUserResponse,
    LoginRequest,
    SessionResponse,
    authenticated_user_response,
    issued_session_response,
)
from followread_api.api.schemas.catalog import (
    CatalogItemResponse,
    CatalogPageResponse,
    CategoryResponse,
    ChapterResponse,
    ContentDetailResponse,
    ParagraphResponse,
    ReadingLevelResponse,
    TranslationResponse,
    catalog_item_response,
    catalog_page_response,
    content_detail_response,
)
from followread_api.api.schemas.dashboard import (
    DashboardSummaryResponse,
    dashboard_summary_response,
)
from followread_api.api.schemas.editor import (
    EditorChapterPayload,
    EditorDocumentResponse,
    EditorParagraphPayload,
    EditorTranslationPayload,
    SaveEditorDocumentRequest,
    editor_document_response,
)
from followread_api.api.schemas.editorial_catalog import (
    CreateEditorialContentRequest,
    EditorialCatalogItemResponse,
    EditorialCatalogPageResponse,
    editorial_catalog_item_response,
    editorial_catalog_page_response,
)
from followread_api.api.schemas.illustrations import (
    IllustrationResponse,
    UploadIllustrationRequest,
    illustration_response,
)
from followread_api.api.schemas.processing import (
    ProcessingJobResponse,
    ProcessingJobsResponse,
    StartProcessingRequest,
    VoiceResponse,
    VoicesResponse,
    processing_job_response,
    voices_response,
)
from followread_api.api.schemas.review import (
    ReviewSnapshotResponse,
    ReviewTransitionRequest,
    review_snapshot_response,
)

__all__ = [
    "AuthenticatedUserResponse",
    "CatalogItemResponse",
    "CatalogPageResponse",
    "CategoryResponse",
    "ChapterResponse",
    "ContentDetailResponse",
    "CreateEditorialContentRequest",
    "DashboardSummaryResponse",
    "EditorChapterPayload",
    "EditorDocumentResponse",
    "EditorParagraphPayload",
    "EditorTranslationPayload",
    "EditorialCatalogItemResponse",
    "EditorialCatalogPageResponse",
    "IllustrationResponse",
    "LoginRequest",
    "ParagraphResponse",
    "ProcessingJobResponse",
    "ProcessingJobsResponse",
    "ReadingLevelResponse",
    "ReviewSnapshotResponse",
    "ReviewTransitionRequest",
    "SaveEditorDocumentRequest",
    "SessionResponse",
    "StartProcessingRequest",
    "TranslationResponse",
    "UploadIllustrationRequest",
    "VoiceResponse",
    "VoicesResponse",
    "authenticated_user_response",
    "catalog_item_response",
    "catalog_page_response",
    "content_detail_response",
    "dashboard_summary_response",
    "editor_document_response",
    "editorial_catalog_item_response",
    "editorial_catalog_page_response",
    "illustration_response",
    "issued_session_response",
    "processing_job_response",
    "review_snapshot_response",
    "voices_response",
]
