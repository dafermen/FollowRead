import { performance } from "node:perf_hooks";

const apiBase = process.env["FOLLOWREAD_API_URL"] ?? "http://localhost:8000";
const requestCount = parsePositiveInteger(process.env["FOLLOWREAD_LOAD_REQUESTS"], 120);
const concurrency = parsePositiveInteger(process.env["FOLLOWREAD_LOAD_CONCURRENCY"], 12);
const maximumP95Ms = parsePositiveInteger(process.env["FOLLOWREAD_LOAD_P95_MS"], 750);
const paths = ["/health", "/catalog?limit=20&offset=0"];
const durations = [];
let failures = 0;
let nextRequest = 0;

await Promise.all(
  Array.from({ length: Math.min(concurrency, requestCount) }, async () => {
    while (nextRequest < requestCount) {
      const requestNumber = nextRequest;
      nextRequest += 1;
      const path = paths[requestNumber % paths.length];
      const startedAt = performance.now();
      try {
        const response = await fetch(`${apiBase}${path}`, {
          headers: { "X-Request-ID": `load-${String(requestNumber)}` },
        });
        await response.arrayBuffer();
        if (!response.ok) {
          failures += 1;
        }
      } catch {
        failures += 1;
      } finally {
        durations.push(performance.now() - startedAt);
      }
    }
  }),
);

durations.sort((left, right) => left - right);
const p50 = percentile(durations, 0.5);
const p95 = percentile(durations, 0.95);
const maximum = durations.at(-1) ?? 0;
console.log(
  `Carga: ${String(requestCount)} solicitudes, concurrencia ${String(concurrency)}, ` +
    `p50 ${p50.toFixed(1)} ms, p95 ${p95.toFixed(1)} ms, máximo ${maximum.toFixed(1)} ms.`,
);
if (failures > 0) {
  throw new Error(`La prueba de carga registró ${String(failures)} respuestas fallidas.`);
}
if (p95 > maximumP95Ms) {
  throw new Error(
    `El p95 (${p95.toFixed(1)} ms) supera el presupuesto de ${String(maximumP95Ms)} ms.`,
  );
}
console.log("PASS load test");

function percentile(values, ratio) {
  const index = Math.max(0, Math.ceil(values.length * ratio) - 1);
  return values[index] ?? 0;
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
