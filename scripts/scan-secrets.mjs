import { spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";

const result = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  encoding: "utf8",
  shell: false,
});
if (result.status !== 0) throw new Error("Could not enumerate repository files");
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/u,
  /\bAKIA[A-Z0-9]{16}\b/u,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/u,
];
const failures = [];
for (const path of new Set(result.stdout.split("\0").filter(Boolean))) {
  if (
    /\.(?:pem|key|p12|pfx|db|sqlite3?)$/iu.test(path) ||
    /(?:^|\/)\.env(?:$|\.(?!example$))/u.test(path)
  ) {
    failures.push(`${path}: sensitive file must not be committed`);
    continue;
  }
  if (!/\.(?:py|mjs|js|ts|tsx|json|yaml|yml|md|toml|env|sh)$/u.test(path)) continue;
  try {
    if (!(await stat(path)).isFile()) continue;
    const lines = (await readFile(path, "utf8")).split(/\r?\n/u);
    lines.forEach((line, index) => {
      if (patterns.some((pattern) => pattern.test(line)))
        failures.push(`${path}:${index + 1}: possible credential`);
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
if (failures.length) throw new Error(failures.join("\n"));
console.log("Repository credential pattern scan PASS (no matching values are printed)");
