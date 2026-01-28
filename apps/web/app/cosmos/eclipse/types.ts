import type { MoonPhase } from '@/client/storage';

export type PhaseStat = {
  phase: MoonPhase;
  total: number;
  completed: number;
  productivity: number;
};
