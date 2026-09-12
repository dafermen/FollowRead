"""Consistent SQLite and media snapshots; run while the API/worker is stopped."""

import argparse
import hashlib
import json
import sqlite3
import tarfile
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path
from tempfile import TemporaryDirectory

from followread_api.cli.database_backup import backup_database


def digest(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def snapshot(data: Path, *, initialize: bool = False) -> Path | None:
    database = data / "followread.db"
    if not database.is_file():
        if initialize and not any(path.is_file() for path in data.rglob("*")):
            return None
        raise ValueError("Database missing; initialization is permitted only on an empty volume")
    stamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%S%fZ")
    output = data / "backups" / f"snapshot-{stamp}.tar.gz"
    output.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix="followread-snapshot-") as temporary:
        result = backup_database(f"sqlite:///{database.resolve().as_posix()}", Path(temporary))
        assert result is not None
        with tarfile.open(output, "x:gz") as archive:
            archive.add(result.backup, arcname="followread.db")
            for directory in ("audio", "illustrations"):
                root = data / directory
                if root.exists():
                    for item in sorted(root.rglob("*")):
                        if item.is_symlink():
                            raise ValueError("Snapshots must not follow media symlinks")
                        if item.is_file():
                            archive.add(item, arcname=item.relative_to(data).as_posix())
    output.with_suffix(".json").write_text(json.dumps({"sha256": digest(output)}, indent=2))
    return output


def restore(archive: Path, destination: Path) -> None:
    expected = json.loads(archive.with_suffix(".json").read_text())["sha256"]
    if digest(archive) != expected:
        raise ValueError("Snapshot checksum mismatch")
    if destination.exists() and any(path.is_file() for path in destination.rglob("*")):
        raise ValueError(
            "Restore requires an empty replacement volume; preserve the current volume"
        )
    with TemporaryDirectory(prefix="followread-restore-", dir=destination.parent) as temporary:
        staging = Path(temporary)
        with tarfile.open(archive, "r:gz") as bundle:
            for member in bundle.getmembers():
                parts = Path(member.name).parts
                if not parts or parts[0] not in {"followread.db", "audio", "illustrations"}:
                    raise ValueError("Unexpected snapshot member")
                if not member.isfile() or ".." in parts:
                    raise ValueError("Only regular data files are accepted")
            bundle.extractall(staging, filter="data")
        with closing(
            sqlite3.connect(f"{(staging / 'followread.db').as_uri()}?mode=ro", uri=True)
        ) as connection:
            if connection.execute("PRAGMA integrity_check").fetchone() != ("ok",):
                raise ValueError("Restored SQLite database failed integrity check")
        destination.mkdir(parents=True, exist_ok=True)
        for item in staging.rglob("*"):
            if item.is_file():
                target = destination / item.relative_to(staging)
                target.parent.mkdir(parents=True, exist_ok=True)
                item.replace(target)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=["backup", "restore"])
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--initialize", action="store_true")
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--confirm")
    args = parser.parse_args()
    if args.operation == "backup":
        print(
            snapshot(args.data, initialize=args.initialize)
            or "Empty initial volume; no backup needed"
        )
    elif args.archive is not None and args.confirm == "RESTORE":
        restore(args.archive, args.data)
        print("SQLite and media restored into the replacement volume")
    else:
        parser.error("Restore requires --archive and --confirm RESTORE")


if __name__ == "__main__":
    main()
