"""Resolve a checksum-verified Docker archive to immutable IDs on this host."""

import argparse
import hashlib
import json
import re
import subprocess
import tarfile
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--release-env", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    values = {}
    for line in args.release_env.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        key, separator, value = line.partition("=")
        if not separator or key in values:
            raise ValueError("Malformed or duplicate release setting")
        values[key] = value
    revision = values.get("FOLLOWREAD_REVISION", "")
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        raise ValueError("An exact release revision is required")
    with tarfile.open(args.archive) as archive:

        def blob(digest):
            if not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
                raise ValueError("Unsupported archive digest")
            member = archive.getmember("blobs/sha256/" + digest.split(":")[1])
            if not member.isfile() or member.size > 1024 * 1024:
                raise ValueError("Invalid image metadata")
            data = archive.extractfile(member).read()
            if "sha256:" + hashlib.sha256(data).hexdigest() != digest:
                raise ValueError("Image metadata checksum mismatch")
            return json.loads(data)

        index = json.load(archive.extractfile("index.json"))
        for component in ("api", "admin", "reader"):
            key = f"FOLLOWREAD_{component.upper()}_IMAGE"
            expected = values[key]
            matches = []
            for descriptor in index["manifests"]:
                manifest = blob(descriptor["digest"])
                if expected in (
                    descriptor["digest"],
                    manifest.get("config", {}).get("digest"),
                ):
                    matches.append((descriptor["digest"], manifest))
            if len(matches) != 1:
                raise ValueError(f"{component}: no unique approved image in archive")
            manifest_digest, manifest = matches[0]
            config_digest = manifest["config"]["digest"]
            config = blob(config_digest)
            if (
                config.get("os") != "linux"
                or config.get("architecture") != "amd64"
                or config.get("config", {})
                .get("Labels", {})
                .get("org.opencontainers.image.revision")
                != revision
            ):
                raise ValueError("Archive revision/platform mismatch")
            verified = None
            for candidate in dict.fromkeys((expected, config_digest, manifest_digest)):
                result = subprocess.run(
                    ["docker", "image", "inspect", candidate],
                    capture_output=True,
                    text=True,
                    check=False,
                )
                if result.returncode:
                    continue
                item = json.loads(result.stdout)[0]
                if (
                    item["Id"] == candidate
                    and item.get("Os") == "linux"
                    and item.get("Architecture") == "amd64"
                    and item.get("Config", {})
                    .get("Labels", {})
                    .get("org.opencontainers.image.revision")
                    == revision
                    and item.get("RootFS", {}).get("Layers")
                    == config["rootfs"]["diff_ids"]
                ):
                    verified = candidate
                    break
            if verified is None:
                raise ValueError(f"{component}: approved image is not loaded")
            values[key] = verified
            print(f"Verified {component}: {expected} -> {verified}")
    with args.output.open("x", encoding="utf-8") as stream:
        args.output.chmod(0o600)
        stream.write("".join(f"{key}={value}\n" for key, value in values.items()))


if __name__ == "__main__":
    main()
