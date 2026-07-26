import { describe, expect, it } from "vitest";

import {
  OfflinePackageError,
  assertPackageCanActivate,
  availabilityFor,
  compareVersions,
  formatStorageSize,
  PACKAGE_LIMIT_BYTES,
  PACKAGE_WARNING_BYTES,
  sha256Checksum,
  storagePolicyForSize,
  type StoredReaderPackage,
} from "./offlineDomain.js";
import type { CatalogItem, ReaderPackage } from "./readerClient.js";

const readerPackage: ReaderPackage = {
  content_id: "content-1",
  slug: "cuento",
  version: 2,
  cover_uri: null,
  cover_alt_text: null,
  translations: [
    {
      language: "es",
      title: "Cuento",
      summary: null,
      chapters: [
        {
          stable_key: "chapter-1",
          title: null,
          paragraphs: [{ stable_key: "paragraph-1", text: "Hola." }],
        },
      ],
      audio: {
        uri: "",
        duration_ms: 1000,
        voice_id: "device",
        simulated: true,
        marks: [],
      },
    },
  ],
};

const catalogFor = async (payload: string): Promise<CatalogItem> => ({
  id: "content-1",
  slug: "cuento",
  content_type: "story",
  audience: "general",
  reading_level: { code: "A1", label: "Inicial" },
  categories: [],
  languages: ["es"],
  version: 2,
  checksum: await sha256Checksum(payload),
  package_url: "/catalog/cuento/reader-package",
  minimum_app_version: "1.0.0",
  published_at: "2026-07-26T00:00:00Z",
});

describe("offline package domain", () => {
  it("verifies the exact payload before activation", async () => {
    const payload = JSON.stringify(readerPackage);
    const catalog = await catalogFor(payload);

    await expect(assertPackageCanActivate(catalog, payload)).resolves.toEqual(readerPackage);
    await expect(assertPackageCanActivate(catalog, `${payload} `)).rejects.toMatchObject({
      code: "checksum_mismatch",
    } satisfies Partial<OfflinePackageError>);
  });

  it("rejects incompatible packages", async () => {
    const payload = JSON.stringify(readerPackage);
    const catalog = { ...(await catalogFor(payload)), minimum_app_version: "2.0.0" };

    await expect(assertPackageCanActivate(catalog, payload)).rejects.toMatchObject({
      code: "incompatible",
    } satisfies Partial<OfflinePackageError>);
  });

  it("compares versions and reports remote, local and update states", async () => {
    const payload = JSON.stringify(readerPackage);
    const catalog = await catalogFor(payload);
    const stored: StoredReaderPackage = {
      slug: "cuento",
      version: 2,
      checksum: catalog.checksum,
      catalog,
      package: readerPackage,
      sizeBytes: payload.length,
      installedAt: catalog.published_at,
      source: "download",
    };

    expect(compareVersions("1.2.0", "1.1.9")).toBeGreaterThan(0);
    expect(availabilityFor(catalog, undefined).state).toBe("remote");
    expect(availabilityFor(catalog, stored).state).toBe("downloaded");
    expect(availabilityFor({ ...catalog, version: 3 }, stored).state).toBe("update_available");
    expect(availabilityFor(undefined, stored).state).toBe("local_only");
    expect(formatStorageSize(2048)).toBe("2.0 KB");
    expect(storagePolicyForSize(PACKAGE_WARNING_BYTES - 1)).toBe("normal");
    expect(storagePolicyForSize(PACKAGE_WARNING_BYTES)).toBe("warning");
    expect(storagePolicyForSize(PACKAGE_LIMIT_BYTES + 1)).toBe("blocked");
  });
});
