/**
 * Estratégias de retry, backoff e merge para SyncEngine
 */

export interface RetryStrategy {
  calculateDelay(attempt: number, baseDelayMs: number): number;
  shouldRetry(attempt: number, maxRetries: number, error: Error): boolean;
}

/**
 * Exponential backoff: 1s, 2s, 4s, 8s, ...
 */
export const exponentialBackoff: RetryStrategy = {
  calculateDelay(attempt: number, baseDelayMs: number): number {
    return baseDelayMs * Math.pow(2, attempt - 1);
  },

  shouldRetry(attempt: number, maxRetries: number, error: Error): boolean {
    if (attempt >= maxRetries) return false;
    
    // Não retenta se for erro de validação
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return false;
    }
    
    return true;
  },
};

/**
 * Linear backoff: 1s, 2s, 3s, 4s, ...
 */
export const linearBackoff: RetryStrategy = {
  calculateDelay(attempt: number, baseDelayMs: number): number {
    return baseDelayMs * attempt;
  },

  shouldRetry(attempt: number, maxRetries: number, error: Error): boolean {
    return attempt < maxRetries && !error.message.includes('validation');
  },
};

/**
 * No backoff: instant retry (útil para testes)
 */
export const noBackoff: RetryStrategy = {
  calculateDelay(): number {
    return 0;
  },

  shouldRetry(attempt: number, maxRetries: number): boolean {
    return attempt < maxRetries;
  },
};

/**
 * Estratégias de merge para resolver conflitos
 */
export interface MergeStrategy<T> {
  merge(local: T, remote: T | null): T;
  name: string;
}

/**
 * Last-write-wins: remote sempre sobrescreve local
 */
export const lastWriteWins = <T,>(): MergeStrategy<T> => ({
  name: 'last-write-wins',
  merge(local: T, remote: T | null): T {
    return remote ?? local;
  },
});

/**
 * Local-wins: local sempre sobrescreve remote
 */
export const localWins = <T,>(): MergeStrategy<T> => ({
  name: 'local-wins',
  merge(local: T): T {
    return local;
  },
});

/**
 * Deep merge para arrays: combina ambos (deduplicado por id)
 */
export const deepMergeArrays = <T extends { id: string }>(
  keyField: keyof T = 'id' as any
): MergeStrategy<T[]> => ({
  name: 'deep-merge-arrays',
  merge(local: T[], remote: T[] | null): T[] {
    if (!remote) return local;
    
    const map = new Map<string, T>();
    
    // Adicionar remote primeiro (mais recente)
    remote.forEach(item => {
      const key = String(item[keyField]);
      map.set(key, item);
    });
    
    // Sobrescrever com local (manter locais que não têm conflito)
    local.forEach(item => {
      const key = String(item[keyField]);
      if (!map.has(key)) {
        map.set(key, item);
      }
    });
    
    return Array.from(map.values());
  },
});

/**
 * Merge com timestamp: mais recente vence
 */
export const mergeByTimestamp = <T extends { updatedAt?: string }>(
): MergeStrategy<T> => ({
  name: 'merge-by-timestamp',
  merge(local: T, remote: T | null): T {
    if (!remote) return local;
    if (!local.updatedAt || !remote.updatedAt) return remote ?? local;
    
    const localTime = new Date(local.updatedAt).getTime();
    const remoteTime = new Date(remote.updatedAt).getTime();
    
    return remoteTime > localTime ? remote : local;
  },
});
