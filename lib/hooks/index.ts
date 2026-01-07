/**
 * 🪝 Hooks - Export Central
 * 
 * Todos os hooks centralizados em lib/hooks
 * Os hooks em /hooks raiz re-exportam daqui para compatibilidade.
 */

// ============================================
// CORE HOOKS
// ============================================

export { useInsights } from './useInsights';
export { useDebounce } from './useDebounce';
export { useMediaQuery } from './useMediaQuery';

// ============================================
// INSIGHTS (WRAPPERS DE COMPATIBILIDADE)
// ============================================

export { useMonthlyInsights, type MonthlyInsight, type MonthlyInsightRecord } from './useMonthlyInsights';
export { useQuarterlyInsights, type QuarterlyInsight } from './useQuarterlyInsights';
export { useAnnualInsights, type AnnualInsight } from './useAnnualInsights';

// ============================================
// TYPES RE-EXPORTS
// ============================================

export type { GenericInsight, InsightConfig, InsightState, InsightRecord } from '@/types/insights';
