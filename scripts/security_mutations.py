"""Verify selected security tests detect deliberately weakened controls in temporary copies."""

import os
import shutil
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

root = Path(__file__).resolve().parents[1]
mutations = [
    (
        "api/routes/authentication.py",
        'if request.headers.get("origin") not in get_settings().allowed_origins:',
        "if False:",
        "test_authentication_api.py",
    ),
    (
        "observability.py",
        'return route_path if isinstance(route_path, str) else "unmatched"',
        "return route_path if isinstance(route_path, str) else request.url.path",
        "test_production_security.py",
    ),
]
for relative, original, weakened, test_file in mutations:
    with TemporaryDirectory(prefix="followread-security-mutation-") as temporary:
        source = Path(temporary) / "src"
        shutil.copytree(
            root / "apps/api/src", source, ignore=shutil.ignore_patterns("__pycache__")
        )
        target = source / "followread_api" / relative
        content = target.read_text(encoding="utf-8")
        if content.count(original) != 1:
            raise ValueError(f"Mutation target changed: {relative}")
        target.write_text(content.replace(original, weakened), encoding="utf-8")
        environment = {
            **os.environ,
            "PYTHONPATH": str(source),
            "PYTHONDONTWRITEBYTECODE": "1",
            "FOLLOWREAD_ENVIRONMENT": "test",
            "FOLLOWREAD_POLLY_PROVIDER": "fake",
        }
        result = subprocess.run(
            [
                sys.executable,
                "-m",
                "pytest",
                str(root / "apps/api/tests" / test_file),
                "-q",
                "-p",
                "no:cacheprovider",
                "--basetemp",
                str(Path(temporary) / "tests"),
            ],
            cwd=root,
            env=environment,
            capture_output=True,
            check=False,
            text=True,
            timeout=90,
        )
        if (
            result.returncode != 1
            or "FAILED " not in result.stdout
            or "ERROR collecting" in result.stdout
        ):
            raise RuntimeError(
                f"Security mutation was not detected by assertions: {relative}"
            )
        print(f"PASS mutation detected: {relative}")
print("Security mutation checks PASS (2 of 2 selected controls)")
