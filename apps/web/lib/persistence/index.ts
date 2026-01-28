/**
 * 📦 Persistence Layer - Exports
 * 
 * Centraliza exports de toda a camada de persistência.
 * Use para importar direto: @/lib/persistence
 */

// Storage Adapter (Interfaces)
export type {
  StorageAdapter,
  ObservableStorageAdapter,
  StorageEvent,
  StorageEventType,
  StorageObserver,
} from './StorageAdapter';

// Web Storage Implementation
export { webStorageAdapter } from './WebStorageAdapter';
export { WebStorageAdapter } from './WebStorageAdapter';

// Core Hub
export { persistenceHub } from './PersistenceHub';
export type { PersistenceDomain } from './PersistenceHub';

// React Hooks
export {
  usePersistent,
  useAsyncPersistent,
  useObservePersistent,
  useClearPersistence,
  usePersistenceKeys,
} from './hooks';
