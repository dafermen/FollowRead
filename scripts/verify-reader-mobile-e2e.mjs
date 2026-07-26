import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const readerBase = process.env["FOLLOWREAD_READER_URL"] ?? "http://localhost:5174";
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
  throw new Error("Chrome o Edge no está disponible para la verificación móvil.");
}

const profile = await mkdtemp(join(tmpdir(), "followread-mobile-e2e-"));
const evidence = join(root, "var", "e2e");
await mkdir(evidence, { recursive: true });
const process_ = spawn(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--no-first-run",
    "--disable-default-apps",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

try {
  const debugFile = join(profile, "DevToolsActivePort");
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
    await client.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 5,
    });
    await emulate(client, 390, 844, "portraitPrimary", 0);
    await client.send("Emulation.setSafeAreaInsetsOverride", {
      insets: {
        top: 47,
        topMax: 47,
        right: 0,
        rightMax: 0,
        bottom: 34,
        bottomMax: 34,
        left: 0,
        leftMax: 0,
      },
    });
    await client.send("Page.navigate", { url: readerBase });
    await waitForText(client, ["Hola, ¿qué quieres leer hoy?", "El zorro y la luna"]);
    const portrait = await evaluate(
      client,
      `(() => {
      const header = document.querySelector(".app-header");
      const nav = document.querySelector(".reader-bottom-nav");
      return {
        width: innerWidth,
        height: innerHeight,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        headerPadding: Number.parseFloat(getComputedStyle(header).paddingTop),
        navPadding: Number.parseFloat(getComputedStyle(nav).paddingBottom),
        navVisible: getComputedStyle(nav).display !== "none",
      };
    })()`,
    );
    if (
      portrait.width !== 390 ||
      portrait.height !== 844 ||
      portrait.overflow ||
      portrait.headerPadding < 47 ||
      portrait.navPadding < 34 ||
      !portrait.navVisible
    ) {
      throw new Error(`Fallo de safe areas/reflow vertical: ${JSON.stringify(portrait)}.`);
    }
    await screenshot(client, join(evidence, "phase10-reader-portrait.png"));
    console.log("PASS 390x844 con safe areas superior e inferior");

    await client.send("Page.navigate", {
      url: `${readerBase}/read/el-zorro-y-la-luna`,
    });
    await waitForText(client, ["Una luz en el bosque", "Lectura pausada"]);
    await evaluate(client, `document.querySelector('button[aria-label="Reproducir"]').click()`);
    await delay(900);
    await evaluate(client, `document.querySelector('button[aria-label="Pausar"]').click()`);
    const beforeRotation = Number(
      await evaluate(client, `document.querySelector('.progress-row input[type="range"]').value`),
    );

    await emulate(client, 844, 390, "landscapePrimary", 90);
    await client.send("Emulation.setSafeAreaInsetsOverride", {
      insets: {
        top: 0,
        topMax: 0,
        right: 47,
        rightMax: 47,
        bottom: 21,
        bottomMax: 21,
        left: 47,
        leftMax: 47,
      },
    });
    await evaluate(client, `window.dispatchEvent(new Event("orientationchange"))`);
    await delay(250);
    const landscape = await evaluate(
      client,
      `(() => ({
      width: innerWidth,
      height: innerHeight,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
        position: Number(document.querySelector('.progress-row input[type="range"]').value),
      bottomPadding: Number.parseFloat(getComputedStyle(document.querySelector(".reader-controls")).paddingBottom),
    }))()`,
    );
    if (
      landscape.width !== 844 ||
      landscape.height !== 390 ||
      landscape.overflow ||
      landscape.position !== beforeRotation ||
      landscape.bottomPadding < 21
    ) {
      throw new Error(`Fallo al conservar lectura en horizontal: ${JSON.stringify(landscape)}.`);
    }
    await screenshot(client, join(evidence, "phase10-reader-landscape.png"));
    console.log("PASS 844x390 conserva progreso, controles y safe areas");
  } finally {
    client.close();
  }
} finally {
  process_.kill();
  await new Promise((resolve) => {
    if (process_.exitCode !== null) {
      resolve();
      return;
    }
    process_.addListener("exit", resolve);
    setTimeout(resolve, 2_000);
  });
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

async function emulate(client, width, height, type, angle) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 3,
    mobile: true,
    screenWidth: width,
    screenHeight: height,
    screenOrientation: { type, angle },
  });
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails !== undefined) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function screenshot(client, path) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(path, Buffer.from(result.data, "base64"));
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

async function waitForText(client, expected) {
  await waitFor(async () => {
    const text = String(
      await evaluate(client, "document.body?.innerText ?? ''"),
    ).toLocaleLowerCase();
    return expected.every((value) => text.includes(value.toLocaleLowerCase()));
  }, expected.join(", "));
}

async function waitFor(check, label) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (await check()) {
      return;
    }
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
