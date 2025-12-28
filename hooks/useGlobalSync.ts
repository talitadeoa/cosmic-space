// hooks/useGlobalSync.ts
'use client';

import { useSyncLunations } from '@/components/sync';

/**
 * Hook consolidado para gerenciar todas as sincronizações globais
 * 
 * Uso:
 * const sync = useGlobalSync();
 * await sync.lunations.sync(2024);
 */
export function useGlobalSync() {
  const lunationsSync = useSyncLunations();

  return {
    lunations: lunationsSync,
    // TODO: adicionar outros syncs aqui
  };
}
