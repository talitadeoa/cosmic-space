/**
 * Modal/Popover para selecionar o ciclo da fase lunar
 * Aparece ao arrastar um salvo para uma fase ou ao editar
 * 
 * Opções:
 * 1. Lua Atual (mês atual)
 * 2. Próximo Ciclo (próximo mês)
 * 3. Sem Prazo (apenas a fase, sem data)
 */

'use client';

import React, { useState } from 'react';
import type { PhaseCycleType } from '@/types/todo';
import { getPhaseCycleLabel } from '@/lib/phase-cycle-utils';

interface PhaseCycleSelectorProps {
  /**
   * Ciclo atualmente selecionado
   */
  currentCycle?: PhaseCycleType;

  /**
   * Callback quando um ciclo é selecionado
   */
  onSelectCycle: (cycle: PhaseCycleType) => void;

  /**
   * Se deve aparecer como modal pequeno (popover) ou expandido
   */
  isCompact?: boolean;

  /**
   * Classe CSS adicional
   */
  className?: string;

  /**
   * Label/título para exibição
   */
  title?: string;

  /**
   * Descrição adicional
   */
  description?: string;
}

/**
 * Componente para selecionar ciclo de fase lunar
 */
export const PhaseCycleSelector: React.FC<PhaseCycleSelectorProps> = ({
  currentCycle = null,
  onSelectCycle,
  isCompact = false,
  className = '',
  title = 'Quando aplicar esta fase?',
  description,
}) => {
  const cycles: Array<{ value: PhaseCycleType; label: string; description: string; emoji: string }> = [
    {
      value: 'current',
      label: 'Lua Atual',
      description: 'Aplicar neste mês',
      emoji: '🌙',
    },
    {
      value: 'next',
      label: 'Próximo Ciclo',
      description: 'Aplicar no próximo mês',
      emoji: '🌛',
    },
    {
      value: null,
      label: 'Sem Prazo',
      description: 'Apenas a fase, sem data definida',
      emoji: '✨',
    },
  ];

  if (isCompact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {cycles.map((cycle) => (
          <button
            key={cycle.value ?? 'none'}
            onClick={() => onSelectCycle(cycle.value)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium
              transition-all duration-200
              ${
                currentCycle === cycle.value
                  ? 'bg-indigo-500/30 border border-indigo-400 text-indigo-100'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700/50'
              }
            `}
            title={cycle.description}
          >
            <span className="mr-1">{cycle.emoji}</span>
            {cycle.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4
        ${className}
      `}
    >
      <div>
        <h3 className="font-semibold text-slate-100">{title}</h3>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>

      <div className="space-y-2">
        {cycles.map((cycle) => (
          <button
            key={cycle.value ?? 'none'}
            onClick={() => onSelectCycle(cycle.value)}
            className={`
              w-full px-4 py-3 rounded-lg text-left
              border transition-all duration-200
              ${
                currentCycle === cycle.value
                  ? 'bg-indigo-500/30 border-indigo-400 text-indigo-100 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:border-slate-600'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{cycle.emoji}</span>
              <div className="flex-1">
                <p className="font-medium">{cycle.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{cycle.description}</p>
              </div>
              {currentCycle === cycle.value && (
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Popover modal para seleção rápida de ciclo
 * Aparece ao lado do cursor ou em uma posição fixa
 */
export const PhaseCycleSelectorPopover: React.FC<
  PhaseCycleSelectorProps & {
    isOpen?: boolean;
    onClose?: () => void;
    position?: 'cursor' | 'center' | 'top-right';
  }
> = ({
  currentCycle,
  onSelectCycle,
  isOpen = true,
  onClose,
  position = 'center',
  ...props
}) => {
  const handleSelectCycle = (cycle: PhaseCycleType) => {
    onSelectCycle(cycle);
    onClose?.();
  };

  if (!isOpen) return null;

  const positionClasses = {
    center: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    cursor: 'fixed z-50', // Seria posicionado via JavaScript
  };

  return (
    <div className={positionClasses[position]}>
      <div className="shadow-2xl rounded-xl">
        <PhaseCycleSelector
          currentCycle={currentCycle}
          onSelectCycle={handleSelectCycle}
          isCompact={false}
          {...props}
        />
      </div>

      {/* Overlay para fechar ao clicar fora */}
      {position !== 'cursor' && (
        <div
          className="fixed inset-0 -z-10"
          onClick={onClose}
          aria-label="Fechar seletor de ciclo"
        />
      )}
    </div>
  );
};

/**
 * Hook para gerenciar estado do seletor
 */
export function usePhaseCycleSelector(initialCycle?: PhaseCycleType) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<PhaseCycleType>(initialCycle ?? null);

  const handleSelectCycle = (cycle: PhaseCycleType) => {
    setSelectedCycle(cycle);
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    selectedCycle,
    setSelectedCycle,
    handleSelectCycle,
    cycleLabel: getPhaseCycleLabel(selectedCycle),
  };
}
