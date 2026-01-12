/**
 * Utilities e helpers para SyncEngine
 */

import type { SyncConfig, SyncState, SyncMetadata } from './SyncEngine.types';

/**
 * Normalizar configuração com valores defaults
 */
export function normalizeConfig(
  config: any = {}
): Record<string, any> {
  return {
    syncIntervalMs: config.syncIntervalMs ?? 10000,
    initialDelayMs: config.initialDelayMs ?? 100,
    maxRetries: config.maxRetries ?? 3,
    retryDelayMs: config.retryDelayMs ?? 1000,
    debounceMs: config.debounceMs ?? 300,
    autoRetry: config.autoRetry ?? true,
    name: config.name ?? 'SyncEngine',
    debug: config.debug ?? false,
  };
}

/**
 * Criar estado inicial vazio
 */
export function createEmptyState<T>(initial: T): SyncState<T> {
  return {
    local: initial,
    remote: null,
    remoteVersion: null,
    isLoaded: false,
    isSyncing: false,
    syncError: null,
    hasPending: false,
    lastSyncAt: null,
    retryCount: 0,
  };
}

/**
 * Criar metadados vazios
 */
export function createEmptyMetadata(): SyncMetadata {
  return {
    remoteVersion: null,
    cursor: null,
    lastSyncAt: null,
    retryCount: 0,
  };
}

/**
 * Logger com namespace
 */
export function createLogger(name: string, debug: boolean): ((...args: unknown[]) => void) {
  return (...args: unknown[]): void => {
    if (debug) {
      console.log(`[${name}]`, ...args);
    }
  };
}

/**
 * Delay helper para sleep
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validar estado sincronizado
 */
export function isSyncComplete<T>(state: SyncState<T>): boolean {
  return !state.hasPending && !state.isSyncing && state.syncError === null;
}

/**
 * Formatar metadados para debug
 */
export function formatMetadata(meta: SyncMetadata): string {
  return JSON.stringify({
    version: meta.remoteVersion,
    cursor: meta.cursor,
    lastSync: meta.lastSyncAt,
    retries: meta.retryCount,
  });
}
