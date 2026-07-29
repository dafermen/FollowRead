import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

const routes = [
  { path: "/", expected: ["Hola, ¿qué quieres leer hoy?", "El zorro y la luna"] },
  {
    path: "/library",
    expected: [
      "Encuentra tu próxima lectura",
      "El zorro y la luna",
      "El río entre nosotros",
      "El jardín secreto",
      "La casa de los sonidos",
    ],
  },
  {
    path: "/details/el-zorro-y-la-luna",
    expected: ["El zorro y la luna", "Comenzar a leer"],
  },
  {
    path: "/read/el-zorro-y-la-luna",
    expected: ["Una luz en el bosque", "Lectura pausada"],
    englishExpected: "A Light in the Forest",
  },
  {
    path: "/read/the-river-between-us",
    expected: ["Dos orillas", "Lectura pausada"],
    englishExpected: "Two Riverbanks",
  },
  {
    path: "/read/el-jardin-secreto",
    expected: ["Un refugio entre edificios", "Lectura pausada"],
    englishExpected: "A Refuge Between Buildings",
  },
  {
    path: "/read/la-casa-de-los-sonidos",
    expected: ["La casa despierta", "Lectura pausada"],
    englishExpected: "The House Awakens",
  },
  {
    path: "/settings",
    expected: ["Ajusta tu experiencia", "Modo infantil", "Aprender inglés"],
  },
  {
    path: "/downloads",
    expected: ["Descargas", "El zorro y la luna", "Incluido con la app"],
  },
];

const profileDirectory = await mkdtemp(join(tmpdir(), "followread-e2e-"));
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
    for (const route of routes) {
      await client.send("Page.navigate", { url: `${readerBase}${route.path}` });
      await waitForText(client, route.expected);
      if (route.path === "/read/el-zorro-y-la-luna") {
        await client.send("Runtime.evaluate", {
          expression: `
            document.querySelector('button[aria-label="Capítulo siguiente"]')?.click()
          `,
        });
        await waitForText(client, ["El sendero brillante"]);
        await waitFor(async () => {
          const result = await client.send("Runtime.evaluate", {
            expression: `
              document.querySelector(".story-visual img")
                ?.getAttribute("src") ?? ""
            `,
            returnByValue: true,
          });
          return String(result.result.value).endsWith("/stories/el-zorro-y-la-luna-chapter-2.png");
        }, "chapter 2 illustration");
        console.log("PASS chapter illustration fallback and switch");
      }
      if (route.englishExpected !== undefined) {
        await client.send("Runtime.evaluate", {
          expression: `
            [...document.querySelectorAll("button")]
              .find((button) => button.textContent?.trim() === "EN")
              ?.click()
          `,
        });
        await waitForText(client, [route.englishExpected]);
        console.log(`PASS bilingual ${route.path}`);
      }
      console.log(`PASS ${route.path}`);
    }
  } finally {
    client.close();
  }

  const manifest = await fetch(`${readerBase}/manifest.webmanifest`);
  if (!manifest.ok || !(await manifest.text()).includes("FollowRead Reader")) {
    throw new Error("El manifest PWA no está disponible.");
  }
  console.log("PASS manifest PWA");
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
  try {
    await waitFor(async () => {
      const result = await client.send("Runtime.evaluate", {
        expression: "document.body?.innerText ?? ''",
        returnByValue: true,
      });
      const text = String(result.result.value).toLocaleLowerCase();
      return expected.every((value) => text.includes(value.toLocaleLowerCase()));
    }, expected.join(", "));
  } catch (error) {
    const result = await client.send("Runtime.evaluate", {
      expression: "document.body?.innerText ?? ''",
      returnByValue: true,
    });
    throw new Error(
      `${error instanceof Error ? error.message : String(error)} Visible text: ${String(
        result.result.value,
      ).slice(0, 800)}`,
      { cause: error },
    );
  }
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
