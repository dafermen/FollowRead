import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const result = spawnSync("git", ["config", "--local", "core.hooksPath", ".githooks"], {
  stdio: "inherit",
});

if (result.status !== 0) {
  console.error("Unable to configure the local Git hooks path.");
  process.exit(result.status ?? 1);
}

const lookupCommand = process.platform === "win32" ? "where.exe" : "which";
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const lookup = spawnSync(lookupCommand, [pnpmCommand], { encoding: "utf8" });
const pnpmPath = lookup.stdout?.split(/\r?\n/u).find(Boolean);

if (lookup.status !== 0 || !pnpmPath) {
  console.error("Unable to locate pnpm while configuring Git hooks.");
  process.exit(lookup.status ?? 1);
}

const gitPathResult = spawnSync("git", ["rev-parse", "--git-path", "followread-hooks.env"], {
  encoding: "utf8",
});
const hookEnvironmentPath = gitPathResult.stdout.trim();
if (gitPathResult.status !== 0 || !hookEnvironmentPath) {
  console.error("Unable to locate the repository Git directory.");
  process.exit(gitPathResult.status ?? 1);
}

const shellSafePnpmPath = pnpmPath.replaceAll("\\", "/").replaceAll("'", "'\\''");
writeFileSync(hookEnvironmentPath, `FOLLOWREAD_PNPM='${shellSafePnpmPath}'\n`, "utf8");

console.log("Git hooks configured at .githooks with a local pnpm path.");
