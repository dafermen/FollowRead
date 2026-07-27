import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const apiRoot = join(repositoryRoot, "apps", "api");
const virtualEnvironment = join(apiRoot, ".venv");
const virtualPython =
  process.platform === "win32"
    ? join(virtualEnvironment, "Scripts", "python.exe")
    : join(virtualEnvironment, "bin", "python");

const run = (command, args) =>
  spawnSync(command, args, {
    cwd: repositoryRoot,
    stdio: "inherit",
  });

if (!existsSync(virtualPython)) {
  const configuredPython = process.env["FOLLOWREAD_PYTHON"];
  const candidates =
    configuredPython === undefined
      ? [
          ["python", []],
          ["python3", []],
          ["py", ["-3.12"]],
        ]
      : [[configuredPython, []]];

  let created = false;
  for (const [command, prefix] of candidates) {
    const result = run(command, [...prefix, "-m", "venv", virtualEnvironment]);
    if (result.status === 0) {
      created = true;
      break;
    }
  }

  if (!created) {
    console.error("Python 3.12 was not found. Set FOLLOWREAD_PYTHON to its executable.");
    process.exit(1);
  }
}

const pipUpgrade = run(virtualPython, ["-m", "pip", "install", "--upgrade", "pip>=26.1.2,<27"]);
if (pipUpgrade.status !== 0) {
  process.exit(pipUpgrade.status ?? 1);
}

const installation = run(virtualPython, ["-m", "pip", "install", "-e", `${apiRoot}[dev]`]);
process.exit(installation.status ?? 1);
