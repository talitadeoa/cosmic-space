'use client';

import React, { memo, useMemo } from 'react';
import type { SavedTodo, MoonPhase } from '@/app/cosmos/utils/todoStorage';
import { phaseLabels } from '@/app/cosmos/utils/todoStorage';
import type { IslandNames } from '@/app/cosmos/utils/islandNames';
import { TodoItem } from './TodoItem';
import { EmptyState } from '@/app/cosmos/components/EmptyState';

type PhaseKey = MoonPhase | 'sem-fase';

interface PhaseGroupedTodoListProps {
  displayedTodos: SavedTodo[];
  isEditMode: boolean;
  isSelectionMode: boolean;
  editingTodoId: string | null;
  editingText: string;
  editingCategory?: string;
  editingDueDate?: string;
  swipeDeleteId: string | null;
  selectedTodoIds: string[];
  islandNames?: IslandNames;
  expandedPhases: Record<PhaseKey, boolean>;
  onTogglePhase: (phase: PhaseKey) => void;

  // Callbacks
  onToggleComplete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onStartEdit: (todo: SavedTodo) => void;
  onUpdateEditText: (text: string) => void;
  onUpdateEditCategory: (category: string) => void;
  onUpdateEditDueDate: (dueDate: string) => void;
  onSaveEdit: (todo: SavedTodo) => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;

  // Drag/Drop
  onDragStart: (todoId: string) => (event: React.DragEvent) => void;
  onDragEnd: () => void;

  // Touch
  onTouchStart?: (todoId: string) => (event: React.TouchEvent) => void;
  onTouchEnd?: (todoId: string) => (event: React.TouchEvent) => void;
  onTouchMove?: (event: React.TouchEvent) => void;

  // Selection touch
  onSelectionTouchStart?: (todoId: string, event: React.TouchEvent) => void;
  onSelectionTouchMove?: (event: React.TouchEvent) => void;
  onSelectionTouchEnd?: () => void;

  // Meta
  emptyTitle?: string;
  emptyDescription?: string;
}

const PHASE_ORDER: PhaseKey[] = ['luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante', 'sem-fase'];

const PHASE_EMOJIS: Record<PhaseKey, string> = {
  luaNova: '🌑',
  luaCrescente: '🌓',
  luaCheia: '🌕',
  luaMinguante: '🌗',
  'sem-fase': '✨',
};

const PHASE_COLORS: Record<PhaseKey, { border: string; bg: string; text: string; glow: string }> = {
  luaNova: {
    border: 'border-slate-400/60',
    bg: 'bg-slate-500/20',
    text: 'text-slate-200',
    glow: 'shadow-slate-500/30',
  },
  luaCrescente: {
    border: 'border-emerald-400/60',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-200',
    glow: 'shadow-emerald-500/30',
  },
  luaCheia: {
    border: 'border-amber-400/60',
    bg: 'bg-amber-500/20',
    text: 'text-amber-200',
    glow: 'shadow-amber-500/30',
  },
  luaMinguante: {
    border: 'border-indigo-400/60',
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-200',
    glow: 'shadow-indigo-500/30',
  },
  'sem-fase': {
    border: 'border-slate-600/60',
    bg: 'bg-slate-700/20',
    text: 'text-slate-300',
    glow: 'shadow-slate-600/30',
  },
};

/**
 * Componente que renderiza a lista de todos agrupados por fase lunar
 */
