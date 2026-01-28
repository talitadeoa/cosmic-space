'use client';

/**
 * Tipos e constantes para as ilhas (áreas de tarefas).
 */

export type IslandId =
  | 'ilha1'
  | 'ilha2'
  | 'ilha3'
  | 'ilha4'
  | 'ilha5'
  | 'ilha6'
  | 'ilha7'
  | 'ilha8'
  | 'ilha9'
  | 'ilha10';

export type IslandNames = Record<IslandId, string>;

export const ISLAND_IDS: IslandId[] = [
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
];

export const MAX_ISLANDS = ISLAND_IDS.length;

export const DEFAULT_ISLAND_NAMES: IslandNames = {
  ilha1: 'Ilha 1',
  ilha2: 'Ilha 2',
  ilha3: 'Ilha 3',
  ilha4: 'Ilha 4',
  ilha5: 'Ilha 5',
  ilha6: 'Ilha 6',
  ilha7: 'Ilha 7',
  ilha8: 'Ilha 8',
  ilha9: 'Ilha 9',
  ilha10: 'Ilha 10',
};
