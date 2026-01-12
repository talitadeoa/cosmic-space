/**
 * Constantes do domínio lunar-cycle
 * @module domains/lunar-cycle/constants
 */

// Re-export das constantes de tipos de lua
export {
  MOON_PHASES,
  MOON_PHASE_LABELS,
  MOON_PHASE_EMOJIS,
  MOON_PHASE_EMOJI_LABELS,
  MOON_PHASE_VIBES,
} from './types/moon';

// Constantes do mês sinódico
export const SYNODIC_MONTH = 29.53058867;

// Duração de cada fase em dias
export const PHASE_DURATIONS = {
  luaNova: 1.5,
  luaCrescente: 13.265,
  luaCheia: 1,
  luaMinguante: 13.765,
} as const;
