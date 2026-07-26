import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
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
  throw new Error("Chrome o Edge no está disponible para la verificación offline.");
}

const profileDirectory = await mkdtemp(join(tmpdir(), "followread-offline-e2e-"));
const evidenceDirectory = join(repositoryRoot, "var", "e2e");
await mkdir(evidenceDirectory, { recursive: true });
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
  const targetResponse = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${readerBase}/downloads`)}`,
    { method: "PUT" },
  );
  const target = await targetResponse.json();
  const client = await createCdpClient(target.webSocketDebuggerUrl);
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Network.enable");
    await client.send("Page.navigate", { url: `${readerBase}/downloads` });
    try {
      await waitForText(client, ["Descargas", "El zorro y la luna", "Incluido con la app"]);
    } catch (error) {
      const diagnostic = await offlineDiagnostic(client);
      throw new Error(`${error.message} Diagnostic: ${JSON.stringify(diagnostic)}.`, {
        cause: error,
      });
    }
    await waitForServiceWorker(client);
    await saveScreenshot(client, join(evidenceDirectory, "phase9-downloads.png"));
    console.log("PASS paquete inicial y pantalla de descargas");

    await client.send("Network.emulateNetworkConditions", offlineConditions(true));
    await client.send("Page.navigate", {
      url: `${readerBase}/read/el-zorro-y-la-luna`,
    });
    await waitForText(client, ["Una luz en el bosque"]);
    await client.send("Runtime.evaluate", {
      expression: `window.dispatchEvent(new Event("offline"))`,
    });
    try {
      await waitForText(client, ["Una luz en el bosque", "Sin conexión"]);
    } catch (error) {
      const result = await client.send("Runtime.evaluate", {
        expression: "document.body?.innerText ?? ''",
        returnByValue: true,
      });
      throw new Error(`${error.message} Body: ${String(result.result.value)}.`, {
        cause: error,
      });
    }
    await saveScreenshot(client, join(evidenceDirectory, "phase9-offline-reader.png"));
    console.log("PASS lectura completa sin conexión");

    await client.send("Runtime.evaluate", {
      expression: `document.querySelector('button[aria-label="Reproducir"]').click()`,
    });
    await waitFor(async () => (await pendingOperationCount(client)) > 0, "offline progress queue");
    console.log("PASS progreso conservado en cola local");

    await client.send("Network.emulateNetworkConditions", offlineConditions(false));
    await client.send("Runtime.evaluate", {
      expression: `window.dispatchEvent(new Event("online"))`,
    });
    await waitFor(async () => (await pendingOperationCount(client)) === 0, "progress confirmation");
    await waitForText(client, ["Sincronizado"]);
    console.log("PASS reconexión y sincronización confirmada");
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

async function waitForServiceWorker(client) {
  await client.send("Runtime.evaluate", {
    expression: "navigator.serviceWorker.ready.then(() => true)",
    awaitPromise: true,
    returnByValue: true,
  });
}

async function pendingOperationCount(client) {
  const result = await client.send("Runtime.evaluate", {
    expression: `new Promise((resolve, reject) => {
      const request = indexedDB.open("followread-reader-offline", 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const transaction = request.result.transaction("operations", "readonly");
        const count = transaction.objectStore("operations").count();
        count.onsuccess = () => resolve(count.result);
        count.onerror = () => reject(count.error);
      };
    })`,
    awaitPromise: true,
    returnByValue: true,
  });
  return Number(result.result.value);
}

async function offlineDiagnostic(client) {
  const result = await client.send("Runtime.evaluate", {
    expression: `Promise.race([
      import("/src/offlineService.ts").then((module) =>
        module.listOfflinePackages().then((packages) => ({
          state: "resolved",
          packages: packages.map((item) => item.slug),
          body: document.body.innerText,
        })).catch((error) => ({
          state: "rejected",
          error: String(error?.stack ?? error),
          body: document.body.innerText,
        }))
      ),
      new Promise((resolve) => setTimeout(() => resolve({
        state: "pending",
        body: document.body.innerText,
      }), 2000)),
    ])`,
    awaitPromise: true,
    returnByValue: true,
  });
  return result.result.value;
}

async function saveScreenshot(client, path) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(path, Buffer.from(result.data, "base64"));
}

function offlineConditions(offline) {
  return {
    offline,
    latency: 0,
    downloadThroughput: offline ? 0 : -1,
    uploadThroughput: offline ? 0 : -1,
  };
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
