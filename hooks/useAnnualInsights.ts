/**
 * 📆 useAnnualInsights
 * 
 * Hook para gerenciar insights anuais.
 * Refatorado para usar useInsights genérico.
 */

import { useCallback } from 'react';
import { useInsights, type GenericInsight } from './useGenericInsights';

export interface AnnualInsight extends GenericInsight {
  year: number;
}

/**
 * Hook para insights anuais
 * 
 * @example
 * const { saveInsight, isLoading } = useAnnualInsights();
 * await saveInsight('Meu insight anual...', 2025);
 */
export function useAnnualInsights() {
  const base = useInsights<AnnualInsight>({ endpoint: 'annual-insight' });

  // Wrapper para manter API existente (insight, year?)
  const saveInsight = useCallback(
    async (insight: string, year?: number) => {
      const selectedYear = year ?? new Date().getFullYear();
      return base.saveInsight(insight, { year: selectedYear });
    },
    [base]
  );

  return {
    insights: base.insights,
    isLoading: base.isLoading,
    error: base.error,
    saveInsight,
  };
}
