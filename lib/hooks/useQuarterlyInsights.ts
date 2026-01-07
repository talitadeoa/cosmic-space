/**
 * 💡 useQuarterlyInsights - Hook Migrado
 * 
 * DEPRECATION NOTICE:
 * Este hook é um wrapper de compatibilidade sobre useInsights.
 * Para novos usos, prefira usar useInsights diretamente.
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { storage } from '@/lib/utils/storage';

// ============================================
// TYPES (mantendo compatibilidade)
// ============================================

export interface QuarterlyInsight {
  moonPhase: 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
  insight: string;
  timestamp: string;
  year?: number;
  quarterNumber?: number;
}

// ============================================
// STORAGE KEY
// ============================================

const STORAGE_KEY = 'flua-quarterly-insights';

// ============================================
// HOOK
// ============================================

export function useQuarterlyInsights() {
  const [insights, setInsights] = useState<QuarterlyInsight[]>(() =>
    storage.get<QuarterlyInsight[]>(STORAGE_KEY, [])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Salva um novo insight
   */
  const saveInsight = useCallback(
    async (moonPhase: string, insight: string, quarterNumber?: number, year?: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const selectedYear = year ?? new Date().getFullYear();

        await apiClient.post('/api/form/quarterly-insight', {
          moonPhase,
          insight,
          quarterNumber,
          year: selectedYear,
        });

        const newInsight: QuarterlyInsight = {
          moonPhase: moonPhase as QuarterlyInsight['moonPhase'],
          insight,
          timestamp: new Date().toISOString(),
          year: selectedYear,
          quarterNumber,
        };

        setInsights((prev: QuarterlyInsight[]) => {
          const updated = [...prev, newInsight];
          storage.set(STORAGE_KEY, updated);
          return updated;
        });

        return newInsight;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { insights, isLoading, error, saveInsight };
}
