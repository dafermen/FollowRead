"""Reviewable VPS update plan. No remote connections or shell interpolation."""

import argparse
import os
import re
import shutil
import subprocess
from pathlib import Path

IMAGE_PATTERN = re.compile(
    r"ghcr\.io/dafermen/followread/(api|admin|reader)@sha256:[0-9a-f]{64}"
)
OPTIONAL_KEYS = {
    "FOLLOWREAD_POLLY_PROVIDER",
    "FOLLOWREAD_OPENAI_KEY_FILE",
    "FOLLOWREAD_DATA_VOLUME",
}


def load_release(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        key, separator, value = line.partition("=")
        if not separator or key in values:
            raise ValueError("Malformed or duplicate release setting")
        values[key] = value
    for component in ("api", "admin", "reader"):
        value = values.get(f"FOLLOWREAD_{component.upper()}_IMAGE", "")
        match = IMAGE_PATTERN.fullmatch(value)
        if match is None or match.group(1) != component:
            raise ValueError(f"{component} must use an immutable approved GHCR digest")
    if not re.fullmatch(r"[0-9a-f]{40}", values.get("FOLLOWREAD_REVISION", "")):
        raise ValueError("Release must identify its exact Git commit")
    required = {f"FOLLOWREAD_{part}_IMAGE" for part in ("API", "ADMIN", "READER")}
    if values.keys() - required - OPTIONAL_KEYS - {"FOLLOWREAD_REVISION"}:
        raise ValueError(
            "Unexpected release settings; do not put credentials in images.env"
        )
    return values


def deployment_plan(
    compose: list[str], *, initialize: bool, rollback: bool
) -> list[list[str]]:
    backup = [
        "python",
        "-m",
        "followread_api.cli.snapshot_data",
        "backup",
        "--data",
        "/data",
    ]
    if initialize:
        backup.append("--initialize")
    plan = [
        [*compose, "config", "--quiet"],
        [*compose, "pull"],
        [*compose, "stop", "api", "worker"],
        [*compose, "run", "--rm", "--no-deps", "migrate", *backup],
    ]
    if not rollback:
        plan.append([*compose, "run", "--rm", "--no-deps", "migrate"])
    plan.append(
        [
            *compose,
            "up",
            "--detach",
            "--no-build",
            "--no-deps",
            "--wait",
            "--wait-timeout",
            "120",
            "api",
            "worker",
            "admin",
            "reader",
        ]
    )
    return plan


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--release-env", required=True, type=Path)
    parser.add_argument("--initialize", action="store_true")
    parser.add_argument("--rollback", action="store_true")
    parser.add_argument("--schema-compatible", action="store_true")
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    if args.initialize and args.rollback:
        parser.error("Initialization and rollback cannot be combined")
    if args.rollback and not args.schema_compatible:
        parser.error(
            "App rollback requires --schema-compatible after reviewing migrations"
        )
    values = load_release(args.release_env)
    root = Path(__file__).resolve().parents[1]
    compose = [
        "docker",
        "compose",
        "--project-name",
        "followread-production",
        "--env-file",
        str(args.release_env.resolve()),
        "--file",
        str(root / "infrastructure/deployment/vps.compose.yaml"),
    ]
    commands = deployment_plan(
        compose, initialize=args.initialize, rollback=args.rollback
    )
    for command in commands:
        print(subprocess.list2cmdline(command))
    if not args.execute:
        print("Plan only. No service or data was changed.")
        return
    if os.environ.get("FOLLOWREAD_DEPLOY_APPROVED") != "YES":
        raise SystemExit("Owner approval is required: FOLLOWREAD_DEPLOY_APPROVED=YES")
    if os.name != "posix":
        raise SystemExit("Execution is supported only on the reviewed Linux VPS")
    import fcntl

    state = Path("/var/lib/followread")
    state.mkdir(mode=0o700, parents=True, exist_ok=True)
    with (state / "deploy.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        environment = {**os.environ, **values}
        # The compose file validates the secret mount. Never output its contents.
        try:
            for command in commands:
                subprocess.run(command, env=environment, check=True)
            smoke = [
                "docker",
                "compose",
                *compose[2:],
                "exec",
                "-T",
                "api",
                "python",
                "-c",
                (
                    "import urllib.request; "
                    "urllib.request.urlopen('http://127.0.0.1:8000/ready', timeout=5); "
                    "urllib.request.urlopen('http://127.0.0.1:8000/catalog?limit=1', timeout=5)"
                ),
            ]
            subprocess.run(smoke, env=environment, check=True)
        except subprocess.CalledProcessError as error:
            raise SystemExit(
                "Update stopped. Keep maintenance in place and inspect the failed step. "
                "The previous manifest and pre-update data snapshot are retained; "
                "no automatic database downgrade was attempted."
            ) from error
        active = state / "active.env"
        if active.exists():
            shutil.copy2(active, state / "previous.env")
        temporary = state / "active.env.pending"
        temporary.write_text(
            "".join(f"{key}={value}\n" for key, value in values.items())
        )
        temporary.chmod(0o600)
        temporary.replace(active)
        print(
            "Containers and database are healthy. Complete the external HTTPS smoke test."
        )


if __name__ == "__main__":
    main()
