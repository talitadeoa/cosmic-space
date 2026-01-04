'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook para executar uma função periodicamente (polling)
 * 
 * Uso:
 * ```tsx
 * usePeriodicalSync(() => {
 *   console.log('Sincronizando...');
 * }, 10000, [shouldSync]);
 * ```
 */
export function usePeriodicalSync(
  callback: () => void | Promise<void>,
  intervalMs: number = 10000,
  dependencies: any[] = [],
  enabled: boolean = true
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Executar imediatamente na primeira vez
    callback();

    // Depois, executar periodicamente
    intervalRef.current = setInterval(callback, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback, intervalMs, enabled, ...dependencies]);
}
