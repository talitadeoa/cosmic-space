export const ISLAND_IDS = [
  'terra',
  'agua',
  'ar',
  'fogo',
  'eter',
  'corpo',
  'mente',
  'espírito',
  'coração',
] as const;

export const TODO_STATUS_FILTERS = ['all', 'completed', 'open'] as const;
export const INPUT_TYPE_FILTERS = ['all', 'text', 'checkbox'] as const;

export const ISLAND_NAMES: Record<string, string> = {
  terra: 'Terra',
  agua: 'Água',
  ar: 'Ar',
  fogo: 'Fogo',
  eter: 'Éter',
  corpo: 'Corpo',
  mente: 'Mente',
  espírito: 'Espírito',
  coração: 'Coração',
};

export const TODO_STORAGE_KEY = 'flua_todos_salvos';
