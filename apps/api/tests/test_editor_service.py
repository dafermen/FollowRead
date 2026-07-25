from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from followread_api.api.schemas import (
    EditorChapterPayload,
    EditorParagraphPayload,
    EditorTranslationPayload,
    SaveEditorDocumentRequest,
)
from followread_api.models import Language
from followread_api.services import EditorialEditorService


def test_editor_payload_rejects_duplicate_structure_positions_and_languages() -> None:
    paragraph = EditorParagraphPayload(stable_key="paragraph-1", position=0, text="Text")
    with pytest.raises(ValidationError):
        EditorChapterPayload(
            stable_key="chapter-1",
            position=0,
            paragraphs=[paragraph, paragraph.model_copy(update={"stable_key": "paragraph-2"})],
        )

    chapter = EditorChapterPayload(
        stable_key="chapter-1",
        position=0,
        paragraphs=[paragraph],
    )
    with pytest.raises(ValidationError):
        EditorTranslationPayload(
            language=Language.SPANISH,
            title="Title",
            chapters=[chapter, chapter.model_copy(update={"stable_key": "chapter-2"})],
        )

    translation = EditorTranslationPayload(
        language=Language.SPANISH,
        title="Title",
        chapters=[chapter],
    )
    with pytest.raises(ValidationError):
        SaveEditorDocumentRequest(
            expected_updated_at=datetime.now(UTC),
            translations=[translation, translation],
        )

    aware = datetime.now(UTC)
    assert EditorialEditorService._as_utc(aware) == aware
