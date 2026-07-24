import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const virtualEnvironment = join(repositoryRoot, "apps", "api", ".venv");
const pythonExecutable =
  process.platform === "win32"
    ? join(virtualEnvironment, "Scripts", "python.exe")
    : join(virtualEnvironment, "bin", "python");

if (!existsSync(pythonExecutable)) {
  console.error("Python environment not found. Create apps/api/.venv and install apps/api[dev].");
  process.exit(1);
}

const result = spawnSync(pythonExecutable, process.argv.slice(2), {
  cwd: repositoryRoot,
  stdio: "inherit",
});

if (result.error !== undefined) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
