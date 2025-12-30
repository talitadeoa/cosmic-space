/**
 * Funções centralizadas para cálculos lunares
 *
 * Consolidação de código duplicado que estava em:
 * - app/api/moons/route.ts
 * - app/api/moons/lunations/route.ts
 * - scripts/sync-lunations.js
 *
 * Uso:
 * import { calcMoonAge, ZODIAC_CUTOFFS } from "@/lib/moon-calculations";
 */

import type { MoonPhase } from '@/types/moon';

export const SYNODIC_MONTH = 29.53058867; // dias

export const ZODIAC_CUTOFFS: Array<[string, number]> = [
  ['Capricórnio', 20],
  ['Aquário', 19],
  ['Peixes', 21],
  ['Áries', 20],
  ['Touro', 21],
  ['Gêmeos', 21],
  ['Câncer', 23],
  ['Leão', 23],
  ['Virgem', 23],
  ['Libra', 23],
  ['Escorpião', 22],
  ['Sagitário', 22],
];

/**
 * Converte data para Dia Juliano
 * Necessário para cálculos de fase lunar precisos
 */
export const toJulianDay = (date: Date): number => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
};

/**
 * Calcula idade da Lua em dias (0-29.53)
 * @param date Data para calcular
 * @returns Idade da lua em dias
 */
export const calcMoonAge = (date: Date): number => {
  const jd = toJulianDay(date) + (date.getUTCHours() - 12) / 24 + date.getUTCMinutes() / 1440;
  const daysSinceNew = jd - 2451549.5;
  const newMoons = daysSinceNew / SYNODIC_MONTH;
  const frac = newMoons - Math.floor(newMoons);
  return frac * SYNODIC_MONTH;
};

/**
 * Calcula iluminação da Lua (0-1)
 * @param ageDays Idade da lua em dias
 * @returns Fração iluminada (0-1)
 */
export const illuminationFromAge = (ageDays: number): number =>
  0.5 * (1 - Math.cos((2 * Math.PI * ageDays) / SYNODIC_MONTH));

/**
 * Mapeia idade em dias para tipo de fase normalizado
 */
export const labelPhase = (ageDays: number): MoonPhase => {
  if (ageDays < 1.5 || ageDays > SYNODIC_MONTH - 1.5) return 'luaNova';
  if (ageDays < SYNODIC_MONTH / 2 - 1.2) return 'luaCrescente';
  if (ageDays < SYNODIC_MONTH / 2 + 1.2) return 'luaCheia';
  return 'luaMinguante';
};

/**
 * Converte fase normalizada para rótulo em português
 */
export const describePhase = (norm: MoonPhase): string => {
  switch (norm) {
    case 'luaNova':
      return 'Lua Nova';
    case 'luaCrescente':
      return 'Lua Crescente';
    case 'luaCheia':
      return 'Lua Cheia';
    case 'luaMinguante':
      return 'Lua Minguante';
    default:
      return 'Lua';
  }
};

export type MoonTimeData = {
  illumination: number; // 0-1
  phaseFraction: number; // 0-1
  isWaxing: boolean;
  phaseName: string;
};

/**
 * Dados contínuos da Lua para um instante de tempo.
 */
export const getMoonData = (dateTime: Date): MoonTimeData => {
  const ageDays = calcMoonAge(dateTime);
  const illumination = illuminationFromAge(ageDays);
  const phaseFraction = ageDays / SYNODIC_MONTH;
  const isWaxing = ageDays <= SYNODIC_MONTH / 2;
  const phaseName = describePhase(labelPhase(ageDays));
  return { illumination, phaseFraction, isWaxing, phaseName };
};

/**
 * Aproxima signo zodiacal pela data (não é astrologia precisa)
 */
export const approximateSign = (date: Date): string => {
  const dayOfMonth = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const cutoff = ZODIAC_CUTOFFS[monthIndex][1];
  const sign =
    dayOfMonth < cutoff
      ? ZODIAC_CUTOFFS[monthIndex === 0 ? 11 : monthIndex - 1][0]
      : ZODIAC_CUTOFFS[monthIndex][0];
  return sign;
};
