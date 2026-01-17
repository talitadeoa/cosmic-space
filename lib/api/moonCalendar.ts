import type { MoonPhase } from '@/types';

export type MoonCalendarDay = {
  date: string;
  moonPhase: string;
  sign: string;
  normalizedPhase: MoonPhase;
};
