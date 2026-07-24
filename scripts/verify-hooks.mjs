import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const hook = readFileSync(".githooks/pre-commit", "utf8");
if (!hook.includes("pnpm check:fast") || !hook.includes("pnpm.cmd check:fast")) {
  console.error("The pre-commit hook does not support the expected pnpm commands.");
  process.exit(1);
}

const result = spawnSync("git", ["config", "--local", "--get", "core.hooksPath"], {
  encoding: "utf8",
});
if (result.status !== 0 || result.stdout.trim() !== ".githooks") {
  console.error("Run pnpm hooks:install before committing.");
  process.exit(1);
}

const gitPathResult = spawnSync("git", ["rev-parse", "--git-path", "followread-hooks.env"], {
  encoding: "utf8",
});
const hookEnvironmentPath = gitPathResult.stdout.trim();
if (
  gitPathResult.status !== 0 ||
  !hookEnvironmentPath ||
  !existsSync(hookEnvironmentPath) ||
  !readFileSync(hookEnvironmentPath, "utf8").startsWith("FOLLOWREAD_PNPM=")
) {
  console.error("Run pnpm hooks:install to register the local pnpm path.");
  process.exit(1);
}

console.log("Git hook configuration PASS");
