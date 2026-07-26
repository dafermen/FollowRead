import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const readerBase = process.env["FOLLOWREAD_READER_URL"] ?? "http://localhost:5174";
const apiBase = process.env["FOLLOWREAD_API_URL"] ?? "http://localhost:8000";

const browserCandidates =
  process.platform === "win32"
    ? [
        join(process.env["ProgramFiles"] ?? "", "Google", "Chrome", "Application", "chrome.exe"),
        join(
          process.env["ProgramFiles(x86)"] ?? "",
          "Google",
          "Chrome",
          "Application",
          "chrome.exe",
        ),
        join(process.env["LOCALAPPDATA"] ?? "", "Google", "Chrome", "Application", "chrome.exe"),
        join(process.env["ProgramFiles"] ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
      ]
    : [
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      ];

const browser = browserCandidates.find((candidate) => candidate !== "" && existsSync(candidate));
if (browser === undefined) {
  throw new Error("Chrome o Edge no está disponible para la verificación E2E.");
}

const health = await fetch(`${apiBase}/health`);
if (!health.ok) {
  throw new Error(`La API no está lista: ${String(health.status)}.`);
}

const profileDirectory = mkdtempSync(join(tmpdir(), "followread-e2e-"));
try {
  const routes = [
    {
      path: "/",
      expected: ["Hola, ¿qué quieres leer hoy?", "El zorro y la luna"],
    },
    {
      path: "/library",
      expected: ["Encuentra tu próxima lectura", "Amistad", "Inicial"],
    },
    {
      path: "/details/el-zorro-y-la-luna",
      expected: ["El zorro y la luna", "Comenzar a leer"],
    },
    {
      path: "/read/el-zorro-y-la-luna",
      expected: ["Una luz en el bosque", "Reproducir"],
    },
    {
      path: "/settings",
      expected: ["Ajusta tu experiencia", "Modo infantil", "Aprender inglés"],
    },
  ];

  for (const route of routes) {
    const result = spawnSync(
      browser,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--disable-default-apps",
        "--disable-extensions",
        "--virtual-time-budget=4000",
        `--user-data-dir=${profileDirectory}`,
        "--dump-dom",
        `${readerBase}${route.path}`,
      ],
      { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
    );
    if (result.error !== undefined) {
      throw result.error;
    }
    const missing = route.expected.filter((text) => !result.stdout.includes(text));
    if (missing.length > 0) {
      throw new Error(`${route.path} no mostró: ${missing.join(", ")}.`);
    }
    console.log(`PASS ${route.path}`);
  }

  const manifest = await fetch(`${readerBase}/manifest.webmanifest`);
  if (!manifest.ok || !(await manifest.text()).includes("FollowRead Reader")) {
    throw new Error("El manifest PWA no está disponible.");
  }
  console.log("PASS manifest PWA");
} finally {
  rmSync(profileDirectory, { recursive: true, force: true });
}
