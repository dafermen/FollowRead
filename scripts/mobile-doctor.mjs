import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const requestedPlatform = process.argv[2] ?? "all";
if (!["all", "android", "ios"].includes(requestedPlatform)) {
  throw new Error("Uso: pnpm mobile:doctor [all|android|ios]");
}

const checks = [];
const add = (name, ready, detail, required = true) => {
  checks.push({ name, ready, detail, required });
};
const commandAvailable = (command, arguments_ = ["--version"]) => {
  const result = spawnSync(command, arguments_, { encoding: "utf8", shell: false });
  return {
    ready: result.status === 0,
    detail: (result.stdout || result.stderr || "no disponible").trim().split(/\r?\n/u)[0],
  };
};
const androidSdk =
  process.env["ANDROID_SDK_ROOT"] ??
  process.env["ANDROID_HOME"] ??
  join(process.env["LOCALAPPDATA"] ?? "", "Android", "Sdk");
const bundledJava =
  process.platform === "win32"
    ? join(process.env["ProgramFiles"] ?? "", "Android", "Android Studio", "jbr", "bin", "java.exe")
    : "";

const nodeMajor = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
add("Node.js 24", nodeMajor === 24, process.versions.node);
add("Proyecto Android", existsSync(join("apps", "reader", "android")), "apps/reader/android");
add("Proyecto iOS", existsSync(join("apps", "reader", "ios")), "apps/reader/ios");

if (requestedPlatform === "all" || requestedPlatform === "android") {
  const java = existsSync(bundledJava) ? commandAvailable(bundledJava) : commandAvailable("java");
  add("Java 21", java.ready && java.detail.includes("21"), java.detail);
  add("Android SDK", androidSdk !== "" && existsSync(androidSdk), androidSdk || "sin configurar");
  const adbPath = join(
    androidSdk,
    "platform-tools",
    process.platform === "win32" ? "adb.exe" : "adb",
  );
  const adb = existsSync(adbPath) ? commandAvailable(adbPath) : commandAvailable("adb");
  add("ADB", adb.ready, adb.detail, false);
}

if (requestedPlatform === "all" || requestedPlatform === "ios") {
  const macos = process.platform === "darwin";
  add("macOS", macos, macos ? process.platform : "iOS requiere macOS");
  const xcode = commandAvailable("xcodebuild", ["-version"]);
  add("Xcode", xcode.ready, xcode.detail);
}

for (const check of checks) {
  console.log(
    `${check.ready ? "PASS" : check.required ? "MISSING" : "OPTIONAL"} ${check.name}: ${check.detail}`,
  );
}

const missing = checks.filter((check) => check.required && !check.ready);
if (missing.length > 0) {
  console.log(
    `\nEntorno incompleto para build nativo (${missing.map((check) => check.name).join(", ")}).`,
  );
  console.log("La configuración, el build web y `cap sync` pueden validarse igualmente.");
} else {
  console.log("\nEntorno listo para el build nativo solicitado.");
}
