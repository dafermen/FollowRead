import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pythonExecutable =
  process.platform === "win32"
    ? join(repositoryRoot, "apps", "api", ".venv", "Scripts", "python.exe")
    : join(repositoryRoot, "apps", "api", ".venv", "bin", "python");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

if (!existsSync(pythonExecutable)) {
  console.error("Python environment not found. Run `pnpm setup` first.");
  process.exit(1);
}

const pnpmCheck = spawnSync(pnpmCommand, ["--version"], {
  cwd: repositoryRoot,
  encoding: "utf8",
  shell: process.platform === "win32",
});
if (pnpmCheck.status !== 0) {
  console.error("pnpm was not found. Install pnpm 11.9.0 and open a new terminal.");
  process.exit(1);
}

if (process.argv.includes("--check")) {
  console.log(
    `FollowRead development prerequisites are available (pnpm ${pnpmCheck.stdout.trim()}).`,
  );
  process.exit(0);
}

const services = [
  {
    name: "API",
    command: pythonExecutable,
    args: [
      "-m",
      "uvicorn",
      "followread_api.main:app",
      "--app-dir",
      "apps/api/src",
      "--reload",
      "--port",
      "8000",
    ],
    shell: false,
  },
  {
    name: "Admin",
    command: pnpmCommand,
    args: ["--filter", "@followread/admin-web", "dev", "--", "--port", "5173"],
    shell: process.platform === "win32",
  },
  {
    name: "Reader",
    command: pnpmCommand,
    args: ["--filter", "@followread/reader", "dev", "--", "--port", "5174"],
    shell: process.platform === "win32",
  },
];

console.log("Starting FollowRead:");
console.log("  Reader  http://localhost:5174");
console.log("  Admin   http://localhost:5173");
console.log("  API     http://localhost:8000/docs");
console.log("Press Ctrl+C to stop all services.");

const children = new Set();
let stopping = false;

const stopAll = (exitCode) => {
  if (stopping) {
    return;
  }
  stopping = true;
  for (const child of children) {
    child.kill();
  }
  setTimeout(() => process.exit(exitCode), 1000);
};

for (const service of services) {
  const child = spawn(service.command, service.args, {
    cwd: repositoryRoot,
    env: process.env,
    shell: service.shell,
    stdio: "inherit",
  });
  children.add(child);
  child.on("error", (error) => {
    console.error(`${service.name} failed to start: ${error.message}`);
    stopAll(1);
  });
  child.on("exit", (code, signal) => {
    children.delete(child);
    if (!stopping) {
      console.error(`${service.name} stopped unexpectedly (${signal ?? code ?? "unknown"}).`);
      stopAll(code ?? 1);
    }
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
