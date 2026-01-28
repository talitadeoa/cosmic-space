/**
 * Diálogo que aparece quando um usuário arrasta um salvo para uma fase lunar
 * Permite selecionar o ciclo da fase (atual, próximo, ou sem prazo)
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { SavedTodo, MoonPhase, PhaseCycleType } from '@/types/todo';
import { PhaseCycleSelector } from './PhaseCycleSelector';
import { setTodoPhaseCycle } from '@/lib/phase-cycle-utils';

interface PhaseAssignmentDialogProps {
  /**
   * Tarefa sendo atribuída
   */
  todo: SavedTodo | null;

  /**
   * Fase lunar selecionada
   */
  phase: MoonPhase | null;

  /**
   * Callback quando a atribuição é confirmada
   */
  onConfirm: (todo: SavedTodo, phase: MoonPhase, cycle: PhaseCycleType) => void;

  /**
   * Callback para cancelar
   */
  onCancel: () => void;

  /**
   * Se o diálogo está aberto
   */
  isOpen?: boolean;

  /**
   * Posição do mouse/touch para popover
   */
  cursorPosition?: { x: number; y: number };
}

/**
 * Diálogo para atribuição de fase com seleção de ciclo
 */
export const PhaseAssignmentDialog: React.FC<PhaseAssignmentDialogProps> = ({
  todo,
  phase,
  onConfirm,
  onCancel,
  isOpen = false,
  cursorPosition,
}) => {
  const [selectedCycle, setSelectedCycle] = useState<PhaseCycleType>(
    todo?.phaseCycle ?? null
  );

  // Atualizar quando a tarefa muda
  useEffect(() => {
    if (todo) {
      setSelectedCycle(todo.phaseCycle ?? null);
    }
  }, [todo]);

  const handleConfirm = () => {
    if (!todo || !phase) return;
    const updatedTodo = setTodoPhaseCycle(todo, selectedCycle);
    updatedTodo.phase = phase;
    onConfirm(updatedTodo, phase, selectedCycle);
  };

  if (!isOpen || !todo || !phase) return null;

  const moonPhaseEmojis: Record<MoonPhase, string> = {
    luaNova: '🌑',
    luaCrescente: '🌓',
    luaCheia: '🌕',
    luaMinguante: '🌗',
  };

  const moonPhaseNames: Record<MoonPhase, string> = {
    luaNova: 'Lua Nova',
    luaCrescente: 'Lua Crescente',
    luaCheia: 'Lua Cheia',
    luaMinguante: 'Lua Minguante',
  };

  const containerClasses = cursorPosition
    ? `fixed z-50 top-[${cursorPosition.y}px] left-[${cursorPosition.x}px]`
    : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50';

  return (
    <>
      {/* Overlay para fechar */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCancel}
        aria-label="Fechar diálogo de atribuição de fase"
      />

      {/* Diálogo */}
      <div className={containerClasses}>
        <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-6 max-w-sm w-full">
          {/* Cabeçalho */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{moonPhaseEmojis[phase]}</span>
              <div>
                <h2 className="font-bold text-lg text-slate-100">
                  Atribuir {moonPhaseNames[phase]}
                </h2>
                <p className="text-sm text-slate-400">{todo.text}</p>
              </div>
            </div>
          </div>

          {/* Seletor de Ciclo */}
          <PhaseCycleSelector
            currentCycle={selectedCycle}
            onSelectCycle={setSelectedCycle}
            isCompact={false}
            title="Quando aplicar esta fase?"
            description="Escolha se será neste mês, no próximo ou apenas a fase sem data"
          />

          {/* Botões de Ação */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Hook para gerenciar o diálogo de atribuição de fase
 */
export function usePhaseAssignmentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [todo, setTodo] = useState<SavedTodo | null>(null);
  const [phase, setPhase] = useState<MoonPhase | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | undefined>();

  const openDialog = (
    targetTodo: SavedTodo,
    targetPhase: MoonPhase,
    position?: { x: number; y: number }
  ) => {
    setTodo(targetTodo);
    setPhase(targetPhase);
    setCursorPosition(position);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTodo(null);
    setPhase(null);
    setCursorPosition(undefined);
  };

  return {
    isOpen,
    todo,
    phase,
    cursorPosition,
    openDialog,
    closeDialog,
  };
}
