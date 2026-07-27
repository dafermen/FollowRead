/* global CSS, document, getComputedStyle, window */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const readerBase = process.env["FOLLOWREAD_READER_URL"] ?? "http://localhost:5174";
const adminBase = process.env["FOLLOWREAD_ADMIN_URL"] ?? "http://localhost:5173";
const routes = [
  { name: "Reader inicio", url: `${readerBase}/` },
  { name: "Reader biblioteca", url: `${readerBase}/library` },
  { name: "Reader lectura", url: `${readerBase}/read/el-zorro-y-la-luna` },
  { name: "Reader ajustes", url: `${readerBase}/settings` },
  { name: "Admin inicio", url: `${adminBase}/` },
  { name: "Admin contenidos", url: `${adminBase}/content` },
  { name: "Admin acceso", url: `${adminBase}/login` },
  { name: "Documentación", url: `${adminBase}/documentation` },
];
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
  throw new Error("Chrome o Edge no está disponible para la auditoría de accesibilidad.");
}

for (const baseUrl of [readerBase, adminBase]) {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error(`${baseUrl} no está disponible.`);
  }
}

const profileDirectory = await mkdtemp(join(tmpdir(), "followread-a11y-"));
const browserProcess = spawn(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--no-first-run",
    "--disable-default-apps",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDirectory}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

try {
  const debugFile = join(profileDirectory, "DevToolsActivePort");
  await waitFor(() => existsSync(debugFile), "Chrome debugging endpoint");
  const [port] = (await readFile(debugFile, "utf8")).split(/\r?\n/u);
  const target = await (
    await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(readerBase)}`, {
      method: "PUT",
    })
  ).json();
  const client = await createCdpClient(target.webSocketDebuggerUrl);
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    for (const route of routes) {
      await client.send("Page.navigate", { url: route.url });
      await waitForReady(client);
      const result = await client.send("Runtime.evaluate", {
        expression: `(${auditPage.toString()})()`,
        returnByValue: true,
      });
      const violations = result.result.value;
      if (!Array.isArray(violations)) {
        throw new Error(`No se pudo auditar ${route.name}.`);
      }
      if (violations.length > 0) {
        throw new Error(`${route.name}: ${violations.join("; ")}`);
      }
      console.log(`PASS ${route.name}`);
    }
  } finally {
    client.close();
  }
} finally {
  browserProcess.kill();
  await new Promise((resolve) => {
    if (browserProcess.exitCode !== null) {
      resolve();
      return;
    }
    browserProcess.addListener("exit", resolve);
    setTimeout(resolve, 2_000);
  });
  await rm(profileDirectory, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 200,
  });
}

function auditPage() {
  const violations = [];
  const visible = (element) => {
    const style = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0;
  };
  const accessibleName = (element) =>
    (
      element.getAttribute("aria-label") ??
      element.getAttribute("title") ??
      element.textContent ??
      ""
    ).trim();
  if ((document.documentElement.lang ?? "").trim() === "") {
    violations.push("el documento no declara idioma");
  }
  if (document.querySelectorAll("main").length !== 1) {
    violations.push("debe existir exactamente un elemento main");
  }
  if (document.querySelectorAll("h1").length !== 1) {
    violations.push("debe existir exactamente un encabezado h1");
  }
  const identifiers = Array.from(document.querySelectorAll("[id]"), (element) => element.id);
  const duplicates = identifiers.filter(
    (identifier, index) => identifiers.indexOf(identifier) !== index,
  );
  if (duplicates.length > 0) {
    violations.push(`IDs duplicados: ${[...new Set(duplicates)].join(", ")}`);
  }
  for (const image of document.querySelectorAll("img")) {
    if (!image.hasAttribute("alt")) {
      violations.push("imagen sin atributo alt");
      break;
    }
  }
  for (const control of document.querySelectorAll("button, a[href]")) {
    if (visible(control) && accessibleName(control) === "") {
      violations.push(`${control.tagName.toLowerCase()} visible sin nombre accesible`);
      break;
    }
  }
  for (const field of document.querySelectorAll("input, select, textarea")) {
    const id = field.getAttribute("id");
    const labelled =
      field.hasAttribute("aria-label") ||
      field.hasAttribute("aria-labelledby") ||
      (id !== null && document.querySelector(`label[for="${CSS.escape(id)}"]`) !== null) ||
      field.closest("label") !== null;
    if (visible(field) && !labelled) {
      violations.push(`${field.tagName.toLowerCase()} visible sin etiqueta`);
      break;
    }
  }
  if (document.documentElement.scrollWidth > window.innerWidth + 2) {
    violations.push("desbordamiento horizontal en viewport móvil");
  }
  return violations;
}

async function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id === undefined) {
      return;
    }
    const request = pending.get(message.id);
    if (request === undefined) {
      return;
    }
    pending.delete(message.id);
    if (message.error === undefined) {
      request.resolve(message.result);
    } else {
      request.reject(new Error(message.error.message));
    }
  });
  return {
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      socket.close();
    },
  };
}

async function waitForReady(client) {
  await waitFor(async () => {
    const result = await client.send("Runtime.evaluate", {
      expression:
        "document.readyState === 'complete' && document.querySelector('main') !== null && document.querySelector('h1') !== null",
      returnByValue: true,
    });
    return result.result.value === true;
  }, "contenido accesible");
}

async function waitFor(check, label) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (await check()) {
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 200);
    });
  }
  throw new Error(`Timed out waiting for ${label}.`);
}
