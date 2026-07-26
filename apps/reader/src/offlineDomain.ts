import type { CatalogItem, ReaderPackage } from "./readerClient.js";

export const READER_APP_VERSION = "1.0.0";
export const PACKAGE_WARNING_BYTES = 100 * 1024 * 1024;
export const PACKAGE_LIMIT_BYTES = 250 * 1024 * 1024;

export type OfflineAvailabilityState =
  "remote" | "downloaded" | "update_available" | "local_only" | "incompatible" | "failed";

export type OfflineAvailability = {
  state: OfflineAvailabilityState;
  localVersion: number | null;
  remoteVersion: number | null;
  sizeBytes: number | null;
  message: string;
};

export type StoredReaderPackage = {
  slug: string;
  version: number;
  checksum: string;
  catalog: CatalogItem;
  package: ReaderPackage;
  sizeBytes: number;
  installedAt: string;
  source: "bootstrap" | "download";
};

export type PendingProgressOperation = {
  operationId: string;
  slug: string;
  version: number;
  stableAnchor: string;
  positionMs: number;
  occurredAt: string;
};

export const availabilityFor = (
  remote: CatalogItem | undefined,
  local: StoredReaderPackage | undefined,
): OfflineAvailability => {
  if (remote !== undefined && !isCompatibleVersion(remote.minimum_app_version)) {
    return {
      state: "incompatible",
      localVersion: local?.version ?? null,
      remoteVersion: remote.version,
      sizeBytes: local?.sizeBytes ?? null,
      message:
        local === undefined
          ? "Requiere una versión más reciente de FollowRead."
          : "La actualización requiere una versión más reciente de FollowRead.",
    };
  }
  if (remote === undefined && local !== undefined) {
    return {
      state: "local_only",
      localVersion: local.version,
      remoteVersion: null,
      sizeBytes: local.sizeBytes,
      message: "Disponible en este dispositivo; ya no aparece en el catálogo remoto.",
    };
  }
  if (remote !== undefined && local !== undefined) {
    const update = remote.version > local.version || remote.checksum !== local.checksum;
    return {
      state: update ? "update_available" : "downloaded",
      localVersion: local.version,
      remoteVersion: remote.version,
      sizeBytes: local.sizeBytes,
      message: update
        ? `Actualización ${String(remote.version)} disponible.`
        : "Disponible sin conexión.",
    };
  }
  return {
    state: "remote",
    localVersion: null,
    remoteVersion: remote?.version ?? null,
    sizeBytes: null,
    message: "Disponible en línea.",
  };
};

export const isCompatibleVersion = (
  minimumVersion: string,
  currentVersion = READER_APP_VERSION,
): boolean => compareVersions(currentVersion, minimumVersion) >= 0;

export const compareVersions = (left: string, right: string): number => {
  const leftParts = versionParts(left);
  const rightParts = versionParts(right);
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
};

export const sha256Checksum = async (payload: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return `sha256:${[...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
};

export const packageByteSize = (payload: string): number =>
  new TextEncoder().encode(payload).length;

export const storagePolicyForSize = (sizeBytes: number): "normal" | "warning" | "blocked" => {
  if (sizeBytes > PACKAGE_LIMIT_BYTES) {
    return "blocked";
  }
  return sizeBytes >= PACKAGE_WARNING_BYTES ? "warning" : "normal";
};

export const assertPackageCanActivate = async (
  catalog: CatalogItem,
  rawPackage: string,
): Promise<ReaderPackage> => {
  if (!isCompatibleVersion(catalog.minimum_app_version)) {
    throw new OfflinePackageError("incompatible", "Esta versión requiere actualizar FollowRead.");
  }
  const sizeBytes = packageByteSize(rawPackage);
  if (storagePolicyForSize(sizeBytes) === "blocked") {
    throw new OfflinePackageError("package_too_large", "El paquete supera el límite de 250 MB.");
  }
  const checksum = await sha256Checksum(rawPackage);
  if (checksum !== catalog.checksum) {
    throw new OfflinePackageError(
      "checksum_mismatch",
      "La descarga no superó la verificación de integridad.",
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawPackage) as unknown;
  } catch {
    throw new OfflinePackageError("invalid_package", "El paquete descargado no es JSON válido.");
  }
  if (
    !isReaderPackage(parsed) ||
    parsed.slug !== catalog.slug ||
    parsed.version !== catalog.version
  ) {
    throw new OfflinePackageError(
      "invalid_package",
      "El paquete no coincide con el contenido solicitado.",
    );
  }
  return parsed;
};

export class OfflinePackageError extends Error {
  constructor(
    readonly code:
      | "checksum_mismatch"
      | "incompatible"
      | "invalid_package"
      | "package_too_large"
      | "large_package_cancelled"
      | "storage_full"
      | "network",
    message: string,
  ) {
    super(message);
  }
}

export const formatStorageSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${String(bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const versionParts = (version: string): number[] =>
  version
    .split(".")
    .slice(0, 3)
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isFinite(part) ? part : 0));

const isReaderPackage = (value: unknown): value is ReaderPackage =>
  typeof value === "object" &&
  value !== null &&
  "slug" in value &&
  typeof value.slug === "string" &&
  "version" in value &&
  typeof value.version === "number" &&
  "translations" in value &&
  Array.isArray(value.translations) &&
  value.translations.length > 0;
