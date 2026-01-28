/**
 * ✔️ Validadores Centralizados
 *
 * Single source of truth para validação de tipos em toda aplicação
 * Evita duplicação de lógica de validação
 */

import type { MoonPhase } from '@/types/moon';
import type { IslandId } from '@/lib/islands';
import type { TodoInputType, PhaseInputType, FormEntryType } from '@/types/inputs';

/**
 * Validador para MoonPhase
 * @param phase - Valor desconhecido
 * @returns true se é uma MoonPhase válida
 */
export const isMoonPhase = (phase: unknown): phase is MoonPhase => {
  return ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'].includes(phase as string);
};

/**
 * Validador para IslandId
 * @param island - Valor desconhecido
 * @returns true se é um IslandId válido
 */
export const isIslandId = (island: unknown): island is IslandId => {
  return [
    'ilha1',
    'ilha2',
    'ilha3',
    'ilha4',
    'ilha5',
    'ilha6',
    'ilha7',
    'ilha8',
    'ilha9',
    'ilha10',
  ].includes(island as string);
};

/**
 * Validador para TodoInputType
 * @param inputType - Valor desconhecido
 * @returns true se é um TodoInputType válido
 */
export const isTodoInputType = (inputType: unknown): inputType is TodoInputType => {
  return ['text', 'checkbox'].includes(inputType as string);
};

/**
 * Validador para PhaseInputType
 * @param inputType - Valor desconhecido
 * @returns true se é um PhaseInputType válido
 */
export const isPhaseInputType = (inputType: unknown): inputType is PhaseInputType => {
  return ['energia', 'tarefa', 'insight_trimestral'].includes(inputType as string);
};

/**
 * Validador para FormEntryType
 * @param type - Valor desconhecido
 * @returns true se é um FormEntryType válido
 */
export const isFormEntryType = (type: unknown): type is FormEntryType => {
  return [
    'subscribe',
    'contact',
    'insight_anual',
    'insight_mensal',
    'insight_trimestral',
    'insight_lunar',
    'checklist',
  ].includes(type as string);
};

/**
 * Validadores agrupados para fácil acesso
 */
export const validators = {
  moonPhase: isMoonPhase,
  islandId: isIslandId,
  todoInputType: isTodoInputType,
  phaseInputType: isPhaseInputType,
  formEntryType: isFormEntryType,
} as const;
