/**
 * Exportações públicas do módulo de calendário lunar
 */

export { LunarCalendarWidget } from './LunarCalendarWidget';
export { LunarHero } from './LunarHero';
export { CalendarGrid } from './CalendarGrid';
export { NavigationControls } from './NavigationControls';
export { MoonPhaseIcon } from './MoonPhaseIcon';

export type {
  LunarCalendarProps,
  LunarData,
  LunarDataByDate,
  CalendarDay,
  CalendarWeek,
} from './types';

export { MoonPhase } from './types';

export {
  generateCalendarGrid,
  enrichCalendarWithLunarData,
  formatDateKey,
  formatDate,
  getMonthName,
  getWeekDayInitials,
  generateMockLunarData,
  isToday,
  isSameDay,
} from './utils';
