import { afterEach, describe, expect, it, vi } from "vitest";

import { sha256Checksum } from "./offlineDomain.js";
import { getOfflineRepository, MemoryOfflineRepository } from "./offlineRepository.js";
import type { CatalogItem, ReaderPackage } from "./readerClient.js";
import {
  getOfflineAwareLibrary,
  ensureBootstrap,
  installOfflinePackage,
  queueProgressForSync,
  resetOfflineStateForTests,
  synchronizePendingProgress,
} from "./offlineService.js";

const readerPackage: ReaderPackage = {
  content_id: "content-1",
  slug: "cuento",
  version: 1,
  cover_uri: "/stories/cuento-cover.png",
  cover_alt_text: "Portada del cuento.",
  translations: [
    {
      language: "es",
      title: "Cuento sin conexión",
      summary: null,
      chapters: [
        {
          stable_key: "chapter-1",
          title: null,
          image_uri: "/stories/cuento-chapter-1.png",
          image_alt_text: "Ilustración del primer capítulo.",
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

const fixture = async () => {
  const payload = JSON.stringify(readerPackage);
  const catalog: CatalogItem = {
    id: "content-1",
    slug: "cuento",
    content_type: "story",
    audience: "general",
    reading_level: { code: "A1", label: "Inicial" },
    categories: [],
    languages: ["es"],
    version: 1,
    checksum: await sha256Checksum(payload),
    package_url: "/catalog/cuento/reader-package",
    minimum_app_version: "1.0.0",
    published_at: "2026-07-26T00:00:00Z",
  };
  return { payload, catalog };
};

afterEach(() => {
  resetOfflineStateForTests();
  vi.unstubAllGlobals();
});

describe("offline reader service", () => {
  it("loads the bundled package when the remote catalog is unavailable", async () => {
    const { payload, catalog } = await fixture();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              schema_version: 1,
              catalog: [catalog],
              package_payloads: { cuento: payload },
            }),
          ),
        ),
      ),
    );

    const library = await getOfflineAwareLibrary({
      catalog: () => Promise.reject(new Error("offline")),
      packagePayload: () => Promise.reject(new Error("offline")),
    });

    expect(library[0]?.availability.state).toBe("local_only");
    expect(library[0]?.package).toEqual(readerPackage);
  });

  it("refreshes an outdated bundled package without replacing user downloads", async () => {
    const { payload, catalog } = await fixture();
    const repository = new MemoryOfflineRepository();
    const updatedPackage: ReaderPackage = {
      ...readerPackage,
      translations: readerPackage.translations.map((translation) => ({
        ...translation,
        audio: {
          ...translation.audio,
          uri: "/audio/cuento-es-marin.mp3",
          voice_id: "marin",
          simulated: false,
        },
      })),
    };
    const updatedPayload = JSON.stringify(updatedPackage);
    const updatedCatalog = {
      ...catalog,
      checksum: await sha256Checksum(updatedPayload),
    };
    let bootstrap = {
      schema_version: 1,
      catalog: [catalog],
      package_payloads: { cuento: payload },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify(bootstrap)))),
    );

    await ensureBootstrap(repository);
    expect((await repository.getPackage("cuento"))?.package).toEqual(readerPackage);

    resetOfflineStateForTests();
    bootstrap = {
      schema_version: 1,
      catalog: [updatedCatalog],
      package_payloads: { cuento: updatedPayload },
    };
    await ensureBootstrap(repository);

    expect((await repository.getPackage("cuento"))?.package).toEqual(updatedPackage);
  });

  it("does not replace a valid package after a corrupt update", async () => {
    const { payload, catalog } = await fixture();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ schema_version: 1, catalog: [], package_payloads: {} })),
        ),
      ),
    );
    await installOfflinePackage(catalog, () => Promise.resolve(payload));
    const update = { ...catalog, version: 2, checksum: `sha256:${"0".repeat(64)}` };

    await expect(
      installOfflinePackage(update, () => Promise.resolve(payload)),
    ).rejects.toMatchObject({ code: "checksum_mismatch" });
    expect((await (await getOfflineRepository()).getPackage("cuento"))?.version).toBe(1);
  });

  it("caches the cover and every available chapter illustration", async () => {
    const { payload, catalog } = await fixture();
    const add = vi.fn(() => Promise.resolve());
    vi.stubGlobal("caches", {
      open: vi.fn(() => Promise.resolve({ add })),
    });

    await installOfflinePackage(catalog, () => Promise.resolve(payload));

    expect(add).toHaveBeenCalledWith("/stories/cuento-cover.png");
    expect(add).toHaveBeenCalledWith("/stories/cuento-chapter-1.png");
  });

  it("keeps progress queued offline and removes it after confirmation", async () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
    await queueProgressForSync({
      slug: "cuento",
      version: 1,
      stableAnchor: "paragraph-1",
      positionMs: 800,
    });
    expect(await (await getOfflineRepository()).listOperations()).toHaveLength(1);

    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: string | URL | Request, init?: RequestInit) => {
        const body = typeof init?.body === "string" ? init.body : "{}";
        const request = JSON.parse(body) as {
          operations: Array<{ operation_id: string }>;
        };
        return Promise.resolve(
          new Response(
            JSON.stringify({
              confirmed: [{ operation_id: request.operations[0]?.operation_id }],
              rejected: [],
            }),
          ),
        );
      }),
    );

    await expect(synchronizePendingProgress()).resolves.toBe(1);
    expect(await (await getOfflineRepository()).listOperations()).toHaveLength(0);
  });
});
