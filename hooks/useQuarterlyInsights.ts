/**
 * 📊 useQuarterlyInsights
 * 
 * Hook para gerenciar insights trimestrais.
 * Refatorado para usar useInsights genérico.
 */

import { useCallback } from 'react';
import { useInsights, type GenericInsight } from './useGenericInsights';
import type { MoonPhase } from '@/types/moon';

export interface QuarterlyInsight extends GenericInsight {
  moonPhase: MoonPhase;
  quarterNumber?: number;
  year?: number;
}

/**
 * Hook para insights trimestrais
 * 
 * @example
 * const { saveInsight, isLoading } = useQuarterlyInsights();
 * await saveInsight('luaCheia', 'Meu insight...', 1, 2025);
 */
export function useQuarterlyInsights() {
  const base = useInsights<QuarterlyInsight>({ endpoint: 'quarterly-insight' });

  // Wrapper para manter API existente (moonPhase, insight, quarterNumber?, year?)
  const saveInsight = useCallback(
    async (moonPhase: string, insight: string, quarterNumber?: number, year?: number) => {
      const selectedYear = year ?? new Date().getFullYear();
      return base.saveInsight(insight, { moonPhase, quarterNumber, year: selectedYear });
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
