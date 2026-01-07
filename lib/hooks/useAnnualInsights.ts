/**
 * 💡 useAnnualInsights - Hook Migrado
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

export interface AnnualInsight {
  year: number;
  insight: string;
  timestamp: string;
}

// ============================================
// STORAGE KEY
// ============================================

const STORAGE_KEY = 'flua-annual-insights';

// ============================================
// HOOK
// ============================================

export function useAnnualInsights() {
  const [insights, setInsights] = useState<AnnualInsight[]>(() =>
    storage.get<AnnualInsight[]>(STORAGE_KEY, [])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Salva um novo insight
   */
  const saveInsight = useCallback(async (insight: string, year?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const selectedYear = year ?? new Date().getFullYear();

      await apiClient.post('/api/form/annual-insight', {
        insight,
        year: selectedYear,
      });

      const newInsight: AnnualInsight = {
        year: selectedYear,
        insight,
        timestamp: new Date().toISOString(),
      };

      setInsights((prev: AnnualInsight[]) => {
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
  }, []);

  return { insights, isLoading, error, saveInsight };
}
