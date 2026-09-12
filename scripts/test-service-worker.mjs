import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../apps/reader/public/sw.js", import.meta.url), "utf8");
const handlers = new Map();
const self = {
  location: { origin: "https://followread.innovalogic.tech" },
  addEventListener: (name, handler) => handlers.set(name, handler),
};
runInNewContext(source, { self, URL });

test("private same-origin traffic bypasses the Reader service worker", () => {
  for (const path of [
    "/api/auth/session",
    "/api/admin/content",
    "/api/catalog",
    "/admin/",
    "/admin/login",
    "/auth/session",
    "/metrics",
  ]) {
    let intercepted = false;
    handlers.get("fetch")({
      request: { method: "GET", mode: "navigate", url: `${self.location.origin}${path}` },
      respondWith: () => {
        intercepted = true;
      },
    });
    assert.equal(intercepted, false, path);
  }
});

test("unknown resources and cross-origin requests are not cached", () => {
  for (const url of [
    `${self.location.origin}/private-export.json`,
    `${self.location.origin}/src/main.tsx`,
    "https://other.example/stories/image.png",
  ]) {
    let intercepted = false;
    handlers.get("fetch")({
      request: { method: "GET", mode: "cors", url },
      respondWith: () => {
        intercepted = true;
      },
    });
    assert.equal(intercepted, false, url);
  }
});
