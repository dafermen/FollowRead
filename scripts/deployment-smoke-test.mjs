const apiBase = withoutTrailingSlash(process.env["FOLLOWREAD_API_URL"] ?? "http://localhost:8000");
const adminBase = withoutTrailingSlash(
  process.env["FOLLOWREAD_ADMIN_URL"] ?? "http://localhost:5173",
);
const readerBase = withoutTrailingSlash(
  process.env["FOLLOWREAD_READER_URL"] ?? "http://localhost:5174",
);

const ready = await fetchWithTimeout(`${apiBase}/ready`);
if (!ready.ok || ready.headers.get("cache-control") !== "no-store") {
  throw new Error(`API readiness failed (${String(ready.status)}).`);
}

const catalog = await fetchWithTimeout(`${apiBase}/catalog?limit=1`);
if (!catalog.ok || !catalog.headers.get("x-request-id")) {
  throw new Error(`API catalog smoke test failed (${String(catalog.status)}).`);
}

for (const [application, url, marker] of [
  ["Admin", adminBase, "FollowRead Admin"],
  ["Reader", readerBase, "FollowRead Reader"],
]) {
  const response = await fetchWithTimeout(url);
  const html = await response.text();
  if (!response.ok || !html.includes(marker)) {
    throw new Error(`${application} smoke test failed (${String(response.status)}).`);
  }
  console.log(`PASS ${application} ${url}`);
}

console.log(`PASS API ${apiBase}`);
console.log("Deployment smoke test PASS");

async function fetchWithTimeout(url) {
  return fetch(url, { signal: AbortSignal.timeout(10_000) });
}

function withoutTrailingSlash(value) {
  return value.replace(/\/+$/u, "");
}
