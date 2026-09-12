"""Daily consistent snapshots on the authorized public test VPS."""

import os
import subprocess
from pathlib import Path

from vps_deploy import load_release


def main() -> None:
    if os.name != "posix":
        raise SystemExit("Run only on the Linux VPS")
    import fcntl

    state = Path("/var/lib/followread")
    manifest = state / "active.env"
    root = Path(__file__).resolve().parents[1]
    environment = {**os.environ, **load_release(manifest)}
    compose = [
        "docker",
        "compose",
        "--project-name",
        "followread-production",
        "--env-file",
        str(manifest),
        "--file",
        str(root / "infrastructure/deployment/vps.compose.yaml"),
    ]
    with (state / "deploy.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            subprocess.run(
                [*compose, "stop", "api", "worker"], env=environment, check=True
            )
            subprocess.run(
                [
                    *compose,
                    "run",
                    "--rm",
                    "--no-deps",
                    "migrate",
                    "python",
                    "-c",
                    (
                        "from pathlib import Path; "
                        "from followread_api.cli.snapshot_data import snapshot, digest; "
                        "import json; data=Path('/data'); output=snapshot(data); "
                        "assert output and digest(output)==json.loads(output.with_suffix('.json').read_text())['sha256']; "
                        "old=sorted((data/'backups').glob('snapshot-*.tar.gz'),reverse=True)[7:]; "
                        "[(p.unlink(),p.with_suffix('.json').unlink(missing_ok=True)) for p in old if p.is_file() and not p.is_symlink()]; "
                        "print('Verified snapshot:', output.name)"
                    ),
                ],
                env=environment,
                check=True,
            )
        finally:
            subprocess.run(
                [
                    *compose,
                    "up",
                    "-d",
                    "--no-build",
                    "--no-deps",
                    "--wait",
                    "api",
                    "worker",
                ],
                env=environment,
                check=True,
            )


if __name__ == "__main__":
    main()
