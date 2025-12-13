import type { MoonCalendarDay } from "@/lib/api/moonCalendar";
import type { CelestialType } from "../types";

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const MONTHS_PER_YEAR = 12;

export type LuaListLayout = {
  tileWidth: number;
  gap: number;
  padding: number;
  visibleColumns: number;
};

const LAYOUT_BREAKPOINTS: Array<{ maxWidth: number; layout: LuaListLayout }> = [
  { maxWidth: 480, layout: { tileWidth: 80, gap: 10, padding: 24, visibleColumns: 3.6 } },
  { maxWidth: 768, layout: { tileWidth: 90, gap: 12, padding: 28, visibleColumns: 4.3 } },
  { maxWidth: 1200, layout: { tileWidth: 96, gap: 12, padding: 32, visibleColumns: 4.8 } },
  { maxWidth: 1600, layout: { tileWidth: 104, gap: 14, padding: 36, visibleColumns: 5.2 } },
  { maxWidth: Infinity, layout: { tileWidth: 112, gap: 16, padding: 40, visibleColumns: 5.6 } },
];

export const getResponsiveLayout = (viewportWidth?: number | null): LuaListLayout => {
  const width = viewportWidth ?? 1280;
  const match = LAYOUT_BREAKPOINTS.find(({ maxWidth }) => width <= maxWidth);
  return match?.layout ?? LAYOUT_BREAKPOINTS[LAYOUT_BREAKPOINTS.length - 1].layout;
};

// Configurações de animação
export const ANIMATION_CONFIG = {
  spring: { type: "spring" as const, stiffness: 260, damping: 18 },
  float: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  glow: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
} as const;

export type MonthEntry = {
  year: number;
  monthNumber: number;
  monthName: string;
  newMoonSign: string;
  fullMoonSign: string;
  newMoonDate: string;
  fullMoonDate: string;
};

export type HighlightTarget = MonthEntry & {
  phase: "luaNova" | "luaCheia";
  date: string;
};

export const HIGHLIGHTABLE_PHASES = ["luaNova", "luaCheia"] as const;
export type HighlightablePhase = (typeof HIGHLIGHTABLE_PHASES)[number];

export const formatDateInTimezone = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

export const formatDateLabel = (isoDate?: string) => {
  if (!isoDate) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${isoDate}T00:00:00Z`));
  } catch (error) {
    return isoDate;
  }
};

export const buildMonthEntries = (calendarByYear: Record<number, MoonCalendarDay[]>): MonthEntry[] => {
  const years = Object.keys(calendarByYear)
    .map(Number)
    .sort((a, b) => a - b);

  return years.flatMap((year) => {
    const base = MONTH_NAMES.map((month, idx) => ({
      year,
      monthNumber: idx + 1,
      monthName: month,
      newMoonSign: "",
      fullMoonSign: "",
      newMoonDate: "",
      fullMoonDate: "",
    }));

    (calendarByYear[year] || []).forEach((day) => {
      const date = new Date(`${day.date}T00:00:00Z`);
      const monthIndex = Number.isNaN(date.getTime()) ? null : date.getUTCMonth();
      if (monthIndex === null || monthIndex < 0 || monthIndex > 11) return;

      const sign = day.sign?.trim() || "";

      if (day.normalizedPhase === "luaNova" && !base[monthIndex].newMoonSign) {
        base[monthIndex].newMoonSign = sign;
        base[monthIndex].newMoonDate = day.date;
      }

      if (day.normalizedPhase === "luaCheia" && !base[monthIndex].fullMoonSign) {
        base[monthIndex].fullMoonSign = sign;
        base[monthIndex].fullMoonDate = day.date;
      }
    });

    return base;
  });
};

export const flattenCalendarDays = (calendarByYear: Record<number, MoonCalendarDay[]>) =>
  Object.values(calendarByYear)
    .flat()
    .sort((a, b) => a.date.localeCompare(b.date));

export const findMonthEntryByDate = (monthEntries: MonthEntry[], isoDate: string) => {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getUTCFullYear();
  const monthNumber = parsed.getUTCMonth() + 1;
  return monthEntries.find((m) => m.year === year && m.monthNumber === monthNumber) || null;
};

export const isHighlightablePhase = (phase?: string | null): phase is HighlightablePhase =>
  !!phase && HIGHLIGHTABLE_PHASES.includes(phase as HighlightablePhase);

export const deriveHighlightTarget = (
  allDays: MoonCalendarDay[],
  todayIso: string,
  monthEntries: MonthEntry[],
): HighlightTarget | null => {
  const sortedMoonEvents = allDays
    .filter((day) => isHighlightablePhase(day.normalizedPhase))
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDate = allDays.find((day) => day.date === todayIso);
  const upcoming = sortedMoonEvents.find((day) => day.date >= todayIso) ?? sortedMoonEvents.at(-1);

  const targetDay = isHighlightablePhase(byDate?.normalizedPhase) ? byDate : upcoming;
  if (!targetDay || !isHighlightablePhase(targetDay.normalizedPhase)) return null;

  const monthEntry = findMonthEntryByDate(monthEntries, targetDay.date);
  if (!monthEntry) return null;

  return {
    ...monthEntry,
    phase: targetDay.normalizedPhase,
    date: targetDay.date,
  };
};

export const buildMoonInfo = (month: MonthEntry | null, phase: CelestialType) => {
  const monthName = month?.monthName ?? "Mês";
  const isNewMoon = phase === "luaNova";
  const isFullMoon = phase === "luaCheia";
  const signRaw = isNewMoon ? month?.newMoonSign : month?.fullMoonSign;
  const sign = signRaw?.trim();
  const signLabel = sign && sign.length > 0 ? `em ${sign}` : "— aguardando sincronização";

  return {
    monthName,
    signLabel,
    phaseLabel: isNewMoon ? "Lua Nova" : isFullMoon ? "Lua Cheia" : "Lua",
  };
};

// Utilidade para calcular float offset com base na direção e índice
export const getFloatOffset = (direction: "up" | "down", globalIdx: number): number => {
  const base = direction === "up" ? -1.5 : 1.5;
  return direction === "up" ? base + globalIdx * 0.05 : base - globalIdx * 0.05;
};
