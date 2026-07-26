import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const reader = join(root, "apps", "reader");
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const requireFile = (...parts) => {
  const path = join(root, ...parts);
  if (!existsSync(path)) {
    throw new Error(`Falta el archivo móvil requerido: ${parts.join("/")}.`);
  }
  return path;
};
const assertIncludes = (value, expected, label) => {
  if (!value.includes(expected)) {
    throw new Error(`${label} no contiene ${expected}.`);
  }
};

const capacitorConfig = read("apps", "reader", "capacitor.config.ts");
assertIncludes(capacitorConfig, 'appId: "com.followread.reader"', "capacitor.config.ts");
assertIncludes(capacitorConfig, 'webDir: "dist"', "capacitor.config.ts");
if (/admin-web|apps\/admin/iu.test(capacitorConfig)) {
  throw new Error("El Admin no puede formar parte del build Capacitor.");
}

requireFile("apps", "reader", "android", "app", "build.gradle");
requireFile("apps", "reader", "android", "gradlew.bat");
requireFile("apps", "reader", "ios", "App", "App.xcodeproj", "project.pbxproj");
requireFile("apps", "reader", "ios", "App", "App", "Info.plist");

const androidManifest = read(
  "apps",
  "reader",
  "android",
  "app",
  "src",
  "main",
  "AndroidManifest.xml",
);
assertIncludes(androidManifest, "android.permission.INTERNET", "AndroidManifest.xml");
for (const forbidden of [
  "READ_EXTERNAL_STORAGE",
  "WRITE_EXTERNAL_STORAGE",
  "RECORD_AUDIO",
  "ACCESS_FINE_LOCATION",
  "CAMERA",
]) {
  if (androidManifest.includes(forbidden)) {
    throw new Error(`Permiso Android innecesario detectado: ${forbidden}.`);
  }
}

const iosInfo = read("apps", "reader", "ios", "App", "App", "Info.plist");
assertIncludes(iosInfo, "UIInterfaceOrientationPortrait", "Info.plist");
assertIncludes(iosInfo, "UIInterfaceOrientationLandscapeLeft", "Info.plist");
if (iosInfo.includes("UIBackgroundModes")) {
  throw new Error("El MVP no debe declarar audio en segundo plano sin una fuente nativa continua.");
}
for (const forbidden of [
  "NSCameraUsageDescription",
  "NSMicrophoneUsageDescription",
  "NSLocation",
]) {
  if (iosInfo.includes(forbidden)) {
    throw new Error(`Permiso iOS innecesario detectado: ${forbidden}.`);
  }
}

const indexHtml = read("apps", "reader", "index.html");
assertIncludes(indexHtml, "viewport-fit=cover", "Reader index.html");
const styles = read("apps", "reader", "src", "styles.css");
assertIncludes(styles, "safe-area-inset-top", "Reader styles");
assertIncludes(styles, "safe-area-inset-bottom", "Reader styles");
const runtime = read("apps", "reader", "src", "mobileRuntime.ts");
for (const capability of ["@capacitor/app", "@capacitor/network", "appStateChange"]) {
  assertIncludes(runtime, capability, "mobileRuntime.ts");
}

const expectedAssets = [
  ["icon-only.png", 1024, 1024],
  ["icon-foreground.png", 1024, 1024],
  ["icon-background.png", 1024, 1024],
  ["splash.png", 2732, 2732],
  ["splash-dark.png", 2732, 2732],
];
for (const [name, width, height] of expectedAssets) {
  const path = requireFile("apps", "reader", "assets", name);
  const bytes = readFileSync(path);
  if (bytes.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`${name} no es un PNG válido.`);
  }
  if (bytes.readUInt32BE(16) !== width || bytes.readUInt32BE(20) !== height) {
    throw new Error(`${name} no tiene dimensiones ${width}x${height}.`);
  }
}

const nativeText = [
  capacitorConfig,
  androidManifest,
  iosInfo,
  read("apps", "reader", "android", "app", "build.gradle"),
  read("apps", "reader", "ios", "App", "App.xcodeproj", "project.pbxproj"),
].join("\n");
if (/admin-web|FollowRead Admin/iu.test(nativeText)) {
  throw new Error("Se detectó una referencia administrativa dentro del proyecto móvil.");
}

if (!reader.startsWith(root)) {
  throw new Error("La configuración móvil debe permanecer dentro del repositorio.");
}

console.log("PASS Capacitor empaqueta exclusivamente apps/reader/dist");
console.log("PASS Android e iOS están versionados con identificador com.followread.reader");
console.log("PASS permisos nativos mínimos y sin audio en segundo plano");
console.log("PASS iconos, splash claro/oscuro, orientación y safe areas");
