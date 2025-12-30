'use client';

import React, { useCallback, useState } from 'react';
import type { IslandId } from '@/app/cosmos/types/screen';
import {
  DEFAULT_ISLAND_NAMES,
  ISLAND_IDS,
  getIslandLabel,
  type IslandNames,
} from '@/app/cosmos/utils/islandNames';

interface IslandsListProps {
  /**
   * Ilha atualmente selecionada
   */
  selectedIsland: IslandId | null;

  /**
   * Callback ao selecionar uma ilha
   */
  onSelectIsland: (island: IslandId | null) => void;

  /**
   * Classes CSS customizadas para o container
   */
  containerClassName?: string;

  /**
   * Classes CSS customizadas para item ativo
   */
  activeItemClassName?: string;

  /**
   * Classes CSS customizadas para item inativo
   */
  inactiveItemClassName?: string;

  /**
   * Ilha com drop ativo (drag over)
   */
  activeDropIsland?: IslandId | null;

  /**
   * Callback de drop por ilha
   */
  onDropIsland?: (island: IslandId) => (event: React.DragEvent) => void;

  /**
   * Callback de drag over por ilha
   */
  onDragOverIsland?: (island: IslandId) => (event: React.DragEvent) => void;

  /**
   * Callback ao sair do drag
   */
  onDragLeaveIsland?: () => void;

  /**
   * Evita clique durante arrasto
   */
  isDraggingTodo?: boolean;

  /**
   * Nomes customizados das ilhas
   */
  islandNames?: IslandNames;

  /**
   * Callback ao renomear uma ilha
   */
  onRenameIsland?: (islandId: IslandId, name: string) => void;
}

/**
 * IslandsList Component
 *
 * Exibe uma lista de ilhas com opção de criar novas.
 * Acessível: navegação por teclado (Tab, Enter, Space).
 * Uso de aria-labels e aria-pressed para estados.
 */
export const IslandsList: React.FC<IslandsListProps> = ({
  selectedIsland,
  onSelectIsland,
  containerClassName = '',
  activeItemClassName = 'border-indigo-300/80 bg-indigo-500/20 text-indigo-100 shadow-md shadow-indigo-500/20',
  inactiveItemClassName = 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60',
  activeDropIsland = null,
  onDropIsland,
  onDragOverIsland,
  onDragLeaveIsland,
  isDraggingTodo = false,
  islandNames = DEFAULT_ISLAND_NAMES,
  onRenameIsland,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newIslandName, setNewIslandName] = useState('');
  const [editingIslandId, setEditingIslandId] = useState<IslandId | null>(null);
  const [editingIslandName, setEditingIslandName] = useState('');

  const toggleIsland = useCallback(
    (islandId: IslandId) => {
      if (isDraggingTodo) return;
      onSelectIsland(selectedIsland === islandId ? null : islandId);
    },
    [isDraggingTodo, onSelectIsland, selectedIsland]
  );

  const handleKeyDown = useCallback(
    (islandId: IslandId) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleIsland(islandId);
      }
    },
    [toggleIsland]
  );

  const handleCreateIsland = () => {
    const trimmed = newIslandName.trim();
    if (!trimmed) return;
    // Aqui você pode adicionar lógica para criar a nova ilha
    console.warn('Criar nova ilha:', trimmed);
    setNewIslandName('');
    setIsCreating(false);
  };

  const handleStartEditing = (islandId: IslandId) => {
    if (!onRenameIsland || isDraggingTodo) return;
    setEditingIslandId(islandId);
    setEditingIslandName(getIslandLabel(islandId, islandNames) ?? '');
  };

  const handleCancelEditing = () => {
    setEditingIslandId(null);
    setEditingIslandName('');
  };

  const handleSaveEditing = () => {
    if (!editingIslandId || !onRenameIsland) return;
    const trimmed = editingIslandName.trim();
    if (!trimmed) return;
    onRenameIsland(editingIslandId, trimmed);
    setEditingIslandId(null);
    setEditingIslandName('');
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4 ${containerClassName}`}
      role="group"
      aria-label="Island selection"
      onClick={(event) => event.stopPropagation()}
    >
      {ISLAND_IDS.map((islandId) => {
        const isActiveDrop = activeDropIsland === islandId;
        const label = getIslandLabel(islandId, islandNames) ?? 'Ilha';
        const isEditing = editingIslandId === islandId;

        return (
          <div key={islandId} data-drop-target="island" data-island-id={islandId} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleIsland(islandId)}
                onDoubleClick={() => handleStartEditing(islandId)}
                onKeyDown={handleKeyDown(islandId)}
                onDrop={onDropIsland ? onDropIsland(islandId) : undefined}
                onDragOver={onDragOverIsland ? onDragOverIsland(islandId) : undefined}
                onDragLeave={onDragLeaveIsland}
                aria-pressed={selectedIsland === islandId}
                aria-label={`Select ${label}`}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedIsland === islandId ? activeItemClassName : inactiveItemClassName
                } ${isActiveDrop ? 'scale-[1.02] border-indigo-300/80 shadow-lg shadow-indigo-500/20' : ''}`}
              >
                <span>{label}</span>
              </button>
            </div>
            {isEditing && (
              <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-2">
                <input
                  value={editingIslandName}
                  onChange={(event) => setEditingIslandName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSaveEditing();
                    }
                  }}
                  placeholder="Nome da ilha"
                  className="rounded-md border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-indigo-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEditing}
                    className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    className="flex-1 rounded-md border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {isCreating ? (
        <div className="flex flex-col gap-2">
          <input
            value={newIslandName}
            onChange={(e) => setNewIslandName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateIsland();
              }
            }}
            placeholder="Nome da ilha"
            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-indigo-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateIsland}
              className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewIslandName('');
              }}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-dashed border-indigo-400/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100 transition hover:border-indigo-300"
          aria-label="Create new island"
        >
          <span className="text-base">+</span>
        </button>
      )}
    </div>
  );
};

export default IslandsList;
