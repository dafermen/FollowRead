import json
import sqlite3
from contextlib import closing
from pathlib import Path

import pytest

from followread_api.cli.database_backup import (
    backup_database,
    restore_database,
    sqlite_path,
)


def database_url(path: Path) -> str:
    return f"sqlite:///{path.as_posix()}"


def test_backup_and_restore_preserve_integrity_and_create_safety_copy(tmp_path: Path) -> None:
    database = tmp_path / "followread.db"
    with closing(sqlite3.connect(database)) as connection:
        connection.execute("CREATE TABLE stories (title TEXT NOT NULL)")
        connection.execute("INSERT INTO stories VALUES ('Original')")
        connection.commit()

    result = backup_database(database_url(database), tmp_path / "exports")
    assert result is not None
    backup = Path(result.backup)
    manifest = json.loads(Path(result.manifest).read_text(encoding="utf-8"))
    assert backup.is_file()
    assert manifest["sha256"] == result.sha256

    with closing(sqlite3.connect(database)) as connection:
        connection.execute("UPDATE stories SET title = 'Changed'")
        connection.commit()

    pre_restore = restore_database(
        database_url(database),
        backup,
        confirmation="RESTORE",
    )

    assert pre_restore is not None
    assert Path(pre_restore.backup).is_file()
    with closing(sqlite3.connect(database)) as connection:
        title = connection.execute("SELECT title FROM stories").fetchone()
    assert title == ("Original",)


def test_backup_rejects_missing_memory_tampering_and_implicit_restore(tmp_path: Path) -> None:
    missing = tmp_path / "missing.db"
    assert backup_database(database_url(missing), tmp_path, allow_missing=True) is None
    with pytest.raises(FileNotFoundError):
        backup_database(database_url(missing), tmp_path)
    with pytest.raises(ValueError, match="in-memory"):
        sqlite_path("sqlite:///:memory:")

    database = tmp_path / "source.db"
    with closing(sqlite3.connect(database)) as connection:
        connection.execute("CREATE TABLE safe (id INTEGER)")
        connection.commit()
    result = backup_database(database_url(database), tmp_path / "exports")
    assert result is not None

    with pytest.raises(ValueError, match="confirmation"):
        restore_database(database_url(database), Path(result.backup), confirmation="yes")

    Path(result.backup).write_bytes(Path(result.backup).read_bytes() + b"tampered")
    with pytest.raises(ValueError, match="checksum"):
        restore_database(database_url(database), Path(result.backup), confirmation="RESTORE")
