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
  throw new Error("Chrome o Edge no está disponible para la verificación de aprendizaje.");
}

const outputDirectory = join(repositoryRoot, "var", "e2e");
await mkdir(outputDirectory, { recursive: true });
const profileDirectory = await mkdtemp(join(tmpdir(), "followread-learning-e2e-"));
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
    await setViewport(client, 1440, 1000);
    await navigate(client, `${readerBase}/settings`);
    await evaluate(
      client,
      `localStorage.clear();
       localStorage.setItem("followread-reader-preferences-v1", JSON.stringify({
         mode: "learning",
         theme: "light",
         fontScale: 1.1,
         showPointer: true,
         autoScroll: false,
         reduceMotion: true,
         narrationEnabled: false,
         defaultLanguage: "en",
         playbackRate: 0.75,
         showTranslation: false
       }));`,
    );

    await navigate(client, `${readerBase}/read/el-zorro-y-la-luna`);
    await waitForText(client, ["Modo aprender inglés", "A Light in the Forest", "watched"]);
    await waitFor(
      async () =>
        (await evaluate(
          client,
          `(() => {
            const image = document.querySelector(".story-visual img");
            return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
          })()`,
        )) === true,
      "reader cover",
    );
    const cover = await evaluate(
      client,
      `(() => {
        const image = document.querySelector(".story-visual img");
        if (!(image instanceof HTMLImageElement)) return null;
        const bounds = image.getBoundingClientRect();
        return {
          complete: image.complete,
          naturalWidth: image.naturalWidth,
          width: Math.round(bounds.width),
          height: Math.round(bounds.height)
        };
      })()`,
    );
    if (
      cover === null ||
      cover.complete !== true ||
      cover.naturalWidth < 1 ||
      cover.width < 200 ||
      cover.height < 100
    ) {
      throw new Error(`La portada no se renderizó correctamente: ${JSON.stringify(cover)}.`);
    }
    await clickByText(client, "button", "Mostrar traducción");
    await waitForText(client, ["Traducción editorial", "Milo era un zorro"]);
    await clickByText(client, "button.story-word", "watched");
    await waitForText(client, ["Vocabulario contextual", "miraba", "Ejemplo en el cuento"]);
    await clickByText(client, "button", "+ Guardar palabra");
    await clickByText(client, "button", "☆ Favorita");
    await capture(client, join(outputDirectory, "phase11-learning-reader-desktop.png"));

    const persisted = await evaluate(
      client,
      `({
        vocabulary: JSON.parse(localStorage.getItem("followread-reader-vocabulary-v1") ?? "[]"),
        history: JSON.parse(localStorage.getItem("followread-reader-learning-history-v1") ?? "[]")
      })`,
    );
    if (
      persisted.vocabulary.length !== 1 ||
      persisted.vocabulary[0]?.favorite !== true ||
      persisted.history.length !== 1
    ) {
      throw new Error("El vocabulario, favorito o historial educativo no se conservaron.");
    }

    await navigate(client, `${readerBase}/vocabulary`);
    await waitForText(client, ["Mi vocabulario de inglés", "watched", "Actividad reciente"]);
    await clickByText(client, "button", "Favoritas");
    await waitForText(client, ["watched", "1 consulta"]);
    await capture(client, join(outputDirectory, "phase11-vocabulary-desktop.png"));

    await setViewport(client, 390, 844);
    await navigate(client, `${readerBase}/vocabulary`);
    await waitForText(client, ["Mi vocabulario de inglés", "watched"]);
    const overflow = await evaluate(
      client,
      "document.documentElement.scrollWidth > document.documentElement.clientWidth",
    );
    if (overflow === true) {
      throw new Error("La vista móvil de vocabulario produce desplazamiento horizontal.");
    }
    await capture(client, join(outputDirectory, "phase11-vocabulary-mobile.png"));
    console.log("PASS learning reader, vocabulary, persistence and mobile layout");
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

async function navigate(client, url) {
  await client.send("Page.navigate", { url });
  await waitFor(async () => (await evaluate(client, "document.readyState")) === "complete", url);
}

async function setViewport(client, width, height) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
}

async function clickByText(client, selector, label) {
  const clicked = await evaluate(
    client,
    `(() => {
      const element = [...document.querySelectorAll(${JSON.stringify(selector)})]
        .find((candidate) => candidate.textContent?.trim() === ${JSON.stringify(label)});
      if (!(element instanceof HTMLElement)) return false;
      element.click();
      return true;
    })()`,
  );
  if (clicked !== true) {
    throw new Error(`No se encontró ${selector} con el texto "${label}".`);
  }
}

async function capture(client, path) {
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(path, Buffer.from(result.data, "base64"));
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails !== undefined) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function waitForText(client, expected) {
  await waitFor(async () => {
    const text = String(
      await evaluate(client, "document.body?.innerText ?? ''"),
    ).toLocaleLowerCase();
    return expected.every((value) => text.includes(value.toLocaleLowerCase()));
  }, expected.join(", "));
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
