import json
from dataclasses import asdict
from enum import Enum
from hashlib import sha256
from typing import Any
from uuid import UUID

from followread_api.services.reader_package import ReaderPackage


def canonical_reader_package_bytes(package: ReaderPackage) -> bytes:
    """Serialize the immutable Reader package exactly as clients verify it."""
    return json.dumps(
        asdict(package),
        default=_json_value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")


def reader_package_checksum(package: ReaderPackage) -> str:
    return f"sha256:{sha256(canonical_reader_package_bytes(package)).hexdigest()}"


def _json_value(value: Any) -> str:
    if isinstance(value, Enum):
        return str(value.value)
    if isinstance(value, UUID):
        return str(value)
    raise TypeError(f"Unsupported package value: {type(value).__name__}")
