'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Componente que sincroniza lunações do banco de dados
 * Desabilitado: API /api/moons/lunations foi removida
 * Use getLunations() do lib/forms.ts para buscar dados diretamente
 *
 * Uso:
 *   <LunationSync autoSync={true} years={[2024, 2025]} onSuccess={handleSuccess} />
 */

interface LunationSyncProps {
  autoSync?: boolean;
  years?: number[];
  onSuccess?: (count: number) => void;
  onError?: (error: string) => void;
  verbose?: boolean;
}

export function LunationSync({
  autoSync = true,
  years = [],
  onSuccess,
  onError,
  verbose = false,
}: LunationSyncProps) {
  // TODO: Implementar sincronização sem usar /api/moons/lunations
  // Usar getLunations() diretamente ou criar server action

  return null;
}

/**
 * Hook para sincronizar lunações manualmente
 * TODO: Implementar sem usar /api/moons/lunations
 */
export function useSyncLunations() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const sync = async (year: number, verbose = false) => {
    try {
      setIsSyncing(true);
      setLastError(null);

      if (verbose) console.warn(`🌙 Sincronizando ${year}... (TODO: Implementar)`);

      // TODO: Implementar sincronização sem usar /api/moons/lunations
      throw new Error('Sincronização ainda não implementada. Use getLunations() do lib/forms.ts');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setLastError(message);
      console.error(`❌ Erro ao sincronizar ${year}:`, message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return { sync, isSyncing, lastError };
}
