'use client';

import React, { useCallback } from 'react';
import { MOON_PHASE_LABELS, MOON_PHASE_EMOJI_LABELS, MOON_PHASES } from '@/app/cosmos/utils/moonPhases';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';

interface MoonPhasesRailProps {
  /**
   * Fase lunar atualmente selecionada
   */
  selectedPhase: MoonPhase | null;

  /**
   * Callback ao selecionar uma fase
   */
  onSelectPhase: (phase: MoonPhase | null) => void;

  /**
   * Mapa de contagem de tarefas por fase
   */
  phaseCounts?: Record<MoonPhase, number>;

  /**
   * Classes CSS customizadas para o container
   */
  containerClassName?: string;

  /**
   * Classes CSS customizadas para botão ativo
   */
  activeButtonClassName?: string;

  /**
   * Classes CSS customizadas para botão inativo
   */
  inactiveButtonClassName?: string;

  /**
   * Orientation: 'vertical' para coluna, 'horizontal' para faixa
   */
  orientation?: 'vertical' | 'horizontal';
}

/**
 * MoonPhasesRail Component
 *
 * Exibe as 4 fases lunares em uma coluna (desktop) ou faixa (mobile).
 * Acessível: navegação por teclado, aria-labels, focus ring.
 * Fase selecionada destacada visualmente.
 */
export const MoonPhasesRail: React.FC<MoonPhasesRailProps> = ({
  selectedPhase,
  onSelectPhase,
  phaseCounts = {},
  containerClassName = '',
  activeButtonClassName = 'border-indigo-400 bg-indigo-500/30 text-indigo-100 shadow-lg shadow-indigo-500/30 scale-105',
  inactiveButtonClassName = 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-indigo-400/50',
  orientation = 'vertical',
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, phase: MoonPhase) => {
      const currentIndex = MOON_PHASES.indexOf(selectedPhase || MOON_PHASES[0]);
      const phaseIndex = MOON_PHASES.indexOf(phase);

      let nextIndex = phaseIndex;

      switch (e.key) {
        case orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown':
          e.preventDefault();
          nextIndex = (phaseIndex + 1) % MOON_PHASES.length;
          break;
        case orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp':
          e.preventDefault();
          nextIndex = (phaseIndex - 1 + MOON_PHASES.length) % MOON_PHASES.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = MOON_PHASES.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelectPhase(selectedPhase === phase ? null : phase);
          return;
        default:
          return;
      }

      onSelectPhase(MOON_PHASES[nextIndex]);
      setTimeout(() => {
        document.getElementById(`moon-phase-${MOON_PHASES[nextIndex]}`)?.focus();
      }, 0);
    },
    [selectedPhase, onSelectPhase, orientation]
  );

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4 ${
        orientation === 'horizontal' ? 'lg:flex-row' : ''
      } ${containerClassName}`}
      role="group"
      aria-label="Select a moon phase to filter or highlight tasks"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
        Fases lunares
      </p>

      <div className={`flex flex-col gap-2 ${orientation === 'horizontal' ? 'sm:flex-row' : ''}`}>
        {MOON_PHASES.map((phase) => {
          const isSelected = selectedPhase === phase;
          const count = phaseCounts[phase] ?? 0;

          return (
            <button
              key={phase}
              id={`moon-phase-${phase}`}
              type="button"
              onClick={() => onSelectPhase(isSelected ? null : phase)}
              onKeyDown={(e) => handleKeyDown(e, phase)}
              aria-pressed={isSelected}
              aria-label={`${MOON_PHASE_LABELS[phase]}${count > 0 ? `, ${count} task${count > 1 ? 's' : ''}` : ''}`}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg border px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected ? activeButtonClassName : inactiveButtonClassName
              }`}
            >
              <span className="text-2xl sm:text-3xl">
                {MOON_PHASE_EMOJI_LABELS[phase].split(' ')[0]}
              </span>
              <span className="text-xs font-semibold sm:text-sm">{MOON_PHASE_LABELS[phase]}</span>

              {count > 0 && (
                <span className="mt-1 inline-flex items-center justify-center rounded-full bg-indigo-600 px-2 py-1 text-[0.6rem] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedPhase && (
        <button
          type="button"
          onClick={() => onSelectPhase(null)}
          className="mt-2 rounded-lg border border-dashed border-slate-600 bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-slate-500 hover:text-slate-300"
          aria-label="Clear phase selection"
        >
          Limpar seleção
        </button>
      )}
    </div>
  );
};

export default MoonPhasesRail;
