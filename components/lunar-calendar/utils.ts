/**
 * Utilitários para cálculos de data e fase lunar
 */

import { MoonPhase, LunarData, LunarDataByDate, CalendarDay } from './types';

/**
 * Gera o grid completo do mês incluindo dias dos meses adjacentes
 */
export function generateCalendarGrid(
  year: number,
  month: number
): CalendarDay[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOfWeek = firstDay.getDay(); // 0 = domingo, 6 = sábado

  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  // Preenche dias do mês anterior
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startOfWeek - 1; i >= 0; i--) {
    const dayOfMonth = prevMonthLastDay - i;
    const date = new Date(year, month - 1, dayOfMonth);
    currentWeek.push({
      date,
      dayOfMonth,
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: false,
      isWeekend: isWeekend(date),
    });
  }

  // Preenche dias do mês atual
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    currentWeek.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday: isToday(date),
      isSelected: false,
      isWeekend: isWeekend(date),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Preenche dias do mês seguinte
  let nextMonthDay = 1;
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    const date = new Date(year, month + 1, nextMonthDay);
    currentWeek.push({
      date,
      dayOfMonth: nextMonthDay,
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: false,
      isWeekend: isWeekend(date),
    });
    nextMonthDay++;
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Enriquece o grid de calendário com dados lunares
 */
export function enrichCalendarWithLunarData(
  weeks: CalendarDay[][],
  lunarDataByDate: LunarDataByDate,
  selectedDate?: Date
): CalendarDay[][] {
  return weeks.map((week) =>
    week.map((day) => {
      const dateKey = formatDateKey(day.date);
      return {
        ...day,
        isSelected: selectedDate ? isSameDay(day.date, selectedDate) : false,
        lunarData: lunarDataByDate[dateKey],
      };
    })
  );
}

/**
 * Formata data para chave em formato "YYYY-MM-DD"
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Verifica se é o dia de hoje
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return isSameDay(date, today);
}

/**
 * Compara se dois dias são a mesma data
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Verifica se é fim de semana (sábado ou domingo)
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Formata data para exibição legível
 */
export function formatDate(
  date: Date,
  locale: 'pt-BR' | 'en-US' = 'pt-BR'
): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Retorna nome do mês
 */
export function getMonthName(month: number, locale: 'pt-BR' | 'en-US' = 'pt-BR'): string {
  const date = new Date(2024, month, 1);
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
}

/**
 * Iniciais dos dias da semana
 */
export function getWeekDayInitials(locale: 'pt-BR' | 'en-US' = 'pt-BR'): string[] {
  if (locale === 'pt-BR') {
    return ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // Dom, Seg, Ter, Qua, Qui, Sex, Sab
  }
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
}

/**
 * Exemplo de dados lunares por data
 */
export function generateMockLunarData(year: number, month: number): LunarDataByDate {
  const lunarDataByDate: LunarDataByDate = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const phases = [
    MoonPhase.NEW,
    MoonPhase.WAXING_CRESCENT,
    MoonPhase.FIRST_QUARTER,
    MoonPhase.WAXING_GIBBOUS,
    MoonPhase.FULL,
    MoonPhase.WANING_GIBBOUS,
    MoonPhase.LAST_QUARTER,
    MoonPhase.WANING_CRESCENT,
  ];

  const phaseNames = [
    'Lua Nova',
    'Crescente',
    'Quarto Crescente',
    'Gibosa Crescente',
    'Lua Cheia',
    'Gibosa Minguante',
    'Quarto Minguante',
    'Minguante',
  ];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const phaseIndex = Math.floor((day / daysInMonth) * phases.length) % phases.length;

    lunarDataByDate[dateKey] = {
      phase: phases[phaseIndex],
      illumination: Math.floor((Math.sin((day / daysInMonth) * Math.PI * 2) + 1) * 50),
      phaseName: phaseNames[phaseIndex],
      daysInPhase: Math.floor(Math.random() * 4) + 1,
    };
  }

  return lunarDataByDate;
}
