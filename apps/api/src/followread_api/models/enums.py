from enum import StrEnum


class ContentType(StrEnum):
    STORY = "story"
    ARTICLE = "article"
    BOOK = "book"
    LESSON = "lesson"


class Audience(StrEnum):
    CHILDREN = "children"
    TEENAGER = "teenager"
    ADULT = "adult"
    ALL = "all"


class Language(StrEnum):
    ENGLISH = "en"
    SPANISH = "es"


class ReadingLevelCode(StrEnum):
    BEGINNER = "beginner"
    ELEMENTARY = "elementary"
    INTERMEDIATE = "intermediate"
    UPPER_INTERMEDIATE = "upper-intermediate"
    ADVANCED = "advanced"


class EditorialStatus(StrEnum):
    DRAFT = "draft"
    READY_FOR_PROCESSING = "ready_for_processing"
    PROCESSING = "processing"
    PROCESSING_FAILED = "processing_failed"
    READY_FOR_REVIEW = "ready_for_review"
    REVIEW_REJECTED = "review_rejected"
    APPROVED = "approved"
    PUBLISHED = "published"
    UNPUBLISHED = "unpublished"
    ARCHIVED = "archived"


class JobStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ResourceStatus(StrEnum):
    PENDING = "pending"
    READY = "ready"
    INVALID = "invalid"
    ARCHIVED = "archived"


class DownloadStatus(StrEnum):
    REQUESTED = "requested"
    DOWNLOADED = "downloaded"
    VERIFIED = "verified"
    REMOVED = "removed"
    FAILED = "failed"
