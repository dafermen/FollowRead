import {
  OfflinePackageError,
  assertPackageCanActivate,
  availabilityFor,
  formatStorageSize,
  packageByteSize,
  storagePolicyForSize,
  type PendingProgressOperation,
  type StoredReaderPackage,
} from "./offlineDomain.js";
import {
  getOfflineRepository,
  resetOfflineRepositoryForTests,
  type OfflineRepository,
} from "./offlineRepository.js";
import { isReaderOnline } from "./mobileRuntime.js";
import type { CatalogItem, CatalogPage, ReaderLibraryItem, ReaderPackage } from "./readerClient.js";

type RemoteReaders = {
  catalog: () => Promise<CatalogPage>;
  packagePayload: (slug: string) => Promise<string>;
};

const configuredApiBase: unknown = import.meta.env["VITE_API_BASE_URL"];
const API_BASE_URL =
  typeof configuredApiBase === "string" && configuredApiBase !== ""
    ? configuredApiBase
    : "http://localhost:8000";

export const OFFLINE_STATE_EVENT = "followread:offline-state";

let bootstrapPromise: Promise<void> | null = null;

export const resetOfflineStateForTests = (): void => {
  bootstrapPromise = null;
  resetOfflineRepositoryForTests();
};

export const getOfflineAwareLibrary = async (
  remoteReaders: RemoteReaders,
): Promise<ReaderLibraryItem[]> => {
  const repository = await getOfflineRepository();
  await ensureBootstrap(repository);
  const localPackages = await repository.listPackages();
  let remoteCatalog: CatalogPage | null = null;
  try {
    remoteCatalog = await remoteReaders.catalog();
  } catch {
    // A valid local catalog remains useful without the API.
  }
  const remoteBySlug = new Map(remoteCatalog?.items.map((item) => [item.slug, item]) ?? []);
  const localBySlug = new Map(localPackages.map((item) => [item.slug, item]));
  const slugs = new Set([...remoteBySlug.keys(), ...localBySlug.keys()]);
  const library: ReaderLibraryItem[] = [];

  for (const slug of slugs) {
    const remote = remoteBySlug.get(slug);
    const local = localBySlug.get(slug);
    let readerPackage = local?.package;
    if (readerPackage === undefined && remote !== undefined) {
      try {
        const payload = await remoteReaders.packagePayload(slug);
        readerPackage = await assertPackageCanActivate(remote, payload);
      } catch {
        continue;
      }
    }
    if (readerPackage === undefined) {
      continue;
    }
    const catalog = remote ?? local?.catalog;
    if (catalog === undefined) {
      continue;
    }
    library.push({
      catalog,
      package: readerPackage,
      availability: availabilityFor(remote, local),
    });
  }
  if (library.length === 0) {
    throw new Error("No valid local or remote Reader packages are available.");
  }
  return library.sort((left, right) => left.package.slug.localeCompare(right.package.slug));
};

export const getOfflineAwarePackage = async (
  slug: string,
  remoteReaders: RemoteReaders,
): Promise<ReaderPackage> => {
  const repository = await getOfflineRepository();
  await ensureBootstrap(repository);
  const local = await repository.getPackage(slug);
  if (local !== undefined) {
    return local.package;
  }
  const catalog = await remoteReaders.catalog();
  const item = catalog.items.find((candidate) => candidate.slug === slug);
  if (item === undefined) {
    throw new Error(`Reader package ${slug} is not available.`);
  }
  return assertPackageCanActivate(item, await remoteReaders.packagePayload(slug));
};

export const installOfflinePackage = async (
  catalog: CatalogItem,
  packagePayload: () => Promise<string>,
): Promise<StoredReaderPackage> => {
  const repository = await getOfflineRepository();
  let payload: string;
  try {
    payload = await packagePayload();
  } catch {
    throw new OfflinePackageError("network", "La descarga se interrumpió. Puedes reintentar.");
  }
  const readerPackage = await assertPackageCanActivate(catalog, payload);
  const sizeBytes = packageByteSize(payload);
  if (
    storagePolicyForSize(sizeBytes) === "warning" &&
    !window.confirm(
      `Esta lectura usa ${formatStorageSize(sizeBytes)}. ¿Quieres guardarla en este dispositivo?`,
    )
  ) {
    throw new OfflinePackageError(
      "large_package_cancelled",
      "La descarga grande fue cancelada antes de guardarse.",
    );
  }
  const storageManager = Reflect.get(navigator, "storage") as StorageManager | undefined;
  const estimate = storageManager === undefined ? undefined : await storageManager.estimate();
  const available =
    estimate?.quota === undefined || estimate.usage === undefined
      ? Number.POSITIVE_INFINITY
      : estimate.quota - estimate.usage;
  if (available < sizeBytes) {
    throw new OfflinePackageError(
      "storage_full",
      "No hay espacio suficiente para completar la descarga.",
    );
  }
  const stored: StoredReaderPackage = {
    slug: catalog.slug,
    version: catalog.version,
    checksum: catalog.checksum,
    catalog,
    package: readerPackage,
    sizeBytes,
    installedAt: new Date().toISOString(),
    source: "download",
  };
  await repository.putPackage(stored);
  await cachePackageResources(readerPackage);
  notifyOfflineState();
  return stored;
};

