import type { MoonPhase } from './moonPhases';

export const PHASE_VIBES: Record<MoonPhase, { label: string; tags: string[] }> = {
  luaNova: {
    label: 'Ideias · Intenções · Sementes',
    tags: ['Ideias', 'Intenções', 'Sementes'],
  },
  luaCrescente: {
    label: 'Checklists · Rituais · To-dos · Planejamento · Ação',
    tags: ['Checklists', 'Rituais', 'To-dos', 'Planejamento', 'Ação'],
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
