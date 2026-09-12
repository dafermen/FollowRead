import sqlite3
from pathlib import Path

import pytest

from followread_api.cli.snapshot_data import restore, snapshot


def test_full_snapshot_restores_database_and_media_and_rejects_corruption(tmp_path: Path) -> None:
    data = tmp_path / "source"
    (data / "audio").mkdir(parents=True)
    (data / "illustrations").mkdir()
    (data / "audio" / "narration.mp3").write_bytes(b"original audio")
    (data / "illustrations" / "cover.png").write_bytes(b"original image")
    with sqlite3.connect(data / "followread.db") as connection:
        connection.execute("CREATE TABLE evidence (value TEXT)")
        connection.execute("INSERT INTO evidence VALUES ('saved')")
    archive = snapshot(data)
    assert archive is not None
    destination = tmp_path / "restored"
    restore(archive, destination)
    with sqlite3.connect(destination / "followread.db") as connection:
        assert connection.execute("SELECT value FROM evidence").fetchone() == ("saved",)
    assert (destination / "audio/narration.mp3").read_bytes() == b"original audio"
    assert (destination / "illustrations/cover.png").read_bytes() == b"original image"
    with pytest.raises(ValueError, match="empty replacement"):
        restore(archive, destination)
    archive.write_bytes(b"corrupt")
    with pytest.raises(ValueError, match="checksum"):
        restore(archive, tmp_path / "other")


def test_initialization_never_silently_skips_existing_media(tmp_path: Path) -> None:
    assert snapshot(tmp_path, initialize=True) is None
    (tmp_path / "orphan.mp3").write_bytes(b"important")
    with pytest.raises(ValueError, match="Database missing"):
        snapshot(tmp_path, initialize=True)
