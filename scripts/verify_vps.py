"""Test already-built production images with synthetic data and disposable local TLS."""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path


def run(command: list[str], **kwargs: object) -> None:
    subprocess.run(command, check=True, **kwargs)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--namespace", default="followread-vps-candidate")
    parser.add_argument("--tag", default="review")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    project = f"followread-test-{uuid.uuid4().hex[:12]}"
    with tempfile.TemporaryDirectory(prefix="followread-vps-test-") as temporary:
        directory = Path(temporary)
        certificate = directory / "server.crt"
        run(
            [
                "openssl",
                "req",
                "-x509",
                "-newkey",
                "rsa:2048",
                "-nodes",
                "-days",
                "1",
                "-subj",
                "/CN=localhost",
                "-addext",
                "subjectAltName=DNS:localhost,IP:127.0.0.1",
                "-keyout",
                str(directory / "server.key"),
                "-out",
                str(certificate),
            ],
            stderr=subprocess.DEVNULL,
        )
        (directory / "empty-key").touch(mode=0o644)
        environment = {
            **os.environ,
            "FOLLOWREAD_DATA_VOLUME": project + "-data",
            "FOLLOWREAD_OPENAI_KEY_FILE": str(directory / "empty-key"),
            "FOLLOWREAD_POLLY_PROVIDER": "fake",
        }
        for app in ("api", "admin", "reader"):
            environment[f"FOLLOWREAD_{app.upper()}_IMAGE"] = (
                f"{args.namespace}/{app}:{args.tag}"
            )
        production = (
            root / "infrastructure/deployment/followread.nginx.conf"
        ).read_text()
        production = production.replace("127.0.0.1:5180", "reader:8080").replace(
            "127.0.0.1:5181", "admin:8080"
        )
        production = production.replace(
            "/etc/letsencrypt/live/followread.innovalogic.tech/fullchain.pem",
            "/test/server.crt",
        )
        production = production.replace(
            "/etc/letsencrypt/live/followread.innovalogic.tech/privkey.pem",
            "/test/server.key",
        )
        (directory / "nginx.conf").write_text(
            "events {}\nhttp {\n" + production + "\n}\n"
        )
        services = {
            name: {
                "environment": {
                    "FOLLOWREAD_ALLOWED_ORIGINS": '["https://localhost:5443"]'
                }
            }
            for name in ("api", "worker", "migrate")
        }
        services["edge"] = {
            "image": "nginx:1.30.4-alpine3.24",
            "ports": ["127.0.0.1:5443:443"],
            "volumes": [
                f"{directory}:/test:ro",
                f"{directory / 'nginx.conf'}:/etc/nginx/nginx.conf:ro",
            ],
            "depends_on": {
                app: {"condition": "service_healthy"} for app in ("admin", "reader")
            },
        }
        override = directory / "compose.json"
        override.write_text(json.dumps({"services": services}))
        compose = [
            "docker",
            "compose",
            "-p",
            project,
            "-f",
            str(root / "infrastructure/deployment/vps.compose.yaml"),
            "-f",
            str(override),
        ]
        try:
            run(
                [*compose, "up", "-d", "--no-build", "--wait", "--wait-timeout", "120"],
                env=environment,
            )
            run(
                [
                    *compose,
                    "run",
                    "--rm",
                    "--no-deps",
                    "-e",
                    "FOLLOWREAD_TEST_FIXTURE=ISOLATED_CONTAINER_ONLY",
                    "-v",
                    f"{root / 'scripts/vps_fixture.py'}:/fixture.py:ro",
                    "-v",
                    f"{root / 'apps/reader/public/stories'}:/fixtures:ro",
                    "migrate",
                    "python",
                    "/fixture.py",
                ],
                env=environment,
            )
            run(
                [
                    sys.executable,
                    str(root / "scripts/vps_http_test.py"),
                    "--ca",
                    str(certificate),
                ]
            )
            run([*compose, "stop", "api", "worker"], env=environment)
            recovery = (
                "from pathlib import Path; import sqlite3; "
                "from followread_api.cli.snapshot_data import snapshot, restore; "
                "data=Path('/data'); archive=snapshot(data); restored=data/'recovery-test'; "
                "restore(archive, restored); "
                "db=sqlite3.connect(restored/'followread.db'); "
                "assert db.execute('PRAGMA integrity_check').fetchone()==('ok',); "
                "assert list((restored/'audio').rglob('*')); db.close(); "
                "previous=data/'before-recovery'; previous.mkdir(); "
                "[p.replace(previous/p.name) for p in data.iterdir() if "
                "p.name in ('followread.db','followread.db-wal','followread.db-shm','audio','illustrations')]; "
                "[p.replace(data/p.name) for p in restored.iterdir()]; "
                "print('PASS container SQLite and media backup/restore')"
            )
            run(
                [
                    *compose,
                    "run",
                    "--rm",
                    "--no-deps",
                    "migrate",
                    "python",
                    "-c",
                    recovery,
                ],
                env=environment,
            )
            run(
                [*compose, "up", "-d", "--no-deps", "--wait", "api", "worker"],
                env=environment,
            )
            run(
                [
                    *compose,
                    "exec",
                    "-T",
                    "api",
                    "python",
                    "-c",
                    "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/catalog', timeout=5); print('PASS restart from restored SQLite and media')",
                ],
                env=environment,
            )
            print("VPS candidate integration PASS")
        finally:
            run([*compose, "down", "--volumes", "--remove-orphans"], env=environment)


if __name__ == "__main__":
    main()
