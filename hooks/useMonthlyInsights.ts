/**
 * 📅 useMonthlyInsights
 * 
 * Hook para gerenciar insights mensais com cache.
 * Refatorado para usar useInsights genérico + useMonthlyInsightQuery (com deduplicação)
 * 
 * Nota: Para carregar com cache automático, use useMonthlyInsightQuery() em componentes
 */

import { useCallback } from 'react';
import { useInsights, type GenericInsight } from './useGenericInsights';
import { useMonthlyInsightQuery } from './useInsightsCache';
import type { MoonPhase } from '@/types/moon';

export interface MonthlyInsight extends GenericInsight {
  moonPhase: MoonPhase;
  year: number;
  monthNumber: number;
}

export interface MonthlyInsightRecord {
  id: number;
  moonPhase: string;
  year: number;
  monthNumber: number;
  insight: string;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Hook para insights mensais
 * 
 * @example
 * const { saveInsight, loadInsight, isLoading } = useMonthlyInsights();
 * 
 * // Salvar
 * await saveInsight('luaNova', 2025, 1, 'Meu insight...');
 * 
 * // Carregar
 * const record = await loadInsight('luaNova', 2025, 1);
 */
export function useMonthlyInsights() {
  const base = useInsights<MonthlyInsight>({ endpoint: 'monthly-insight' });

  // Wrapper para manter API existente (moonPhase, year, month, insight)
  const saveInsight = useCallback(
    async (moonPhase: string, year: number, monthNumber: number, insight: string) => {
      return base.saveInsight(insight, { moonPhase, year, monthNumber });
    },
    [base]
  );

  // Wrapper para manter API existente
  const loadInsight = useCallback(
    async (moonPhase: string, year: number, monthNumber: number) => {
      return base.loadInsight({ moonPhase, year, monthNumber }) as Promise<MonthlyInsightRecord | null>;
    },
    [base]
  );

  return {
    insights: base.insights,
    isLoading: base.isLoading,
    isFetching: base.isFetching,
    error: base.error,
    fetchError: base.error, // Backward compat
    saveInsight,
    loadInsight,
  };
}
