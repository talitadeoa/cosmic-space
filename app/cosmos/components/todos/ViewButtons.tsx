/**
 * Componente para exibir botões de filtro por view
 */
'use client';

import React from 'react';
import type { MoonPhase } from '../utils/todoStorage';
import { phaseLabels } from '../utils/todoStorage';

interface ViewButtonsProps {
  view: string | undefined;
  selectedPhase: MoonPhase | null | undefined;
  activeViewDrop: string | null;
  onViewChange: (view: string) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDropOnView: (view: 'em-aberto' | 'lua-atual' | 'proxima-fase' | 'proximo-ciclo') => (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDragEnter: (view: string) => void;
}

const getMoonEmoji = (phase: MoonPhase | null): string => {
  switch (phase) {
    case 'luaNova':
      return '🌑';
    case 'luaCrescente':
      return '🌓';
    case 'luaCheia':
      return '🌕';
    case 'luaMinguante':
      return '🌗';
    default:
      return '';
  }
};

const getNextPhase = (phase: MoonPhase): MoonPhase => {
  const phases: MoonPhase[] = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante'];
  const currentIndex = phases.indexOf(phase);
  const nextIndex = (currentIndex + 1) % phases.length;
  return phases[nextIndex];
};

export function ViewButtons({
  view,
  selectedPhase,
  activeViewDrop,
  onViewChange,
  onDragOver,
  onDropOnView,
  onDragLeave,
  onDragEnter,
}: ViewButtonsProps) {
  const views: Array<{
    id: string;
    label: string;
    color: 'slate' | 'indigo' | 'amber' | 'rose';
    icon?: string;
  }> = [
    { id: 'todos', label: 'Todos', color: 'slate' },
    { id: 'em-aberto', label: 'Em aberto', color: 'indigo' },
    { id: 'lua-atual', label: 'Lua atual', color: 'indigo' },
    {
      id: 'proxima-fase',
      label: 'Próxima fase',
      color: 'amber',
      icon: selectedPhase ? getMoonEmoji(getNextPhase(selectedPhase)) : '🌙',
    },
    { id: 'proximo-ciclo', label: 'Próximo ciclo', color: 'rose', icon: '📅' },
  ];

  const getColorClasses = (color: string, active: boolean) => {
    const baseActive = 'border-{color}-300/80 bg-{color}-500/20 text-{color}-100';
    const baseInactive = 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-{color}-400/60';
    const ringActive = activeViewDrop ? `ring-2 ring-{color}-400 ring-offset-2 ring-offset-slate-950` : '';

    const template = active ? baseActive : baseInactive;
    return `${template} ${ringActive}`.replace(/{color}/g, color);
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {views.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onViewChange(v.id)}
          onDragOver={onDragOver}
          onDrop={onDropOnView(v.id as any)}
          onDragLeave={onDragLeave}
          onDragEnter={() => onDragEnter(v.id)}
          className={`rounded-lg px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] transition flex items-center gap-1.5 ${getColorClasses(
            v.color,
            view === v.id
          )}`}
          title={
            v.id === 'proxima-fase' && selectedPhase
              ? `Próxima fase: ${phaseLabels[getNextPhase(selectedPhase)]}`
              : undefined
          }
        >
          {v.icon && <span className="text-sm">{v.icon}</span>}
          <span>{v.label}</span>
        </button>
      ))}
    </div>
  );
}
