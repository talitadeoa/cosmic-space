/**
 * Utilitários para cálculo de eventos específicos do ciclo lunar
 * Ex: primeiro dia (Lua Nova), metade do ciclo (Lua Cheia), 3º dia da Minguante, etc.
 */

import { getLunarPhaseAndSign } from './astro';

export type MoonPhaseType = 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';
export type MoonPhaseLabel = 'Lua Nova' | 'Lua Crescente' | 'Lua Cheia' | 'Lua Minguante';

const SYNODIC_MONTH = 29.53058867;
const PHASE_RANGES = {
  luaNova: { start: 0, end: 1.5, label: 'Lua Nova' },
  luaCrescente: { start: 1.5, end: 14.765, label: 'Lua Crescente' },
  luaCheia: { start: 14.765, end: 15.765, label: 'Lua Cheia' },
  luaMinguante: { start: 15.765, end: SYNODIC_MONTH, label: 'Lua Minguante' },
};

export interface CycleEvent {
  date: Date;
  dateStr: string;
  dayOfCycle: number;
  phase: MoonPhaseType;
  phaseLabel: MoonPhaseLabel;
  sign: string;
  age: number;
  description: string;
}

/**
 * Encontra a Lua Nova mais próxima de uma data (para trás ou para frente)
 */
export function findNearestNewMoon(date: Date, direction: 'before' | 'after' | 'nearest' = 'nearest'): Date {
  const { age } = getLunarPhaseAndSign(date);
  let daysToNewMoon = 0;

  if (direction === 'after') {
    daysToNewMoon = age === 0 ? SYNODIC_MONTH : SYNODIC_MONTH - age;
  } else if (direction === 'before') {
    daysToNewMoon = -age;
  } else {
    // nearest
    const afterDays = SYNODIC_MONTH - age;
    daysToNewMoon = afterDays < age ? afterDays : -age;
  }

  const result = new Date(date);
  result.setDate(result.getDate() + daysToNewMoon);
  return result;
}

/**
 * Encontra o ponto específico de um evento no ciclo lunar
 * Ex: primeiro dia (0), metade (14.76), último dia (29.53)
 */
export function findCycleDay(
  newMoonDate: Date,
  dayInCycle: number // 0-29.53
): CycleEvent {
  if (dayInCycle < 0 || dayInCycle > SYNODIC_MONTH) {
    throw new Error(`dayInCycle deve estar entre 0 e ${SYNODIC_MONTH.toFixed(2)}`);
  }

  const eventDate = new Date(newMoonDate);
  eventDate.setDate(eventDate.getDate() + dayInCycle);

  const { faseLua, signo, age } = getLunarPhaseAndSign(eventDate);
  
  // Normalizar fase
  let phase: MoonPhaseType = 'luaNova';
  if (age < 1.5 || age > SYNODIC_MONTH - 1.5) phase = 'luaNova';
  else if (age < SYNODIC_MONTH / 2 - 1.2) phase = 'luaCrescente';
  else if (age < SYNODIC_MONTH / 2 + 1.2) phase = 'luaCheia';
  else phase = 'luaMinguante';

  const phaseLabel = PHASE_RANGES[phase].label as MoonPhaseLabel;
  const dateStr = eventDate.toISOString().split('T')[0];

  return {
    date: eventDate,
    dateStr,
    dayOfCycle: dayInCycle,
    phase,
    phaseLabel,
    sign: signo,
    age,
    description: `${phaseLabel} em ${signo}`,
  };
}

/**
 * Encontra um dia específico dentro de uma fase
 * Ex: 3º dia da Minguante
 */
export function findPhaseDay(
  newMoonDate: Date,
  phase: MoonPhaseType,
  dayInPhase: number // 1, 2, 3, etc.
): CycleEvent {
  const range = PHASE_RANGES[phase];
  const phaseDuration = range.end - range.start;

  if (dayInPhase < 1 || dayInPhase > Math.ceil(phaseDuration)) {
    throw new Error(`dayInPhase deve estar entre 1 e ${Math.ceil(phaseDuration)}`);
  }

  const dayInCycle = range.start + (dayInPhase - 1);
  return findCycleDay(newMoonDate, dayInCycle);
}

/**
 * Retorna todos os marcos principais do ciclo lunar
 */
export function getCycleKeyDates(newMoonDate: Date) {
  return {
    firstDay: findCycleDay(newMoonDate, 0),
    quarterGrowth: findCycleDay(newMoonDate, SYNODIC_MONTH / 4),
    fullMoon: findCycleDay(newMoonDate, SYNODIC_MONTH / 2),
    quarterDark: findCycleDay(newMoonDate, (3 * SYNODIC_MONTH) / 4),
    lastDay: findCycleDay(newMoonDate, SYNODIC_MONTH - 0.1),
  };
}

/**
 * Gera um calendário do ciclo lunar completo em um mês/ano
 */
export function generateMoonCycleCalendar(year: number, month: number) {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  // Encontra a Lua Nova anterior ou no mês
  const cycleStart = findNearestNewMoon(monthStart, 'before');

  const calendar: CycleEvent[] = [];
  const currentDay = new Date(cycleStart);

  // Gera até 2 ciclos para cobrir o mês inteiro
  for (let i = 0; i < SYNODIC_MONTH * 2; i++) {
    if (currentDay > monthEnd) break;
    if (currentDay >= monthStart) {
      const event = findCycleDay(cycleStart, i);
      calendar.push(event);
    }
    currentDay.setDate(currentDay.getDate() + 1);
  }

  return calendar;
}

/**
 * Formata informação de ciclo lunar para exibição
 */
export function formatCycleEvent(event: CycleEvent): string {
  return `${event.dateStr} • ${event.phaseLabel} em ${event.sign} (dia ${Math.ceil(event.age)}/29)`;
}

/**
 * Obtém resumo dos dias principais do ciclo
 */
export function getCycleSummary(newMoonDate: Date) {
  const keyDates = getCycleKeyDates(newMoonDate);
  
  return {
    cicloInicia: formatCycleEvent(keyDates.firstDay),
    meioCrescente: formatCycleEvent(keyDates.quarterGrowth),
    luaCheia: formatCycleEvent(keyDates.fullMoon),
    meioMinguante: formatCycleEvent(keyDates.quarterDark),
    proximaCiclo: formatCycleEvent(keyDates.lastDay),
  };
}

/**
 * Exemplo de uso:
 * 
 * const newMoon = new Date('2025-12-19');
 * 
 * // Dia específico do ciclo
 * const day8 = findCycleDay(newMoon, 8); // 8º dia = Crescente
 * console.warn(day8.description); // "Lua Crescente em Áries"
 * 
 * // 3º dia da Minguante
 * const day3Minguante = findPhaseDay(newMoon, 'luaMinguante', 3);
 * 
 * // Todos os marcos
 * const keyDates = getCycleKeyDates(newMoon);
 * console.warn(keyDates.fullMoon.description);
 * 
 * // Calendário completo do mês
 * const calendar = generateMoonCycleCalendar(2025, 12);
 * calendar.forEach(event => console.warn(formatCycleEvent(event)));
 */
