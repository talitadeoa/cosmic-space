import type { MoonPhase } from '@/app/cosmos/utils/todoStorage';

export type PhaseStat = {
  phase: MoonPhase;
  total: number;
  completed: number;
  productivity: number;
};
