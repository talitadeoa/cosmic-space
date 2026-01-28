import type { MoonPhase } from './moonPhases';

export const PHASE_VIBES: Record<MoonPhase, { label: string; tags: string[] }> = {
  luaNova: {
    label: 'Ideias · Intenções · Sementes',
    tags: ['Ideias', 'Intenções', 'Sementes'],
  },
  luaCrescente: {
    label: 'Checklists · Rituais · tarefas · Planejamento · Ação',
    tags: ['Checklists', 'Rituais', 'tarefas', 'Planejamento', 'Ação'],
  },
  luaCheia: {
    label: 'Tesouros · Recompensas · Frutos · Colheita',
    tags: ['Tesouros', 'Recompensas', 'Frutos', 'Colheita'],
  },
  luaMinguante: {
    label: 'Aprendizados · Desapegos',
    tags: ['Aprendizados', 'Desapegos'],
  },
};
