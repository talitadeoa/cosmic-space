"use client";

import React, { useCallback } from "react";
import type { IslandId } from "../types/screen";

const ISLANDS: { id: IslandId; label: string }[] = [
  { id: "ilha1", label: "Ilha 1" },
  { id: "ilha2", label: "Ilha 2" },
  { id: "ilha3", label: "Ilha 3" },
  { id: "ilha4", label: "Ilha 4" },
];

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
}

/**
 * IslandsList Component
 *
 * Lista de ilhas com seleção visual.
 * Acessível: navegação por teclado (Tab, Enter, Space).
 * Uso de aria-labels e aria-pressed para estados.
 */
export const IslandsList: React.FC<IslandsListProps> = ({
  selectedIsland,
  onSelectIsland,
  containerClassName = "",
  activeItemClassName = "border-indigo-300/80 bg-indigo-500/20 text-indigo-100 shadow-md shadow-indigo-500/20",
  inactiveItemClassName = "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-indigo-400/60",
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, island: IslandId) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectIsland(selectedIsland === island ? null : island);
      }
    },
    [selectedIsland, onSelectIsland]
  );

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4 ${containerClassName}`}
      role="group"
      aria-label="Select an island to filter tasks"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
        Ilhas
      </p>

      <div className="flex flex-col gap-2">
        {ISLANDS.map((island) => {
          const isSelected = selectedIsland === island.id;

          return (
            <button
              key={island.id}
              type="button"
              onClick={() => onSelectIsland(isSelected ? null : island.id)}
              onKeyDown={(e) => handleKeyDown(e, island.id)}
              aria-pressed={isSelected}
              aria-label={`Select ${island.label}`}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected ? activeItemClassName : inactiveItemClassName
              }`}
            >
              <span>{island.label}</span>
            </button>
          );
        })}
      </div>

      {selectedIsland && (
        <button
          type="button"
          onClick={() => onSelectIsland(null)}
          className="mt-2 rounded-lg border border-dashed border-slate-600 bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-slate-500 hover:text-slate-300"
          aria-label="Clear island selection"
        >
          Limpar seleção
        </button>
      )}
    </div>
  );
};

export default IslandsList;
