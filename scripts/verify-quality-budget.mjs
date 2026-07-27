import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const applications = ["admin-web", "reader"];
const maximumChunkBytes = 450 * 1024;
const maximumGzipBytes = 150 * 1024;

for (const application of applications) {
  const outputDirectory = join(repositoryRoot, "apps", application, "dist");
  if (!existsSync(outputDirectory)) {
    throw new Error(`Falta el build de ${application}. Ejecuta pnpm build primero.`);
  }
  const assetsDirectory = join(outputDirectory, "assets");
  const chunks = (await readdir(assetsDirectory))
    .filter((name) => name.endsWith(".js"))
    .map((name) => join(assetsDirectory, name));
  if (chunks.length < 2) {
    throw new Error(`${application} no generó separación de código.`);
  }
  for (const chunk of chunks) {
    const content = await readFile(chunk);
    const details = await stat(chunk);
    const compressedBytes = gzipSync(content).byteLength;
    if (details.size > maximumChunkBytes) {
      throw new Error(`${chunk} supera el límite de ${maximumChunkBytes} bytes.`);
    }
    if (compressedBytes > maximumGzipBytes) {
      throw new Error(`${chunk} supera el límite gzip de ${maximumGzipBytes} bytes.`);
    }
    console.log(
      `PASS ${application}/${chunk.split(/[\\/]/u).at(-1)} ${String(details.size)} B (${String(compressedBytes)} B gzip)`,
    );
  }
}

const readerServiceWorker = await readFile(
  join(repositoryRoot, "apps", "reader", "public", "sw.js"),
  "utf8",
);
for (const strategy of ["networkFirstNavigation", "cacheFirst", "staleWhileRevalidate"]) {
  if (!readerServiceWorker.includes(strategy)) {
    throw new Error(`La estrategia offline ${strategy} no está configurada.`);
  }
}
console.log("PASS service worker cache strategies");

const apiBase = process.env["FOLLOWREAD_API_URL"] ?? "http://localhost:8000";
const health = await fetch(`${apiBase}/health`, {
  headers: { "Accept-Encoding": "gzip" },
});
if (!health.ok) {
  throw new Error(`La API no está disponible (${String(health.status)}).`);
}
const requiredHeaders = {
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};
for (const [name, expected] of Object.entries(requiredHeaders)) {
  if (health.headers.get(name) !== expected) {
    throw new Error(`La cabecera ${name} no tiene el valor seguro esperado.`);
  }
}
if (!health.headers.get("server-timing")?.includes("app;dur=")) {
  throw new Error("La API no expone Server-Timing.");
}
const metrics = await fetch(`${apiBase}/metrics`);
if (!metrics.ok || !(await metrics.text()).includes("followread_http_requests_total")) {
  throw new Error("La API no expone métricas Prometheus válidas.");
}
console.log("PASS API security, timing and metrics");
