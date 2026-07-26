import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { format } from "prettier";

const apiBase = process.argv[2] ?? "http://localhost:8000";
const outputPath = resolve("apps/reader/public/offline/bootstrap.json");

const catalogResponse = await fetch(`${apiBase}/catalog?limit=100&offset=0`);
if (!catalogResponse.ok) {
  throw new Error(`Catalog export failed with status ${String(catalogResponse.status)}.`);
}
const catalogPage = await catalogResponse.json();
const packagePayloads = {};

for (const item of catalogPage.items) {
  const packageResponse = await fetch(`${apiBase}/catalog/${item.slug}/reader-package`);
  if (!packageResponse.ok) {
    throw new Error(
      `Package export for ${item.slug} failed with status ${String(packageResponse.status)}.`,
    );
  }
  const payload = await packageResponse.text();
  const checksum = `sha256:${createHash("sha256").update(payload).digest("hex")}`;
  if (checksum !== item.checksum) {
    throw new Error(`Checksum mismatch while exporting ${item.slug}.`);
  }
  packagePayloads[item.slug] = payload;
}

const document = {
  schema_version: 1,
  catalog: catalogPage.items,
  package_payloads: packagePayloads,
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, await format(JSON.stringify(document), { parser: "json" }), "utf8");
console.log(`Exported ${String(catalogPage.items.length)} offline package(s) to ${outputPath}.`);
