/**
 * 🌙 Tipos e Constantes Centralizadas de Fases Lunares
 * @module domains/lunar-cycle/types/moon
 *
 * Single source of truth para todas as definições relacionadas a fases lunares
 * em todo o projeto. Evita duplicação e garante consistência de tipos.
 */

/**
 * Tipos de fases lunares suportadas
 */
export type MoonPhase = 'luaNova' | 'luaCrescente' | 'luaCheia' | 'luaMinguante';

/**
 * Array ordenado de fases lunares
 */
export const MOON_PHASES: readonly MoonPhase[] = [
  'luaNova',
  'luaCrescente',
  'luaCheia',
  'luaMinguante',
] as const;

/**
 * Labels descritivos para cada fase lunar
 */
export const MOON_PHASE_LABELS: Record<MoonPhase, string> = {
  luaNova: 'Lua Nova',
  luaCrescente: 'Lua Crescente',
  luaCheia: 'Lua Cheia',
  luaMinguante: 'Lua Minguante',
} as const;

/**
 * Emojis para representar cada fase lunar
 */
export const MOON_PHASE_EMOJIS: Record<MoonPhase, string> = {
  luaNova: '🌑',
  luaCrescente: '🌒',
  luaCheia: '🌕',
  luaMinguante: '🌘',
} as const;

/**
 * Labels com emojis para cada fase lunar
 */
export const MOON_PHASE_EMOJI_LABELS: Record<MoonPhase, string> = {
  luaNova: '🌑 Lua Nova',
  luaCrescente: '🌓 Lua Crescente',
  luaCheia: '🌕 Lua Cheia',
  luaMinguante: '🌗 Lua Minguante',
} as const;

/**
 * Tipos de vibrações/energias para cada fase
 */
export const MOON_PHASE_VIBES: Record<MoonPhase, string[]> = {
  luaNova: ['Ideias', 'Intenções', 'Sementes'],
  luaCrescente: ['Checklists', 'Rituais', 'tarefas', 'Planejamento', 'Ação'],
  luaCheia: ['Tesouros', 'Recompensas', 'Frutos', 'Colheita'],
  luaMinguante: ['Reflexão', 'Liberação', 'Encerramento', 'Descanso'],
} as const;

/**
 * Validador de tipo para MoonPhase
 * @param phase - Valor desconhecido a validar
 * @returns true se é uma MoonPhase válida
 */
export const isMoonPhase = (phase: unknown): phase is MoonPhase => {
  return ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'].includes(phase as string);
};
