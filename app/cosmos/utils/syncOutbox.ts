'use client';

export type SyncEntityType = 'planet_todo' | 'planet_state' | 'island';
export type SyncChangeStatus = 'pending' | 'conflict';

export type OutboxChange<TPayload = unknown> = {
  clientChangeId: string;
  type: SyncEntityType;
  entityId: string;
  deviceId: string;
  baseVersion?: number | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  payload: TPayload;
  status?: SyncChangeStatus;
  createdAt: string;
};

const DB_NAME = 'flua_sync';
const DB_VERSION = 1;
const OUTBOX_STORE = 'outbox';
const META_STORE = 'meta';

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        const store = db.createObjectStore(OUTBOX_STORE, { keyPath: 'clientChangeId' });
        store.createIndex('by_type', 'type', { unique: false });
        store.createIndex('by_status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<any> | void
): Promise<T | void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = handler(store);
    tx.oncomplete = () => resolve(request ? request.result : undefined);
    tx.onerror = () => reject(tx.error);
  });
};

export const addOutboxChange = async <TPayload>(change: OutboxChange<TPayload>) => {
  await withStore<void>(OUTBOX_STORE, 'readwrite', (store) => store.put(change));
};

export const listOutboxChanges = async <TPayload>(
  type: SyncEntityType,
  limit = 50,
  includeConflicts = false
): Promise<OutboxChange<TPayload>[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readonly');
    const store = tx.objectStore(OUTBOX_STORE);
    const index = store.index('by_type');
    const request = index.openCursor(IDBKeyRange.only(type));
    const results: OutboxChange<TPayload>[] = [];

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || results.length >= limit) {
        resolve(includeConflicts ? results : results.filter((item) => item.status !== 'conflict'));
        return;
      }
      const value = cursor.value as OutboxChange<TPayload>;
      results.push(value);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
};

export const removeOutboxChange = async (clientChangeId: string) => {
  await withStore<void>(OUTBOX_STORE, 'readwrite', (store) => store.delete(clientChangeId));
};

export const updateOutboxChangeStatus = async (
  clientChangeId: string,
  status: SyncChangeStatus
) => {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE);
    const request = store.get(clientChangeId);
    request.onsuccess = () => {
      const existing = request.result as OutboxChange | undefined;
      if (!existing) {
        resolve();
        return;
      }
      existing.status = status;
      store.put(existing);
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getMeta = async <T>(key: string): Promise<T | null> => {
  const result = await withStore<{ key: string; value: T } | undefined>(
    META_STORE,
    'readonly',
    (store) => store.get(key)
  );
  return result?.value ?? null;
};

export const setMeta = async <T>(key: string, value: T): Promise<void> => {
  await withStore<void>(META_STORE, 'readwrite', (store) => store.put({ key, value }));
};

export const clearAllSyncData = async (): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([OUTBOX_STORE, META_STORE], 'readwrite');
    tx.objectStore(OUTBOX_STORE).clear();
    tx.objectStore(META_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};
