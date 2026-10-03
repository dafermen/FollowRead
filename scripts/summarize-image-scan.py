"""Print scanner status without disclosing matched secret values or source lines."""

import json
import sys
from pathlib import Path

report = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
findings = []
secret_count = 0
for result in report.get("Results", []):
    secret_count += len(result.get("Secrets", []))
    for vulnerability in result.get("Vulnerabilities", []):
        findings.append(
            {
                key: vulnerability.get(key, "")
                for key in (
                    "VulnerabilityID",
                    "PkgName",
                    "InstalledVersion",
                    "FixedVersion",
                    "Severity",
                )
            }
        )
print(
    json.dumps({"vulnerabilities": findings, "secret_findings": secret_count}, indent=2)
)
