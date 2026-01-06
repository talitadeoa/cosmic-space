/**
 * 💡 Insights Types - Genéricos e Reutilizáveis
 */

import type { MoonPhase } from './moon';

/**
 * Interface base genérica para insights com período
 */
export interface GenericInsight {
  id?: string;
  userId?: string;
  period: string | number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Insight mensal
 */
export interface MonthlyInsight extends GenericInsight {
  period: number; // mês (1-12)
  year?: number;
}

/**
 * Insight trimestral
 */
export interface QuarterlyInsight extends GenericInsight {
  period: number; // trimestre (1-4)
  year?: number;
  quarter: number;
}

/**
 * Insight anual
 */
export interface AnnualInsight extends GenericInsight {
  period: number; // ano (ex: 2024)
  year: number;
}

/**
 * Insight lunar (por fase)
 */
export interface LunarInsight extends GenericInsight {
  period: string; // ISO date
  phase: MoonPhase;
}

/**
 * Record de insight (com resposta de chat)
 */
export interface InsightRecord<T extends GenericInsight = GenericInsight> {
  insight: T;
  chatResponse?: string;
  isComplete?: boolean;
}

/**
 * Estado de insights
 */
export interface InsightState<T extends GenericInsight = GenericInsight> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Config para hook de insights
 */
export interface InsightConfig {
  endpoint: string;
  storageKey?: string;
}
