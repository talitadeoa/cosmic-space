/**
 * 💡 useMonthlyInsights - REFATORADO
 * 
 * Agora usa o hook genérico useInsights<T>
 * Reduzido de ~100 linhas para ~20 linhas
 * 
 * @deprecated Migre para useInsights<MonthlyInsight> diretamente
 */

'use client';

import { useInsights } from '@/lib/hooks/useInsights';
import type { MonthlyInsight } from '@/types/insights';

/**
 * Hook para gerenciar insights mensais
 * 
 * @example
 * ```ts
 * const { insights, isLoading, save } = useMonthlyInsights();
 * 
 * await save({
 *   period: 5,
 *   year: 2024,
 *   content: 'Meu insight do mês'
 * });
 * ```
 */
export function useMonthlyInsights() {
  return useInsights<MonthlyInsight>({
    endpoint: '/api/insights/monthly',
    storageKey: 'monthly-insights',
  });
}

// Re-export do type para compatibilidade
export type { MonthlyInsight } from '@/types/insights';
