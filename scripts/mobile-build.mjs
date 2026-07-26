import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const platform = process.argv[2];
if (platform !== "android") {
  throw new Error("Este helper automatiza el build Android. iOS debe compilarse en macOS.");
}

const environment = { ...process.env };
if (environment["ANDROID_SDK_ROOT"] === undefined || environment["ANDROID_SDK_ROOT"] === "") {
  environment["ANDROID_SDK_ROOT"] =
    environment["ANDROID_HOME"] ?? join(environment["LOCALAPPDATA"] ?? "", "Android", "Sdk");
}
if (environment["JAVA_HOME"] === undefined || environment["JAVA_HOME"] === "") {
  environment["JAVA_HOME"] =
    process.platform === "win32"
      ? join(environment["ProgramFiles"] ?? "", "Android", "Android Studio", "jbr")
      : "";
}

if (!existsSync(environment["ANDROID_SDK_ROOT"])) {
  throw new Error("Android SDK no está instalado. Ejecuta `pnpm mobile:doctor android`.");
}
if (!existsSync(join(environment["JAVA_HOME"], "bin"))) {
  throw new Error("Java 21 no está instalado. Ejecuta `pnpm mobile:doctor android`.");
}

const androidProject = join(process.cwd(), "apps", "reader", "android");
const executable =
  process.platform === "win32" ? (environment["ComSpec"] ?? "cmd.exe") : "./gradlew";
const arguments_ =
  process.platform === "win32"
    ? ["/d", "/s", "/c", "gradlew.bat assembleDebug"]
    : ["assembleDebug"];
const result = spawnSync(executable, arguments_, {
  cwd: androidProject,
  env: environment,
  stdio: "inherit",
  shell: false,
});
if (result.error !== undefined) {
  throw result.error;
}
process.exitCode = result.status ?? 1;
if (result.status === 0) {
  console.log("APK listo: apps/reader/android/app/build/outputs/apk/debug/app-debug.apk");
}
