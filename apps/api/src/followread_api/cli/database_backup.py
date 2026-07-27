import argparse
import hashlib
import json
import os
import sqlite3
from contextlib import closing
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from pathlib import Path

from followread_api.config import get_settings


@dataclass(frozen=True)
class BackupResult:
    database: str
    backup: str
    manifest: str
    sha256: str
    created_at: str


def sqlite_path(database_url: str) -> Path:
    prefix = "sqlite:///"
    if not database_url.startswith(prefix):
        raise ValueError("Only SQLite database URLs are supported.")
    raw_path = database_url.removeprefix(prefix)
    if raw_path == ":memory:":
        raise ValueError("An in-memory database cannot be backed up.")
    return Path(raw_path).resolve()


def backup_database(
    database_url: str,
    output_directory: Path,
    *,
    allow_missing: bool = False,
) -> BackupResult | None:
    source_path = sqlite_path(database_url)
    if not source_path.is_file():
        if allow_missing:
            return None
        raise FileNotFoundError(f"SQLite database does not exist: {source_path}")

    output_directory.mkdir(parents=True, exist_ok=True)
    created_at = datetime.now(UTC)
    stamp = created_at.strftime("%Y%m%dT%H%M%S%fZ")
    backup_path = output_directory / f"followread-{stamp}.sqlite3"
    _copy_database(source_path, backup_path)
    _assert_integrity(backup_path)
    checksum = _sha256(backup_path)
    manifest_path = backup_path.with_suffix(".json")
    result = BackupResult(
        database=str(source_path),
        backup=str(backup_path.resolve()),
        manifest=str(manifest_path.resolve()),
        sha256=checksum,
        created_at=created_at.isoformat(),
    )
    manifest_path.write_text(
        json.dumps(asdict(result), indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    return result


def restore_database(
    database_url: str,
    backup_path: Path,
    *,
    confirmation: str,
) -> BackupResult | None:
    if confirmation != "RESTORE":
        raise ValueError("Restore requires explicit confirmation: RESTORE.")

    source_backup = backup_path.resolve()
    manifest_path = source_backup.with_suffix(".json")
    if not source_backup.is_file() or not manifest_path.is_file():
        raise FileNotFoundError("Backup and matching JSON manifest are required.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    expected_checksum = manifest.get("sha256")
    if not isinstance(expected_checksum, str) or _sha256(source_backup) != expected_checksum:
        raise ValueError("Backup checksum does not match its manifest.")
    _assert_integrity(source_backup)

    destination = sqlite_path(database_url)
    pre_restore: BackupResult | None = None
    if destination.is_file():
        pre_restore = backup_database(
            database_url,
            destination.parent / "backups" / "pre-restore",
        )
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".restore-tmp")
    try:
        _copy_database(source_backup, temporary)
        _assert_integrity(temporary)
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)
    return pre_restore


def _copy_database(source: Path, destination: Path) -> None:
    destination.unlink(missing_ok=True)
    source_uri = f"{source.as_uri()}?mode=ro"
    with (
        closing(sqlite3.connect(source_uri, uri=True)) as source_connection,
        closing(sqlite3.connect(destination)) as destination_connection,
    ):
        source_connection.backup(destination_connection)
        destination_connection.commit()


def _assert_integrity(database_path: Path) -> None:
    database_uri = f"{database_path.as_uri()}?mode=ro"
    with closing(sqlite3.connect(database_uri, uri=True)) as connection:
        result = connection.execute("PRAGMA integrity_check").fetchone()
    if result != ("ok",):
        raise ValueError(f"SQLite integrity check failed for {database_path}.")


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Back up or restore the FollowRead SQLite database."
    )
    parser.add_argument(
        "--database-url",
        default=get_settings().database_url,
        help="SQLite URL. Defaults to FOLLOWREAD_DATABASE_URL.",
    )
    subcommands = parser.add_subparsers(dest="operation", required=True)
    backup_parser = subcommands.add_parser("backup")
    backup_parser.add_argument("--output", type=Path, default=Path("./var/backups"))
    backup_parser.add_argument("--allow-missing", action="store_true")
    restore_parser = subcommands.add_parser("restore")
    restore_parser.add_argument("--backup", type=Path, required=True)
    restore_parser.add_argument("--confirm", required=True)
    arguments = parser.parse_args()

    if arguments.operation == "backup":
        result = backup_database(
            arguments.database_url,
            arguments.output,
            allow_missing=arguments.allow_missing,
        )
        print(
            "No database exists yet; backup skipped."
            if result is None
            else json.dumps(asdict(result))
        )
        return

    pre_restore = restore_database(
        arguments.database_url,
        arguments.backup,
        confirmation=arguments.confirm,
    )
    print(
        json.dumps(
            {
                "restored": str(arguments.backup.resolve()),
                "pre_restore_backup": None if pre_restore is None else pre_restore.backup,
            },
        ),
    )


if __name__ == "__main__":
    main()
