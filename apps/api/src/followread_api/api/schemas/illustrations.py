from uuid import UUID

from pydantic import BaseModel, Field

from followread_api.models import ResourceStatus
from followread_api.services import IllustrationResource


class UploadIllustrationRequest(BaseModel):
    content_type: str = Field(min_length=1, max_length=80)
    payload_base64: str = Field(min_length=1)
    alt_text: str = Field(min_length=1, max_length=1000)
    position: int = Field(ge=0)
    paragraph_id: UUID | None = None


class IllustrationResponse(BaseModel):
    id: UUID
    content_version_id: UUID
    paragraph_id: UUID | None
    position: int
    uri: str
    checksum: str
    alt_text: str
    status: ResourceStatus


def illustration_response(resource: IllustrationResource) -> IllustrationResponse:
    return IllustrationResponse(
        id=resource.id,
        content_version_id=resource.content_version_id,
        paragraph_id=resource.paragraph_id,
        position=resource.position,
        uri=resource.uri,
        checksum=resource.checksum,
        alt_text=resource.alt_text,
        status=resource.status,
    )
