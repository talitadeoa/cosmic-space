'use client';

import React from 'react';
import type { MoonPhase } from '@/types/todo';
import type { TodoView } from '@/app/cosmos/planeta/salvos/types';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';

interface ViewButtonProps {
  view: TodoView;
  currentView: TodoView;
  label: string;
  icon?: React.ReactNode;
  activeColor?: 'slate' | 'indigo' | 'amber' | 'rose';
  activeViewDrop: string | null;
  onViewChange: (view: TodoView) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  title?: string;
}

const colorClasses = {
  slate: {
    active: 'border border-slate-300/80 bg-slate-500/20 text-slate-100',
    inactive: 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-400/60',
    dropRing: 'ring-2 ring-slate-400 ring-offset-2 ring-offset-slate-950',
  },
  indigo: {
    active: 'border border-indigo-300/80 bg-indigo-500/20 text-indigo-100',
    inactive: 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60',
    dropRing: 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950',
  },
  amber: {
    active: 'border border-amber-300/80 bg-amber-500/20 text-amber-100',
    inactive: 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-amber-400/60',
    dropRing: 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950',
  },
  rose: {
    active: 'border border-rose-300/80 bg-rose-500/20 text-rose-100',
    inactive: 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:border-rose-400/60',
    dropRing: 'ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-950',
  },
};

/**
 * Botão de view individual
 */
function ViewButton({
  view,
  currentView,
  label,
  icon,
  activeColor = 'indigo',
  activeViewDrop,
  onViewChange,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  title,
}: ViewButtonProps) {
  const isActive = currentView === view;
  const isDropTarget = activeViewDrop === view;
  const colors = colorClasses[activeColor];

  return (
    <button
      type="button"
      onClick={() => onViewChange(view)}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition flex items-center gap-1.5 ${
        isDropTarget ? colors.dropRing : ''
      } ${isActive ? colors.active : colors.inactive}`}
      title={title}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}

interface TodoViewButtonsProps {
  currentView: TodoView;
  activeViewDrop: string | null;
  selectedPhase: MoonPhase | null | undefined;
  onViewChange: (view: TodoView) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (view: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo') => (e: React.DragEvent) => void;
  onDragEnter: (view: string) => () => void;
  onDragLeave: () => void;
}

const MOON_EMOJIS: Record<MoonPhase, string> = {
  luaNova: '🌑',
  luaCrescente: '🌓',
  luaCheia: '🌕',
  luaMinguante: '🌗',
};

function getNextPhase(phase: MoonPhase): MoonPhase {
  const phases: MoonPhase[] = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'];
  const currentIndex = phases.indexOf(phase);
  const nextIndex = (currentIndex + 1) % phases.length;
  return phases[nextIndex];
}

/**
 * Grupo de botões de visualização para o painel de tarefas
 */
export function TodoViewButtons({
  currentView,
  activeViewDrop,
  selectedPhase,
  onViewChange,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
}: TodoViewButtonsProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <ViewButton
        view="todos"
        currentView={currentView}
        label="Todos"
        activeColor="slate"
        activeViewDrop={activeViewDrop}
        onViewChange={onViewChange}
      />

      <ViewButton
        view="em-aberto"
        currentView={currentView}
        label="Em aberto"
        activeColor="indigo"
        activeViewDrop={activeViewDrop}
        onViewChange={onViewChange}
        onDragOver={onDragOver}
        onDrop={onDrop('em-aberto')}
        onDragEnter={onDragEnter('em-aberto')}
        onDragLeave={onDragLeave}
      />

      <ViewButton
        view="lua-atual"
        currentView={currentView}
        label="Lua atual"
        activeColor="indigo"
        activeViewDrop={activeViewDrop}
        onViewChange={onViewChange}
        onDragOver={onDragOver}
        onDrop={onDrop('lua-atual')}
        onDragEnter={onDragEnter('lua-atual')}
        onDragLeave={onDragLeave}
      />

      <ViewButton
        view="proxima-fase"
        currentView={currentView}
        label="Próxima fase"
        icon={selectedPhase ? MOON_EMOJIS[getNextPhase(selectedPhase)] : '🌙'}
        activeColor="amber"
        activeViewDrop={activeViewDrop}
        onViewChange={onViewChange}
        onDragOver={onDragOver}
        onDrop={onDrop('proxima-fase')}
        onDragEnter={onDragEnter('proxima-fase')}
        onDragLeave={onDragLeave}
        title={
          selectedPhase
            ? `Próxima fase: ${phaseLabels[getNextPhase(selectedPhase)]}`
            : 'Próxima fase lunar'
        }
      />

      <ViewButton
        view="proximo-ciclo"
        currentView={currentView}
        label="Próximo ciclo"
        icon="📅"
        activeColor="rose"
        activeViewDrop={activeViewDrop}
        onViewChange={onViewChange}
        onDragOver={onDragOver}
        onDrop={onDrop('proximo-ciclo')}
        onDragEnter={onDragEnter('proximo-ciclo')}
        onDragLeave={onDragLeave}
      />
    </div>
  );
}
