/**
 * Utilitários para cálculo de eventos específicos do ciclo lunar
 * DEPRECADO: Use useLunarPhaseUSNO hook ou usno-client diretamente
 * @module domains/lunar-cycle/services/lunar-cycle-utils
 */

import type { LunarPhase } from '@/lib/usno-client';

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
 * DEPRECADO: Use lunarComputeClient.getLunarPhase() para melhor precisão
 */
export async function findNearestNewMoon(
  date: Date,
  direction: 'before' | 'after' | 'nearest' = 'nearest',
  phaseData?: LunarPhase
): Promise<Date> {
  // Se não houver dados de fase, usar valor aproximado
  const ageDays = phaseData?.age_days ?? 0;
  let daysToNewMoon = 0;

  if (direction === 'after') {
    daysToNewMoon = ageDays === 0 ? SYNODIC_MONTH : SYNODIC_MONTH - ageDays;
  } else if (direction === 'before') {
    daysToNewMoon = -ageDays;
  } else {
    // nearest
    const afterDays = SYNODIC_MONTH - ageDays;
    daysToNewMoon = afterDays < ageDays ? afterDays : -ageDays;
  }

  const result = new Date(date);
  result.setDate(result.getDate() + daysToNewMoon);
  return result;
}

/**
 * Encontra o ponto específico de um evento no ciclo lunar
 * DEPRECADO: Esta função usa aproximações. Use lunarComputeClient.getLunarPhase() para precisão.
 * Ex: primeiro dia (0), metade (14.76), último dia (29.53)
 */
export async function findCycleDay(
  newMoonDate: Date,
  dayInCycle: number // 0-29.53
): Promise<CycleEvent> {
  if (dayInCycle < 0 || dayInCycle > SYNODIC_MONTH) {
    throw new Error(`dayInCycle deve estar entre 0 e ${SYNODIC_MONTH.toFixed(2)}`);
  }

  const eventDate = new Date(newMoonDate);
  eventDate.setDate(eventDate.getDate() + dayInCycle);

  // Para melhor precisão, deveria usar: await lunarComputeClient.getLunarPhase(eventDate)
  // Por enquanto, usando valores aproximados
  const faseLua = 'Aproximada';
  const signo = 'Não disponível';
  const age = dayInCycle;

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
  // DEPRECATED: Retorna placeholder - usar lunarComputeClient.getLunarPhase() 
  return {
    date: newMoonDate,
    dateStr: newMoonDate.toISOString().split('T')[0],
    dayOfCycle: dayInCycle,
    phase,
    phaseLabel: PHASE_RANGES[phase].label as any,
    sign: 'N/A',
    age: dayInCycle,
    description: `Dia ${dayInPhase} de ${PHASE_RANGES[phase].label}`,
  };
}

/**
 * Retorna todos os marcos principais do ciclo lunar
 */
export function getCycleKeyDates(newMoonDate: Date) {
  // DEPRECATED: Retorna placeholders - usar API Python
  const createEvent = (dayNum: number, phase: MoonPhaseType, label: MoonPhaseLabel): CycleEvent => ({
    date: new Date(newMoonDate.getTime() + dayNum * 24 * 60 * 60 * 1000),
    dateStr: new Date(newMoonDate.getTime() + dayNum * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dayOfCycle: dayNum,
    phase,
    phaseLabel: label,
    sign: 'N/A',
    age: dayNum,
    description: `Dia ${dayNum} - ${label}`,
  });

  return {
    firstDay: createEvent(0, 'luaNova', 'Lua Nova'),
    quarterGrowth: createEvent(Math.round(SYNODIC_MONTH / 4), 'luaCrescente', 'Lua Crescente'),
    fullMoon: createEvent(Math.round(SYNODIC_MONTH / 2), 'luaCheia', 'Lua Cheia'),
    quarterDark: createEvent(Math.round((3 * SYNODIC_MONTH) / 4), 'luaMinguante', 'Lua Minguante'),
    lastDay: createEvent(Math.round(SYNODIC_MONTH - 0.1), 'luaNova', 'Lua Nova'),
  };
}

/**
 * Gera um calendário do ciclo lunar completo em um mês/ano
 * DEPRECATED: Use API Python para melhor precisão
 */
export function generateMoonCycleCalendar(year: number, month: number) {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const calendar: CycleEvent[] = [];
  
  // Gera eventos simplificados para cada dia do mês
  for (let day = 1; day <= monthEnd.getDate(); day++) {
    const date = new Date(year, month - 1, day);
    const dayOfMonth = Math.floor((date.getDate() - 1) % SYNODIC_MONTH);
    
    calendar.push({
      date,
      dateStr: date.toISOString().split('T')[0],
      dayOfCycle: dayOfMonth,
      phase: 'luaNova', // Placeholder
      phaseLabel: 'Lua Nova',
      sign: 'N/A',
      age: dayOfMonth,
      description: `Dia ${day} do mês`,
    });
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
