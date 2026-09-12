import random
import string

import pytest
from pydantic import ValidationError

from followread_api.api.schemas.editorial_catalog import CreateEditorialContentRequest
from followread_api.main import create_app
from followread_api.services import TextChunker


def test_generated_chunk_invariants_preserve_unicode_content_and_bounds() -> None:
    generator = random.Random(20260912)
    alphabet = string.ascii_letters + "ñáéíóú你好🙂"
    for _ in range(500):
        words = [
            "".join(generator.choices(alphabet, k=generator.randint(1, 90)))
            for _ in range(generator.randint(1, 80))
        ]
        source = " ".join(words)
        maximum = generator.randint(100, 1500)
        chunks = TextChunker(maximum).split(source)
        assert all(0 < len(chunk) <= maximum for chunk in chunks)
        assert " ".join(chunks) == source


def test_generated_catalog_inputs_reject_unsafe_slugs_and_duplicate_languages() -> None:
    generator = random.Random(20260912)
    body = {
        "slug": "safe-story",
        "title": "Safe story",
        "content_type": "story",
        "audience": "all",
        "reading_level": "beginner",
        "languages": ["es"],
    }
    assert CreateEditorialContentRequest.model_validate(body).slug == "safe-story"
    for _ in range(300):
        suffix = "".join(generator.choices(string.ascii_lowercase, k=12))
        for prefix in ("../", "<script>", "\x00", "https://", "' OR 1=1;--"):
            with pytest.raises(ValidationError) as rejected:
                CreateEditorialContentRequest.model_validate({**body, "slug": prefix + suffix})
            assert {item["loc"] for item in rejected.value.errors()} == {("slug",)}
    with pytest.raises(ValidationError):
        CreateEditorialContentRequest.model_validate({**body, "languages": ["es", "es"]})


def test_consumer_contracts_retain_required_catalog_and_session_fields() -> None:
    schemas = create_app().openapi()["components"]["schemas"]
    contracts = {
        "CatalogPageResponse": {"items", "total", "limit", "offset"},
        "SessionResponse": {"user"},
        "ProcessingJobResponse": {"id", "status", "progress_percent", "estimated_cost"},
    }
    for name, fields in contracts.items():
        assert fields <= set(schemas[name]["properties"])
        assert fields <= set(schemas[name]["required"])
