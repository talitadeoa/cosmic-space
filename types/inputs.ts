/**
 * 🎯 Tipos Centralizados de Entrada
 *
 * Single source of truth para tipos de entrada do usuário em toda a aplicação
 */

/**
 * Tipos de entrada de formulário (Google Sheets)
 */
export type FormEntryType =
  | 'subscribe'
  | 'contact'
  | 'insight_anual'
  | 'insight_mensal'
  | 'insight_trimestral'
  | 'insight_lunar'
  | 'checklist';

/**
 * Tipos de entrada associados a fases lunares
 */
export type PhaseInputType = 'energia' | 'tarefa' | 'insight_trimestral';

/**
 * Tipos de entrada em checkboxes/tarefas
 */
export type TodoInputType = 'text' | 'checkbox';

/**
 * Validador para FormEntryType
 */
export const isValidFormEntry = (type: unknown): type is FormEntryType => {
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
 * Validador para PhaseInputType
 */
export const isValidPhaseInputType = (type: unknown): type is PhaseInputType => {
  return ['energia', 'tarefa', 'insight_trimestral'].includes(type as string);
};

/**
 * Validador para TodoInputType
 */
export const isValidTodoInputType = (type: unknown): type is TodoInputType => {
  return ['text', 'checkbox'].includes(type as string);
};