export const listOfflinePackages = async (): Promise<StoredReaderPackage[]> => {
  const repository = await getOfflineRepository();
  await ensureBootstrap(repository);
  return (await repository.listPackages()).sort((left, right) =>
    right.installedAt.localeCompare(left.installedAt),
  );
};

export const removeOfflinePackage = async (slug: string): Promise<void> => {
  const repository = await getOfflineRepository();
  const value = await repository.getPackage(slug);
  if (value?.source === "bootstrap") {
    return;
  }
  await repository.deletePackage(slug);
  notifyOfflineState();
};

export const queueProgressForSync = async ({
  slug,
  version,
  stableAnchor,
  positionMs,
}: {
  slug: string;
  version: number;
  stableAnchor: string;
  positionMs: number;
}): Promise<void> => {
  const operation: PendingProgressOperation = {
    operationId: crypto.randomUUID(),
    slug,
    version,
    stableAnchor,
    positionMs,
    occurredAt: new Date().toISOString(),
  };
  const repository = await getOfflineRepository();
  await repository.replaceProgressOperation(operation);
  notifyOfflineState();
  if (isReaderOnline()) {
    void synchronizePendingProgress();
  }
};

export const synchronizePendingProgress = async (): Promise<number> => {
  if (!isReaderOnline()) {
    return 0;
  }
  const repository = await getOfflineRepository();
  const operations = await repository.listOperations();
  if (operations.length === 0) {
    return 0;
  }
  const clientId = await repository.getClientId();
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/reader/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        operations: operations.map((operation) => ({
          operation_id: operation.operationId,
          slug: operation.slug,
          version: operation.version,
          stable_anchor: operation.stableAnchor,
          position_ms: operation.positionMs,
          occurred_at: operation.occurredAt,
        })),
      }),
    });
  } catch {
    return 0;
  }
  if (!response.ok) {
    return 0;
  }
  const result = (await response.json()) as {
    confirmed: Array<{ operation_id: string }>;
    rejected: Array<{ operation_id: string; reason: string }>;
  };
  await repository.deleteOperations(result.confirmed.map((item) => item.operation_id));
  notifyOfflineState();
  return result.confirmed.length;
};

export const getOfflineSummary = async (): Promise<{
  packageCount: number;
  sizeBytes: number;
  pendingCount: number;
}> => {
  const repository = await getOfflineRepository();
  await ensureBootstrap(repository);
  const [packages, operations] = await Promise.all([
    repository.listPackages(),
    repository.listOperations(),
  ]);
  return {
    packageCount: packages.length,
    sizeBytes: packages.reduce((total, item) => total + item.sizeBytes, 0),
    pendingCount: operations.length,
  };
};

export const ensureBootstrap = async (repository: OfflineRepository): Promise<void> => {
  bootstrapPromise ??= loadBootstrap(repository);
  try {
    await bootstrapPromise;
  } catch {
    bootstrapPromise = null;
  }
};

const loadBootstrap = async (repository: OfflineRepository): Promise<void> => {
  const response = await fetch("/offline/bootstrap.json");
  if (!response.ok) {
    return;
  }
  const document = (await response.json()) as {
    schema_version?: number;
    catalog?: CatalogItem[];
    package_payloads?: Record<string, string> | null;
  };
  if (
    document.schema_version !== 1 ||
    document.catalog === undefined ||
    document.package_payloads === undefined ||
    document.package_payloads === null
  ) {
    return;
  }
  for (const catalog of document.catalog) {
    const existing = await repository.getPackage(catalog.slug);
    if (
      existing !== undefined &&
      (existing.source !== "bootstrap" || existing.checksum === catalog.checksum)
    ) {
      continue;
    }
    const payload = document.package_payloads[catalog.slug];
    if (payload === undefined) {
      continue;
    }
    const readerPackage = await assertPackageCanActivate(catalog, payload);
    await repository.putPackage({
      slug: catalog.slug,
      version: catalog.version,
      checksum: catalog.checksum,
      catalog,
      package: readerPackage,
      sizeBytes: packageByteSize(payload),
      installedAt: document.catalog[0]?.published_at ?? new Date(0).toISOString(),
      source: "bootstrap",
    });
  }
};

const cachePackageResources = async (readerPackage: ReaderPackage): Promise<void> => {
  if (!("caches" in window)) {
    return;
  }
  const resourceUris = new Set(
    [
      readerPackage.cover_uri,
      ...readerPackage.translations.flatMap((translation) =>
        translation.chapters.map((chapter) => chapter.image_uri),
      ),
    ].filter((uri): uri is string => typeof uri === "string" && uri !== ""),
  );
  try {
    const cache = await caches.open("followread-content-v1");
    await Promise.all([...resourceUris].map((uri) => cache.add(uri)));
  } catch {
    // The package is still complete for text, marks and device narration.
  }
};

const notifyOfflineState = () => {
  window.dispatchEvent(new CustomEvent(OFFLINE_STATE_EVENT));
};
