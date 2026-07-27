import { spawnSync } from "node:child_process";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const checks = [
  ["check"],
  ["security:audit"],
  ["reader:e2e"],
  ["reader:offline-e2e"],
  ["reader:mobile-e2e"],
  ["reader:learning-e2e"],
  ["quality:a11y"],
  ["quality:budget"],
  ["quality:load"],
];

for (const [command] of checks) {
  console.log(`\n=== pnpm ${command} ===`);
  const executable =
    process.platform === "win32" ? (process.env["ComSpec"] ?? "cmd.exe") : pnpmCommand;
  const args =
    process.platform === "win32" ? ["/d", "/s", "/c", `${pnpmCommand} ${command}`] : [command];
  const result = spawnSync(executable, args, {
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
console.log("\nPASS full Phase 12 regression");
