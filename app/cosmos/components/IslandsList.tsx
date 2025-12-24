"use client";

import React, { useCallback, useState } from "react";
import type { IslandId } from "../types/screen";

const ISLANDS: { id: IslandId; label: string }[] = [
  { id: "ilha1", label: "Ilha" },
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
 * Exibe uma única ilha com opção de criar novas.
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
  const [isCreating, setIsCreating] = useState(false);
  const [newIslandName, setNewIslandName] = useState("");

  const currentIsland = ISLANDS[0]; // Mostra apenas a primeira ilha

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectIsland(selectedIsland === currentIsland.id ? null : currentIsland.id);
      }
    },
    [selectedIsland, currentIsland.id, onSelectIsland]
  );

  const handleCreateIsland = () => {
    const trimmed = newIslandName.trim();
    if (!trimmed) return;
    // Aqui você pode adicionar lógica para criar a nova ilha
    console.log("Criar nova ilha:", trimmed);
    setNewIslandName("");
    setIsCreating(false);
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4 ${containerClassName}`}
      role="group"
      aria-label="Island selection"
    >
      <button
        type="button"
        onClick={() => onSelectIsland(selectedIsland === currentIsland.id ? null : currentIsland.id)}
        onKeyDown={handleKeyDown}
        aria-pressed={selectedIsland === currentIsland.id}
        aria-label={`Select ${currentIsland.label}`}
        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          selectedIsland === currentIsland.id ? activeItemClassName : inactiveItemClassName
        }`}
      >
        <span>{currentIsland.label}</span>
      </button>

      {isCreating ? (
        <div className="flex flex-col gap-2">
          <input
            value={newIslandName}
            onChange={(e) => setNewIslandName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
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
                setNewIslandName("");
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
