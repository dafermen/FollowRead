#!/usr/bin/env bash
set -euo pipefail
image=${1:?An image reference is required}
label=${2:?An artifact label is required}
[[ "$label" =~ ^[a-z0-9-]+$ ]] || { echo "Invalid scan label" >&2; exit 2; }
mkdir -p .release/scans
docker save -o ".release/scans/$label.tar" "$image"
scanner=aquasec/trivy:0.74.0@sha256:62b1e65e8869bc4b4c6aa4fa2b21595256c7c2f6018a9d9ad61caf87187c1969
# Exported images only: the scanner receives neither Docker socket nor GitHub/SSH credentials.
docker run --rm --mount "type=bind,source=$PWD/.release/scans,target=/scan" "$scanner" image --quiet --cache-dir /scan/cache --input "/scan/$label.tar" --scanners vuln,secret --severity HIGH,CRITICAL --format json --output "/scan/$label.json" --exit-code 1