export const PhaseGroupedTodoList = memo(function PhaseGroupedTodoList({
  displayedTodos,
  isEditMode,
  isSelectionMode,
  editingTodoId,
  editingText,
  editingCategory = '',
  editingDueDate = '',
  swipeDeleteId = null,
  selectedTodoIds,
  islandNames,
  expandedPhases,
  onTogglePhase,
  onToggleComplete,
  onToggleSelect,
  onStartEdit,
  onUpdateEditText,
  onUpdateEditCategory,
  onUpdateEditDueDate,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onSelectionTouchStart,
  onSelectionTouchMove,
  onSelectionTouchEnd,
  emptyTitle = 'Nada salvo',
  emptyDescription = 'Adicione ou selecione uma fase lunar.',
}: PhaseGroupedTodoListProps) {
  const isSaveDisabled = !editingText.trim();

  // Agrupar todos por fase
  const groupedTodos = useMemo(() => {
    const groups: Record<PhaseKey, SavedTodo[]> = {
      luaNova: [],
      luaCrescente: [],
      luaCheia: [],
      luaMinguante: [],
      'sem-fase': [],
    };

    displayedTodos.forEach((todo) => {
      const phase = (todo.phase || 'sem-fase') as keyof typeof groups;
      groups[phase].push(todo);
    });

    return groups;
  }, [displayedTodos]);

  // Verificar se há algum todo em qualquer fase
  const hasAnyTodos = displayedTodos.length > 0;

  if (!hasAnyTodos) {
    return (
      <div className="mt-3">
        <EmptyState title={emptyTitle} description={emptyDescription} icon="✨" />
      </div>
    );
  }

  return (
    <div
      className="mt-3 max-h-[60vh] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 sm:max-h-[70vh] lg:max-h-[75vh]"
      onTouchMove={onSelectionTouchMove}
      onTouchEnd={onSelectionTouchEnd}
      onTouchCancel={onSelectionTouchEnd}
    >
      {PHASE_ORDER.map((phase) => {
        const phaseTodos = groupedTodos[phase];
        const isExpanded = expandedPhases[phase];
        const colors = PHASE_COLORS[phase];
        const count = phaseTodos.length;

        // Não mostrar seção vazia
        if (count === 0) return null;

        return (
          <div
            key={phase}
            className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden transition-all duration-200`}
          >
            {/* Cabeçalho da fase clicável */}
            <button
              type="button"
              onClick={() => onTogglePhase(phase)}
              className={`w-full flex items-center justify-between px-4 py-2.5 transition hover:bg-white/5`}
              aria-expanded={isExpanded}
              aria-controls={`phase-group-${phase}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg" role="img" aria-label={phase === 'sem-fase' ? 'Sem fase' : phaseLabels[phase]}>
                  {PHASE_EMOJIS[phase]}
                </span>
                <span className={`text-sm font-semibold ${colors.text}`}>
                  {phase === 'sem-fase' ? 'Sem fase' : phaseLabels[phase]}
                </span>
                <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-medium text-slate-300">
                  {count}
                </span>
              </div>
              <span
                className={`text-slate-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`}
              >
                ▼
              </span>
            </button>

            {/* Lista de todos da fase */}
            {isExpanded && (
              <div
                id={`phase-group-${phase}`}
                className="space-y-2 px-3 pb-3"
              >
                {phaseTodos.map((todo) => {
                  const isSelected = selectedTodoIds.includes(todo.id);
                  const isEditing = editingTodoId === todo.id;

                  return (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      isSelected={isSelected}
                      isEditing={isEditing}
                      editingText={editingText}
                      editingCategory={editingCategory}
                      editingDueDate={editingDueDate}
                      isSelectionMode={isSelectionMode}
                      isEditMode={isEditMode}
                      islandNames={islandNames}
                      isSaveDisabled={isSaveDisabled}
                      swipeDeleteId={swipeDeleteId}
                      onToggleComplete={onToggleComplete}
                      onToggleSelect={onToggleSelect}
                      onStartEdit={onStartEdit}
                      onUpdateEditText={onUpdateEditText}
                      onUpdateEditCategory={onUpdateEditCategory}
                      onUpdateEditDueDate={onUpdateEditDueDate}
                      onSaveEdit={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onDelete={onDelete}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onTouchStart={onTouchStart}
                      onTouchEnd={onTouchEnd}
                      onTouchMove={onTouchMove}
                      onSelectionTouchStart={onSelectionTouchStart}
                      onSelectionTouchMove={onSelectionTouchMove}
                      onSelectionTouchEnd={onSelectionTouchEnd}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default PhaseGroupedTodoList;
