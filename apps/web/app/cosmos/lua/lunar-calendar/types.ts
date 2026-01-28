/**
 * Tipos e interfaces para o calendário lunar
 */

export enum MoonPhase {
  NEW = 'new',
  WAXING_CRESCENT = 'waxing_crescent',
  FIRST_QUARTER = 'first_quarter',
  WAXING_GIBBOUS = 'waxing_gibbous',
  FULL = 'full',
  WANING_GIBBOUS = 'waning_gibbous',
  LAST_QUARTER = 'last_quarter',
  WANING_CRESCENT = 'waning_crescent',
}

export interface LunarData {
  phase: MoonPhase;
  illumination: number; // 0-100
  phaseName: string; // ex: "Lua Crescente"
  daysInPhase?: number;
  nextPhaseDate?: Date;
}

export interface LunarDataByDate {
  [dateKey: string]: LunarData; // dateKey: "2025-12-28"
}

export interface LunarCalendarProps {
  month: number; // 0-11 (janeiro = 0)
  year: number;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  lunarDataByDate: LunarDataByDate;
  onMonthChange?: (month: number, year: number) => void;
  locale?: 'pt-BR' | 'en-US';
  ariaLabel?: string;
}

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  lunarData?: LunarData;
}

export interface CalendarWeek {
  days: CalendarDay[];
}
