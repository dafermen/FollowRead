import type { PendingProgressOperation, StoredReaderPackage } from "./offlineDomain.js";

export interface OfflineRepository {
  listPackages(): Promise<StoredReaderPackage[]>;
  getPackage(slug: string): Promise<StoredReaderPackage | undefined>;
  putPackage(value: StoredReaderPackage): Promise<void>;
  deletePackage(slug: string): Promise<void>;
  listOperations(): Promise<PendingProgressOperation[]>;
  replaceProgressOperation(value: PendingProgressOperation): Promise<void>;
  deleteOperations(operationIds: readonly string[]): Promise<void>;
  getClientId(): Promise<string>;
}

const DATABASE_NAME = "followread-reader-offline";
const DATABASE_VERSION = 1;

export class IndexedDbOfflineRepository implements OfflineRepository {
  constructor(private readonly database: IDBDatabase) {}

  static async open(): Promise<IndexedDbOfflineRepository> {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("packages")) {
        database.createObjectStore("packages", { keyPath: "slug" });
      }
      if (!database.objectStoreNames.contains("operations")) {
        const operations = database.createObjectStore("operations", { keyPath: "operationId" });
        operations.createIndex("slug", "slug");
      }
      if (!database.objectStoreNames.contains("meta")) {
        database.createObjectStore("meta", { keyPath: "key" });
      }
    });
    return new IndexedDbOfflineRepository(await requestResult(request));
  }

  async listPackages(): Promise<StoredReaderPackage[]> {
    return this.readAll<StoredReaderPackage>("packages");
  }

  async getPackage(slug: string): Promise<StoredReaderPackage | undefined> {
    const transaction = this.database.transaction("packages", "readonly");
    const request = transaction.objectStore("packages").get(slug) as IDBRequest<
      StoredReaderPackage | undefined
    >;
    return requestResult(request);
  }

  async putPackage(value: StoredReaderPackage): Promise<void> {
    const transaction = this.database.transaction("packages", "readwrite");
    transaction.objectStore("packages").put(value);
    await transactionDone(transaction);
  }

  async deletePackage(slug: string): Promise<void> {
    const transaction = this.database.transaction("packages", "readwrite");
    transaction.objectStore("packages").delete(slug);
    await transactionDone(transaction);
  }

  async listOperations(): Promise<PendingProgressOperation[]> {
    return this.readAll<PendingProgressOperation>("operations");
  }

  async replaceProgressOperation(value: PendingProgressOperation): Promise<void> {
    const transaction = this.database.transaction("operations", "readwrite");
    const store = transaction.objectStore("operations");
    const index = store.index("slug");
    const existing = await requestResult(index.getAllKeys(value.slug));
    for (const key of existing) {
      store.delete(key);
    }
    store.put(value);
    await transactionDone(transaction);
  }

  async deleteOperations(operationIds: readonly string[]): Promise<void> {
    const transaction = this.database.transaction("operations", "readwrite");
    const store = transaction.objectStore("operations");
    for (const operationId of operationIds) {
      store.delete(operationId);
    }
    await transactionDone(transaction);
  }

  async getClientId(): Promise<string> {
    const transaction = this.database.transaction("meta", "readwrite");
    const store = transaction.objectStore("meta");
    const current = (await requestResult(store.get("clientId"))) as
      { key: "clientId"; value: string } | undefined;
    if (current !== undefined) {
      await transactionDone(transaction);
      return current.value;
    }
    const value = crypto.randomUUID();
    store.put({ key: "clientId", value });
    await transactionDone(transaction);
    return value;
  }

  private async readAll<T>(storeName: "packages" | "operations"): Promise<T[]> {
    const transaction = this.database.transaction(storeName, "readonly");
    const result = await requestResult(transaction.objectStore(storeName).getAll());
    return result as T[];
  }
}

export class MemoryOfflineRepository implements OfflineRepository {
  private readonly packages = new Map<string, StoredReaderPackage>();
  private readonly operations = new Map<string, PendingProgressOperation>();
  private clientId: string | null = null;

  listPackages(): Promise<StoredReaderPackage[]> {
    return Promise.resolve([...this.packages.values()]);
  }

  getPackage(slug: string): Promise<StoredReaderPackage | undefined> {
    return Promise.resolve(this.packages.get(slug));
  }

  putPackage(value: StoredReaderPackage): Promise<void> {
    this.packages.set(value.slug, value);
    return Promise.resolve();
  }

  deletePackage(slug: string): Promise<void> {
    this.packages.delete(slug);
    return Promise.resolve();
  }

  listOperations(): Promise<PendingProgressOperation[]> {
    return Promise.resolve([...this.operations.values()]);
  }

  replaceProgressOperation(value: PendingProgressOperation): Promise<void> {
    for (const [operationId, operation] of this.operations) {
      if (operation.slug === value.slug) {
        this.operations.delete(operationId);
      }
    }
    this.operations.set(value.operationId, value);
    return Promise.resolve();
  }

  deleteOperations(operationIds: readonly string[]): Promise<void> {
    for (const operationId of operationIds) {
      this.operations.delete(operationId);
    }
    return Promise.resolve();
  }

  getClientId(): Promise<string> {
    this.clientId ??= crypto.randomUUID();
    return Promise.resolve(this.clientId);
  }
}

let repositoryPromise: Promise<OfflineRepository> | null = null;

export const getOfflineRepository = (): Promise<OfflineRepository> => {
  repositoryPromise ??=
    "indexedDB" in window
      ? IndexedDbOfflineRepository.open().catch(() => new MemoryOfflineRepository())
      : Promise.resolve(new MemoryOfflineRepository());
  return repositoryPromise;
};

export const resetOfflineRepositoryForTests = (): void => {
  repositoryPromise = null;
};

const requestResult = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.addEventListener("success", () => {
      resolve(request.result);
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("IndexedDB request failed."));
    });
  });

const transactionDone = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => {
      resolve();
    });
    transaction.addEventListener("abort", () => {
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    });
    transaction.addEventListener("error", () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    });
  });
