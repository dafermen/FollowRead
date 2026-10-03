import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../apps/admin-web/dist/", import.meta.url));
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    let path = resolve(root, "." + decodeURIComponent(url.pathname));
    if (!path.startsWith(resolve(root) + sep) && path !== resolve(root))
      throw new Error("Outside build");
    if (url.pathname.endsWith("/")) path = resolve(path, "index.html");
    else if (!extname(path)) path += ".html";
    if (!(await stat(path)).isFile()) throw new Error("Not a file");
    response.setHeader("Content-Type", mime[extname(path)] ?? "application/octet-stream");
    response.end(await readFile(path));
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const address = server.address();
  const result = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [fileURLToPath(new URL("./verify-documentation-e2e.mjs", import.meta.url))],
      {
        stdio: "inherit",
        env: { ...process.env, FOLLOWREAD_ADMIN_URL: `http://127.0.0.1:${address.port}` },
      },
    );
    child.once("error", reject);
    child.once("exit", resolve);
  });
  if (result !== 0) process.exitCode = 1;
} finally {
  await new Promise((resolve) => server.close(resolve));
}
