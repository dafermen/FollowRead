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

test("upgrade preserves downloaded public illustrations and discards private legacy entries", async () => {
  const origin = "https://followread.innovalogic.tech";
  const imageUrl = `${origin}/stories/downloaded-cover.png`;
  const privateUrl = `${origin}/api/auth/session`;
  const stores = new Map([
    [
      "followread-content-v1",
      new Map([
        [imageUrl, new Response("saved image")],
        [privateUrl, new Response("private")],
      ]),
    ],
    ["followread-shell-v1", new Map()],
    ["unrelated-app", new Map()],
  ]);
  const storage = {
    keys: async () => [...stores.keys()],
    delete: async (key) => stores.delete(key),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        keys: async () => [...entries.keys()].map((url) => new Request(url)),
        match: async (request) => entries.get(request.url),
        put: async (request, response) => entries.set(request.url, response),
      };
    },
  };
  const events = new Map();
  const worker = {
    location: { origin },
    clients: { claim() {} },
    addEventListener: (name, handler) => events.set(name, handler),
  };
  runInNewContext(source, {
    self: worker,
    caches: storage,
    URL,
    Response,
    fetch: async () => {
      throw new Error("offline");
    },
  });
  let activation;
  events.get("activate")({
    waitUntil: (promise) => {
      activation = promise;
    },
  });
  await activation;
  assert.equal(stores.has("followread-content-v1"), false);
  assert.equal(stores.has("followread-shell-v1"), false);
  assert.equal(stores.has("unrelated-app"), true);
  assert.equal(stores.get("followread-downloads-v1").has(privateUrl), false);
  let response;
  events.get("fetch")({
    request: { url: imageUrl, method: "GET", mode: "cors" },
    respondWith: (promise) => {
      response = promise;
    },
    waitUntil: (promise) => {
      void promise.catch(() => {});
    },
  });
  assert.equal(await (await response).text(), "saved image");
});
