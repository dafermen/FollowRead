import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirectory = join(repositoryRoot, "docs", "assets", "screenshots");
const readerBase = process.env["FOLLOWREAD_READER_URL"] ?? "http://localhost:5174";
const adminBase = process.env["FOLLOWREAD_ADMIN_URL"] ?? "http://localhost:5173";
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
  throw new Error("Chrome or Edge is required to capture README screenshots.");
}

const targets = [
  {
    name: "reader-library.png",
    url: `${readerBase}/library`,
    expected: ["Encuentra tu próxima lectura", "La casa de los sonidos"],
  },
  {
    name: "reader-synchronized-reading.png",
    url: `${readerBase}/read/el-zorro-y-la-luna`,
    expected: ["Una luz en el bosque", "Lectura pausada"],
  },
  {
    name: "admin-dashboard.png",
    url: `${adminBase}/`,
    expected: ["Buenos días", "Hay trabajo listo para continuar"],
  },
  {
    name: "admin-catalog.png",
    url: `${adminBase}/content`,
    expected: ["Contenido", "La casa de los sonidos"],
  },
];

for (const baseUrl of [readerBase, adminBase]) {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error(`${baseUrl} is not ready (${String(response.status)}).`);
  }
}

await mkdir(outputDirectory, { recursive: true });
const profileDirectory = await mkdtemp(join(tmpdir(), "followread-screenshots-"));
const browserProcess = spawn(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-extensions",
    "--hide-scrollbars",
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
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    for (const screenshot of targets) {
      await client.send("Page.navigate", { url: screenshot.url });
      await waitForText(client, screenshot.expected);
      await client.send("Runtime.evaluate", {
        expression: "window.scrollTo({ top: 0, behavior: 'instant' })",
      });
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      const result = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      await writeFile(join(outputDirectory, screenshot.name), result.data, "base64");
      console.log(`Captured docs/assets/screenshots/${screenshot.name}`);
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
    const result = await client.send("Runtime.evaluate", {
      expression: "document.body?.innerText ?? ''",
      returnByValue: true,
    });
    const text = String(result.result.value).toLocaleLowerCase();
    return expected.every((value) => text.includes(value.toLocaleLowerCase()));
  }, expected.join(", "));
}

async function waitFor(check, label) {
  const deadline = Date.now() + 20_000;
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
