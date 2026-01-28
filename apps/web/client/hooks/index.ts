/**
 * 🪝 Client Hooks Module
 * 
 * Hooks organizados por domínio para facilitar descoberta e manutenção.
 * 
 * @example
 * import { usePlanetState, usePlanetTodos } from '@/client/hooks';
 * import { useNativeGestures } from '@/client/hooks/gestures';
 */

// Auth
export { useAuth } from './auth/useAuth';

// State Management (Planet)
export { usePlanetState } from './state/usePlanetState';
export { usePlanetTodos } from './state/usePlanetTodos';
export { useIslandNames } from './state/useIslandNames';
export { useFilteredTodos } from './state/useFilteredTodos';

// Data Fetching & Caching
export { useLunationCache } from './data/useLunationCache';
export { usePhaseInputs } from './data/usePhaseInputs';
export { useInsightsCache } from './data/useInsightsCache';
export { useAnnualInsights } from './data/useAnnualInsights';
export { useMonthlyInsights } from './data/useMonthlyInsights';
export { useQuarterlyInsights } from './data/useQuarterlyInsights';
export { useInsights as useGenericInsights } from './data/useGenericInsights';

// Gestures & Motion
export { useNativeGestures } from './gestures/useNativeGestures';
export { useHaptics } from './gestures/useHaptics';
export { useMotion } from './gestures/useMotion';

// UI Utilities
export { useKeyboardNavigation } from './ui/useKeyboardNavigation';
export { useMediaQuery } from './ui/useMediaQuery';
export { useDebounce } from './ui/useDebounce';

// Lunar Cycle
export { useCycle } from './cycle/useCycle';
export { useMenstrualCycle } from './cycle/useMenstrualCycle';
export { useCurrentWeekPhase } from './cycle/useCurrentWeekPhase';
export { useLunarPhaseUSNO } from './cycle/useLunarPhaseUSNO';

// Community
export { useCommunityCache } from './community/useCommunityCache';

// Sync
export { useGalaxySunsSync } from './sync/useGalaxySunsSync';

// Other
export { useBrainstormSession } from './other/useBrainstormSession';
export { useEmotionalInput } from './other/useEmotionalInput';
