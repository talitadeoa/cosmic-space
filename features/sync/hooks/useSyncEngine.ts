'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * 🔄 Sync Engine Hook
 * 
 * Consolidado de: useGalaxySunsSync, usePeriodicalSync, useGlobalSync
 * 
 * Factory para criar sincronizações reutilizáveis
 * com polling, retry logic e error handling
 */

export interface SyncConfig {
  intervalMs?: number;
  initialDelayMs?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface SyncResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  syncedAt: Date | null;
  refresh: () => Promise<void>;
  stop: () => void;
}

/**
 * Hook para sincronização com polling
 * 
 * Exemplo:
 * ```tsx
 * const sync = useSyncEngine(
 *   () => fetch('/api/sync').then(r => r.json()),
 *   { intervalMs: 30000 }
 * );
 * ```
 */
export function useSyncEngine<T>(
  syncFn: () => Promise<T>,
  config: SyncConfig = {}
): SyncResult<T> {
  const {
    intervalMs = 30000,
    initialDelayMs = 0,
    enabled = true,
    onError,
    maxRetries = 3,
    retryDelayMs = 1000,
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const performSync = useCallback(
    async (isRetry = false) => {
      if (!isMountedRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await syncFn();
        if (isMountedRef.current) {
          setData(result);
          setSyncedAt(new Date());
          setError(null);
          retryCountRef.current = 0;
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        const syncError = err instanceof Error ? err : new Error(String(err));
        setError(syncError);
        onError?.(syncError);

        // Retry logic
        if (isRetry && retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          const delay = retryDelayMs * Math.pow(2, retryCountRef.current - 1);
          timeoutRef.current = setTimeout(() => performSync(true), delay);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [syncFn, onError, maxRetries, retryDelayMs]
  );

  const refresh = useCallback(async () => {
    retryCountRef.current = 0;
    await performSync();
  }, [performSync]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // Setup periodic sync
  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    // Initial sync
    if (initialDelayMs > 0) {
      timeoutRef.current = setTimeout(() => {
        performSync();
      }, initialDelayMs);
    } else {
      performSync();
    }

    // Periodic sync
    intervalRef.current = setInterval(() => {
      performSync();
    }, intervalMs);

    return () => {
      stop();
    };
  }, [enabled, intervalMs, initialDelayMs, performSync, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    syncedAt,
    refresh,
    stop,
  };
}

/**
 * Hook para executar sync uma única vez no mount
 */
export function useSyncOnce<T>(syncFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    syncFn()
      .then((result) => {
        if (mounted) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [syncFn]);

  return { data, isLoading, error };
}

/**
 * Hook para batching de sincronizações
 * Útil para sincronizar múltiplos recursos com mesmo intervalo
 */
export function useBatchSync(
  syncs: Record<string, () => Promise<any>>,
  config: SyncConfig = {}
) {
  const batchFn = useCallback(async () => {
    const results = await Promise.allSettled(
      Object.values(syncs).map((fn) => fn())
    );
    return Object.keys(syncs).reduce((acc, key, idx) => {
      const result = results[idx];
      acc[key] = result.status === 'fulfilled' ? result.value : null;
      return acc;
    }, {} as Record<string, any>);
  }, [syncs]);

  return useSyncEngine(batchFn, config);
}
