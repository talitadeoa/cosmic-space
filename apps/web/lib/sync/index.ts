/**
 * Sync Engine - Barrel Export
 * 
 * @example
 * ```typescript
 * import { SyncEngine, useSyncEngine } from '@/lib/sync';
 * ```
 */

export {
  SyncEngine,
  type SyncConfig,
  type SyncState,
  type SyncCallbacks,
  type SyncMetadata,
  type PushResult,
  type PullResult,
  type InitializeOptions,
  createEmptyMetadata,
  createEmptyState,
} from './SyncEngine';

export {
  useSyncEngine,
  useSyncEngineSelector,
  type UseSyncEngineOptions,
  type UseSyncEngineReturn,
} from './useSyncEngine';
