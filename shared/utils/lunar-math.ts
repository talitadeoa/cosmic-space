/**
 * 🌙 Lunar Math Utils
 * 
 * Consolidação de cálculos lunares dispersos em:
 * - lib/moon-calculations.ts
 * - lib/lunar-cycle-utils.ts
 * - lib/lunar-cache.ts
 * 
 * Use os hooks em @/hooks em vez de chamar essas funções diretamente
 */

import type { MoonPhase } from '@/types/moon';

export const SYNODIC_MONTH = 29.53058867; // dias

export const ZODIAC_SIGNS = [
  'Capricórnio', 'Aquário', 'Peixes', 'Áries',
  'Touro', 'Gêmeos', 'Câncer', 'Leão',
  'Virgem', 'Libra', 'Escorpião', 'Sagitário'
] as const;

export const MOON_PHASES = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'] as const;

/**
 * Calcula idade da lua em dias desde a última lua nova
 */
export function calcMoonAge(date: Date): number {
  const knownNewMoon = new Date('2000-01-06');
  const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceKnown % SYNODIC_MONTH;
}

/**
 * Converte idade da lua para fase descritiva
 */
export function getMoonPhase(age: number): MoonPhase {
  if (age < 7.38) return 'luaNova';
  if (age < 14.77) return 'luaCrescente';
  if (age < 22.12) return 'luaCheia';
  return 'luaMinguante';
}

/**
 * Calcula signo zodiacal baseado na data
 */
export function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Áries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Touro';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gêmeos';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Câncer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leão';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgem';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Escorpião';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagitário';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricórnio';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquário';
  return 'Peixes';
}

/**
 * Calcula dias até próxima fase lunar
 */
export function daysUntilNextPhase(age: number): number {
  const quarterCycle = SYNODIC_MONTH / 4;
  const nextPhaseAge = Math.ceil(age / quarterCycle) * quarterCycle;
  return Math.round(nextPhaseAge - age);
}

export default {
  SYNODIC_MONTH,
  ZODIAC_SIGNS,
  MOON_PHASES,
  calcMoonAge,
  getMoonPhase,
  getZodiacSign,
  daysUntilNextPhase,
};
