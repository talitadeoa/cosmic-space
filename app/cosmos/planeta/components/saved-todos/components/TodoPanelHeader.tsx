'use client';

import React from 'react';
import type { MoonPhase } from '@/types/todo';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';

interface TodoPanelHeaderProps {
  view: string;
  selectedPhase: MoonPhase | null | undefined;
  islandLabel: string | null;
}

const MOON_EMOJIS: Record<MoonPhase, string> = {
  luaNova: '🌑',
  luaCrescente: '🌓',
  luaCheia: '🌕',
  luaMinguante: '🌗',
};

function buildHeaderLabel(
  view: string,
  selectedPhase: MoonPhase | null | undefined,
  islandLabel: string | null
): string {
  const prefix = view === 'todos' ? 'todos' : 'salvos';

  if (selectedPhase && islandLabel) {
    return `${prefix} - ${phaseLabels[selectedPhase]} • ${islandLabel}`;
  }
  if (selectedPhase) {
    return `${prefix} - ${phaseLabels[selectedPhase]}`;
  }
  if (islandLabel) {
    return `${prefix} - ${islandLabel}`;
  }
  return prefix;
}

function buildHeaderDescription(
  view: string,
  selectedPhase: MoonPhase | null | undefined,
  islandLabel: string | null
): string {
  const prefix = view === 'todos' ? 'todos' : 'salvos';

  if (selectedPhase && islandLabel) {
    return `${prefix} associados à fase ${phaseLabels[selectedPhase]} na ${islandLabel}.`;
  }
  if (selectedPhase) {
    return `${prefix} associados à fase: ${phaseLabels[selectedPhase]}`;
  }
  if (islandLabel) {
    return `${prefix} associados à ${islandLabel}.`;
  }

  return view === 'todos'
    ? 'Todas as tarefas salvas.'
    : 'Adicione e arraste para a fase lunar desejada.';
}

/**
 * Header do painel de tarefas com título e descrição
 */
export function TodoPanelHeader({ view, selectedPhase, islandLabel }: TodoPanelHeaderProps) {
  const headerLabel = buildHeaderLabel(view, selectedPhase, islandLabel);
  const headerDescription = buildHeaderDescription(view, selectedPhase, islandLabel);

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
          {headerLabel}
        </p>
        {selectedPhase && (
          <span className="text-lg" title={phaseLabels[selectedPhase]}>
            {MOON_EMOJIS[selectedPhase]}
          </span>
        )}
      </div>
      <p className="text-[0.75rem] text-slate-400">{headerDescription}</p>
    </div>
  );
}
