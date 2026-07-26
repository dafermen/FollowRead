import { describe, expect, it } from "vitest";

import { MemoryOfflineRepository } from "./offlineRepository.js";
import type { PendingProgressOperation } from "./offlineDomain.js";

const operation = (
  operationId: string,
  slug: string,
  positionMs: number,
): PendingProgressOperation => ({
  operationId,
  slug,
  version: 1,
  stableAnchor: "paragraph-1",
  positionMs,
  occurredAt: "2026-07-26T00:00:00Z",
});

describe("memory offline repository", () => {
  it("coalesces pending progress by reading and preserves other readings", async () => {
    const repository = new MemoryOfflineRepository();
    await repository.replaceProgressOperation(operation("one", "cuento", 1000));
    await repository.replaceProgressOperation(operation("two", "otro", 500));
    await repository.replaceProgressOperation(operation("three", "cuento", 2000));

    expect(await repository.listOperations()).toEqual([
      operation("two", "otro", 500),
      operation("three", "cuento", 2000),
    ]);
    await repository.deleteOperations(["three"]);
    expect(await repository.listOperations()).toEqual([operation("two", "otro", 500)]);
  });

  it("keeps a stable non-identifying client id", async () => {
    const repository = new MemoryOfflineRepository();

    expect(await repository.getClientId()).toBe(await repository.getClientId());
  });
});
