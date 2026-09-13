"""Exercise both Docker stores and reject unapproved portable image metadata."""

import contextlib
import hashlib
import io
import json
import subprocess
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from resolve_portable_images import main


class PortableImagesTest(unittest.TestCase):
    def exercise(self, store, approved_kind, *, tampered=False, wrong_revision=False):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            revision = "a" * 40
            blobs = {}
            descriptors = []
            inspected = {}
            values = {"FOLLOWREAD_REVISION": "b" * 40 if wrong_revision else revision}

            def add_blob(value):
                data = json.dumps(value).encode()
                digest = "sha256:" + hashlib.sha256(data).hexdigest()
                blobs["blobs/sha256/" + digest.split(":")[1]] = data
                return digest

            for component in ("api", "admin", "reader"):
                labels = {
                    "org.opencontainers.image.revision": revision,
                    "component": component,
                }
                layers = ["sha256:" + hashlib.sha256(component.encode()).hexdigest()]
                config_id = add_blob(
                    {
                        "os": "linux",
                        "architecture": "amd64",
                        "config": {"Labels": labels},
                        "rootfs": {"diff_ids": layers},
                    }
                )
                manifest_id = add_blob({"config": {"digest": config_id}})
                descriptors.append({"digest": manifest_id})
                loaded_id = config_id if store == "classic" else manifest_id
                values[f"FOLLOWREAD_{component.upper()}_IMAGE"] = (
                    config_id if approved_kind == "config" else manifest_id
                )
                inspected[loaded_id] = {
                    "Id": loaded_id,
                    "Os": "linux",
                    "Architecture": "amd64",
                    "Config": {"Labels": labels},
                    "RootFS": {"Layers": layers},
                }
            blobs["index.json"] = json.dumps({"manifests": descriptors}).encode()
            if tampered:
                blobs[next(iter(blobs))] += b" "
            archive_path = root / "images.tar.gz"
            with tarfile.open(archive_path, "w:gz") as archive:
                for name, data in blobs.items():
                    member = tarfile.TarInfo(name)
                    member.size = len(data)
                    archive.addfile(member, io.BytesIO(data))
            source = root / "release.env"
            source.write_text(
                "".join(f"{key}={value}\n" for key, value in values.items())
            )
            output = root / "resolved.env"

            def inspect(command, **kwargs):
                item = inspected.get(command[-1])
                return subprocess.CompletedProcess(
                    command, 0 if item else 1, json.dumps([item]) if item else "", ""
                )

            arguments = [
                "resolve",
                "--archive",
                str(archive_path),
                "--release-env",
                str(source),
                "--output",
                str(output),
            ]
            with (
                patch.object(sys, "argv", arguments),
                patch("resolve_portable_images.subprocess.run", side_effect=inspect),
                contextlib.redirect_stdout(io.StringIO()),
            ):
                if tampered or wrong_revision:
                    with self.assertRaises(ValueError):
                        main()
                    self.assertFalse(output.exists())
                else:
                    main()
                    resolved = dict(
                        line.split("=", 1) for line in output.read_text().splitlines()
                    )
                    self.assertEqual(
                        {
                            resolved[f"FOLLOWREAD_{part}_IMAGE"]
                            for part in ("API", "ADMIN", "READER")
                        },
                        set(inspected),
                    )

    def test_both_image_stores_and_release_identity_formats(self):
        for store in ("classic", "containerd"):
            for kind in ("config", "manifest"):
                with self.subTest(store=store, kind=kind):
                    self.exercise(store, kind)

    def test_tampered_config_is_rejected_before_output(self):
        self.exercise("containerd", "config", tampered=True)

    def test_other_source_revision_is_rejected_before_output(self):
        self.exercise("containerd", "config", wrong_revision=True)


if __name__ == "__main__":
    unittest.main()
