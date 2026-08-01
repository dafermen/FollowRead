import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const applicationBase = process.env["FOLLOWREAD_ADMIN_URL"] ?? "http://localhost:5173";
const documentationUrl = `${applicationBase}/docs/`;
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
  throw new Error("Chrome or Edge is required for documentation browser validation.");
}

for (const url of [applicationBase, documentationUrl, `${documentationUrl}ARCHITECTURE`]) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} is not ready (${String(response.status)}).`);
  }
}

const profileDirectory = await mkdtemp(join(tmpdir(), "followread-docs-e2e-"));
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
    await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(documentationUrl)}`, {
      method: "PUT",
    })
  ).json();
  const client = await createCdpClient(target.webSocketDebuggerUrl);

  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await setViewport(client, 1440, 900, false);
    await navigate(client, documentationUrl, [
      "Product and engineering documentation",
      "Back to the application",
      "Architecture",
    ]);
    await expectBrowserState(client, {
      expression: `
        document.querySelector('.VPNavBar') !== null &&
        document.querySelector('.VPNavBarSearch') !== null &&
        document.documentElement.scrollWidth <= document.documentElement.clientWidth
      `,
      label: "desktop navigation, search, and horizontal fit",
    });

    await navigate(client, `${documentationUrl}ARCHITECTURE`, [
      "Architecture",
      "On this page",
      "Previous page",
    ]);
    await expectBrowserState(client, {
      expression: `
        document.querySelector('.VPSidebar') !== null &&
        document.querySelector('.VPDocAsideOutline') !== null &&
        document.querySelector('.VPDocFooter') !== null
      `,
      label: "sidebar, page outline, and previous/next navigation",
    });

    await navigate(client, `${documentationUrl}architecture/SYSTEM_CONTEXT`, ["System Context"]);
    await expectBrowserState(client, {
      expression: `
        document.querySelector('.mermaid svg') !== null &&
        !document.body.innerText.includes('Syntax error in text')
      `,
      label: "rendered Mermaid diagram",
    });

    await client.send("Runtime.evaluate", {
      expression: "document.querySelector('button.VPSwitchAppearance')?.click()",
    });
    await expectBrowserState(client, {
      expression: "document.documentElement.classList.contains('dark')",
      label: "dark theme",
    });

    await setViewport(client, 390, 844, true);
    await navigate(client, documentationUrl, [
      "Product and engineering documentation",
      "Explore the product",
    ]);
    await expectBrowserState(client, {
      expression: `
        document.documentElement.scrollWidth <= document.documentElement.clientWidth &&
        [...document.querySelectorAll('.VPHero .action')].every((action) => {
          const bounds = action.getBoundingClientRect();
          return bounds.left >= 0 && bounds.right <= window.innerWidth;
        })
      `,
      label: "mobile homepage content and actions fit",
    });
    await client.send("Runtime.evaluate", {
      expression: "document.querySelector('button.VPNavBarHamburger')?.click()",
    });
    await expectBrowserState(client, {
      expression: `
        document.querySelector('.VPNavScreen') !== null &&
        [...document.querySelectorAll('.followread-application-link')].some((link) => {
          const bounds = link.getBoundingClientRect();
          return bounds.width > 0 && bounds.height >= 44;
        }) &&
        document.documentElement.scrollWidth <= document.documentElement.clientWidth
      `,
      label: "mobile menu, 44px application link, and horizontal fit",
    });

    await setViewport(client, 1440, 900, false);
    await navigate(client, documentationUrl, ["Back to the application"]);
    await client.send("Runtime.evaluate", {
      expression: `
        [...document.querySelectorAll('.followread-application-link')]
          .find((link) => link.getBoundingClientRect().width > 0)?.click()
      `,
    });
    await expectBrowserState(client, {
      expression: `
        window.location.pathname === '/' &&
        document.title === 'FollowRead Admin'
      `,
      label: "same-tab return to the application root",
    });
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

console.log(
  "Documentation browser E2E PASS (desktop, mobile, dark theme, Mermaid, and application return)",
);

async function setViewport(client, width, height, mobile) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
}

async function navigate(client, url, expectedText) {
  await client.send("Page.navigate", { url });
  await waitFor(async () => {
    const result = await client.send("Runtime.evaluate", {
      expression: "document.body?.innerText ?? ''",
      returnByValue: true,
    });
    const text = String(result.result.value).toLocaleLowerCase();
    return expectedText.every((value) => text.includes(value.toLocaleLowerCase()));
  }, expectedText.join(", "));
}

async function expectBrowserState(client, { expression, label }) {
  await waitFor(async () => {
    const result = await client.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    return result.result.value === true;
  }, label);
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
  const deadline = Date.now() + 30_000;
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
