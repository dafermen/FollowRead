const SHELL_CACHE = "followread-shell-v6";
const CONTENT_CACHE = "followread-content-v4";
const DOWNLOAD_CACHE = "followread-downloads-v1";
const SHELL_ASSETS = [
  "/",
  "/offline/bootstrap.json",
  "/manifest.webmanifest",
  "/icons/followread.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(upgradeCaches());
  self.clients.claim();
});

async function upgradeCaches() {
  const keys = await caches.keys();
  // Older app versions stored downloaded illustrations here. Migrate only public assets.
  if (keys.includes("followread-content-v1")) {
    const legacy = await caches.open("followread-content-v1");
    const downloads = await caches.open(DOWNLOAD_CACHE);
    for (const request of await legacy.keys()) {
      const url = new URL(request.url);
      if (url.origin === self.location.origin && url.pathname.startsWith("/stories/")) {
        const response = await legacy.match(request);
        if (response !== undefined && (await downloads.match(request)) === undefined) {
          await downloads.put(request, response);
        }
      }
    }
  }
  await Promise.all(
    keys
      .filter(
        (key) =>
          key.startsWith("followread-") &&
          ![SHELL_CACHE, CONTENT_CACHE, DOWNLOAD_CACHE].includes(key),
      )
      .map((key) => caches.delete(key)),
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  const url = new URL(request.url);
  // Admin and API share the public origin. Never cache sessions or editorial responses.
  if (/^\/(api|admin|auth|metrics)(\/|$)/u.test(url.pathname)) {
    return;
  }
  // Vite modules are needed for local offline regression; never enable this on public hosts.
  if (
    ["localhost", "127.0.0.1"].includes(url.hostname) &&
    /^\/(src|@vite|@react-refresh|@fs|node_modules)(\/|$)/u.test(url.pathname)
  ) {
    event.respondWith(networkFirstBootstrap(request));
    return;
  }
  if (url.pathname === "/offline/bootstrap.json") {
    event.respondWith(networkFirstBootstrap(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (url.pathname.startsWith("/stories/")) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put("/", response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) ?? (await caches.match("/")) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached !== undefined) {
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(SHELL_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstBootstrap(request) {
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) {
      const cache = await caches.open(CONTENT_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) ?? Response.error();
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CONTENT_CACHE);
  const downloads = await caches.open(DOWNLOAD_CACHE);
  const cached = (await cache.match(request)) ?? (await downloads.match(request));
  const update = fetch(request).then(async (response) => {
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  });
  if (cached !== undefined) {
    event.waitUntil(update);
    return cached;
  }
  return update;
}
