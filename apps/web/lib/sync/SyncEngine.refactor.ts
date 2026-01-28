/**
 * SyncEngine Refatorado - Exports Consolidados
 *
 * Este arquivo reúne todas as partes refatoradas do SyncEngine:
 * - Tipos e interfaces (SyncEngine.types.ts)
 * - Estratégias de retry e merge (SyncEngine.strategies.ts)
 * - Utilitários helpers (SyncEngine.utils.ts)
 * - Classe principal (SyncEngine.core.ts)
 */

// Reexportar tudo dos módulos especializados
export * from './SyncEngine.types';
export * from './SyncEngine.strategies';
export * from './SyncEngine.utils';
export { SyncEngine } from './SyncEngine.core';

// Presets de configuração comuns
export const SYNC_PRESETS = {
  /**
   * Config para aplicações desktop com conexão confiável
   */
  reliable: {
    debounceMs: 500,
    syncIntervalMs: 10000,
    initialDelayMs: 1000,
    autoRetry: true,
    maxRetries: 3,
    retryDelayMs: 2000,
  },

  /**
   * Config para aplicações mobile com conexão instável
   */
  mobile: {
    debounceMs: 1000,
    syncIntervalMs: 30000,
    initialDelayMs: 2000,
    autoRetry: true,
    maxRetries: 5,
    retryDelayMs: 5000,
  },

  /**
   * Config para aplicações web SPA
   */
  spa: {
    debounceMs: 300,
    syncIntervalMs: 5000,
    initialDelayMs: 500,
    autoRetry: true,
    maxRetries: 2,
    retryDelayMs: 1000,
  },

  /**
   * Config para desenvolvimento e debugging
   */
  debug: {
    debounceMs: 200,
    syncIntervalMs: 2000,
    initialDelayMs: 100,
    autoRetry: false,
    maxRetries: 1,
    retryDelayMs: 500,
    debug: true,
  },
};
