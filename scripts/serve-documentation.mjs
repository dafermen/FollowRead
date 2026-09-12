import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const documentationSource = join(repositoryRoot, "docs");
const outputRoot = join(repositoryRoot, "apps", "admin-web", "dist", "docs");
const outputIndex = join(outputRoot, "index.html");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const requestedPort = process.argv[process.argv.indexOf("--port") + 1] ?? "5175";
const port = Number.parseInt(requestedPort, 10);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid documentation port: ${requestedPort}`);
}

if (await documentationBuildIsStale()) {
  console.log("Documentation output is missing or stale; building it before serving.");
  const build = spawnSync(pnpmCommand, ["docs:build"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

const server = createServer(async (request, response) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (requestUrl.pathname === "/docs") {
      response.writeHead(301, { Location: "/docs/" });
      response.end();
      return;
    }
    if (!requestUrl.pathname.startsWith("/docs/")) {
      response.writeHead(404, defaultHeaders("text/plain; charset=utf-8"));
      response.end("Not found");
      return;
    }

    const decodedPath = decodeURIComponent(requestUrl.pathname.slice("/docs/".length));
    const filePath = resolveDocumentationFile(decodedPath);
    const selectedPath = filePath ?? join(outputRoot, "404.html");
    const statusCode = filePath === undefined ? 404 : 200;
    const headers = defaultHeaders(contentTypeFor(selectedPath));
    headers["Cache-Control"] = decodedPath.startsWith("assets/")
      ? "public, max-age=31536000, immutable"
      : "no-cache";

    response.writeHead(statusCode, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(selectedPath).pipe(response);
  } catch (error) {
    console.error(error);
    response.writeHead(500, defaultHeaders("text/plain; charset=utf-8"));
    response.end("Documentation server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`FollowRead documentation available at http://localhost:${String(port)}/docs/`);
});

const stop = () => {
  server.close(() => process.exit(0));
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

async function documentationBuildIsStale() {
  if (!existsSync(outputIndex)) {
    return true;
  }
  const outputTime = statSync(outputIndex).mtimeMs;
  const sourceFiles = await collectFiles(documentationSource);
  sourceFiles.push(join(repositoryRoot, "package.json"), join(repositoryRoot, "pnpm-lock.yaml"));
  for (const path of sourceFiles) {
    if ((await stat(path)).mtimeMs > outputTime) {
      return true;
    }
  }
  return false;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries
      .filter((entry) => entry.name !== "dist" && entry.name !== "cache")
      .map(async (entry) => {
        const absolutePath = join(directory, entry.name);
        return entry.isDirectory() ? collectFiles(absolutePath) : [absolutePath];
      }),
  );
  return nestedFiles.flat();
}

function resolveDocumentationFile(requestedPath) {
  const normalizedPath = requestedPath.replaceAll("/", sep);
  const candidates =
    requestedPath.endsWith("/") || requestedPath === ""
      ? [join(outputRoot, normalizedPath, "index.html")]
      : extname(requestedPath) === ""
        ? [
            join(outputRoot, `${normalizedPath}.html`),
            join(outputRoot, normalizedPath, "index.html"),
          ]
        : [join(outputRoot, normalizedPath)];

  for (const candidate of candidates) {
    const resolvedCandidate = resolve(candidate);
    const relativePath = relative(outputRoot, resolvedCandidate);
    if (
      relativePath !== "" &&
      (relativePath.startsWith(`..${sep}`) ||
        resolve(outputRoot, relativePath) !== resolvedCandidate)
    ) {
      continue;
    }
    if (existsSync(resolvedCandidate) && statSync(resolvedCandidate).isFile()) {
      return resolvedCandidate;
    }
  }
  return undefined;
}

function defaultHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  };
}

function contentTypeFor(path) {
  return (
    {
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml; charset=utf-8",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
    }[extname(path).toLowerCase()] ?? "application/octet-stream"
  );
}
