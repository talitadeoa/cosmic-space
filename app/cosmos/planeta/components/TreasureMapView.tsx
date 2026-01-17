'use client';

import React, { useMemo } from 'react';
import { type MoonPhase, type SavedTodo } from '@/app/cosmos/utils/todoStorage';
import { MOON_PHASES, MOON_PHASE_LABELS, MOON_PHASE_EMOJIS } from '@/types/moon';
import { PHASE_VIBES } from '@/app/cosmos/utils/phaseVibes';
import type { IslandId } from '@/app/cosmos/types/screen';

interface TreasureMapViewProps {
  todos: SavedTodo[];
  islandNames: Record<IslandId, string>;
  islandIds: IslandId[];
  onSelectPhase: (phase: MoonPhase | null) => void;
  onSelectIsland: (island: IslandId | null) => void;
  selectedPhase: MoonPhase | null;
  selectedIsland: IslandId | null;
  onToggleComplete: (todoId: string) => void;
}

export const TreasureMapView: React.FC<TreasureMapViewProps> = ({
  todos,
  islandNames,
  islandIds,
  onSelectPhase,
  onSelectIsland,
  selectedPhase,
  selectedIsland,
  onToggleComplete,
}) => {
  // Agrupar todos por fase lunar - memoizado
  const todosByPhase = useMemo(() =>
    MOON_PHASES.reduce((acc, phase) => {
      acc[phase] = todos.filter((todo) => todo.phase === phase);
      return acc;
    }, {} as Record<MoonPhase, SavedTodo[]>),
    [todos]
  );

  // Todos sem fase atribuída
  const unassignedTodos = useMemo(() =>
    todos.filter((todo) => !todo.phase),
    [todos]
  );

  // Agrupar todos por ilha - memoizado
  const todosByIsland = useMemo(() =>
    islandIds.reduce((acc, islandId) => {
      acc[islandId] = todos.filter((todo) => todo.islandId === islandId);
      return acc;
    }, {} as Record<IslandId, SavedTodo[]>),
    [todos, islandIds]
  );

  // Contar tesouros - memoizado
  const { completedCount, totalCount } = useMemo(() => ({
    completedCount: todos.filter((t) => t.completed).length,
    totalCount: todos.length,
  }), [todos]);

  // Decorações para cada fase
  const decorations = ['🌴', '⚓', '🏝️', '🗿'];

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden">
      {/* Fundo estilo pergaminho/mapa antigo */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/90 via-amber-900/80 to-amber-950/90" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Bordas estilo mapa antigo */}
      <div className="absolute inset-4 border-4 border-amber-700/50 rounded-lg" />
      <div className="absolute inset-6 border-2 border-amber-600/30 rounded-lg" />

      {/* Conteúdo do mapa */}
      <div className="relative z-10 p-8 sm:p-12">
        {/* Título do mapa */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-amber-200 drop-shadow-lg tracking-wider"
              style={{ fontFamily: 'serif', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            🗺️ Mapa dos Tesouros 🗺️
          </h1>
          <p className="mt-2 text-amber-300/80 text-lg italic">
            &ldquo;X marca o local dos seus objetivos&rdquo;
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-800/50 rounded-full border border-amber-600/50">
            <span className="text-amber-200">💰</span>
            <span className="text-amber-100 font-semibold">
              {completedCount} de {totalCount} tesouros encontrados
            </span>
          </div>
        </div>

        {/* Rosa dos ventos decorativa */}
        <div className="absolute top-8 right-8 text-6xl opacity-50 select-none">
          🧭
        </div>

        {/* Grid do mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Seção das Fases Lunares - Regiões do Mapa */}
          {MOON_PHASES.map((phase, index) => {
            const phaseTodos = todosByPhase[phase];
            const completedInPhase = phaseTodos.filter((t) => t.completed).length;
            const isSelected = selectedPhase === phase;
            
            return (
              <button
                type="button"
                key={phase}
                onClick={() => onSelectPhase(isSelected ? null : phase)}
                className={`
                  relative p-6 rounded-xl text-left transition-all duration-300 w-full
                  border-2 ${isSelected 
                    ? 'border-amber-400 bg-amber-800/60 shadow-lg shadow-amber-500/30' 
                    : 'border-amber-700/50 bg-amber-900/40 hover:bg-amber-800/50 hover:border-amber-600/70'}
                `}
              >
                {/* Decoração de canto */}
                <span className="absolute top-2 right-2 text-2xl opacity-60">
                  {decorations[index]}
                </span>

                {/* Cabeçalho da região */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{MOON_PHASE_EMOJIS[phase]}</span>
                  <div>
                    <h3 className="text-xl font-bold text-amber-100" style={{ fontFamily: 'serif' }}>
                      Região da {MOON_PHASE_LABELS[phase]}
                    </h3>
                    <p className="text-amber-300/70 text-sm italic">
                      {PHASE_VIBES[phase]?.label || 'Explorar novos horizontes'}
                    </p>
                  </div>
                </div>

                {/* Contador de tesouros */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-400">💎</span>
                  <span className="text-amber-200">
                    {completedInPhase}/{phaseTodos.length} tesouros
                  </span>
                </div>

                {/* Lista de tarefas como itens do mapa */}
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-700 scrollbar-track-transparent">
                  {phaseTodos.length === 0 ? (
                    <p className="text-amber-500/60 italic text-sm">
                      Nenhum tesouro marcado nesta região...
                    </p>
                  ) : (
                    phaseTodos.map((todo) => (
                      <button
                        type="button"
                        key={todo.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(todo.id);
                        }}
                        className={`
                          flex items-center gap-2 p-2 rounded-lg transition-all w-full text-left
                          ${todo.completed 
                            ? 'bg-green-900/30 border border-green-700/40' 
                            : 'bg-amber-950/40 border border-amber-800/30 hover:bg-amber-900/40'}
                        `}
                      >
                        <span className="text-lg">
                          {todo.completed ? '✅' : '❌'}
                        </span>
                        <span className={`text-sm flex-1 ${todo.completed ? 'text-green-300 line-through' : 'text-amber-100'}`}>
                          {todo.text}
                        </span>
                        {todo.islandId && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-800/50 text-amber-300">
                            🏝️ {islandNames[todo.islandId] || todo.islandId}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Seção de Ilhas */}
        {islandIds.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-amber-200 mb-4 flex items-center gap-2" style={{ fontFamily: 'serif' }}>
              <span>🏝️</span>
              Arquipélago das Ilhas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {islandIds.map((islandId) => {
                const islandTodos = todosByIsland[islandId];
                const completedInIsland = islandTodos.filter((t) => t.completed).length;
                const isSelected = selectedIsland === islandId;

                return (
                  <button
                    type="button"
                    key={islandId}
                    onClick={() => onSelectIsland(isSelected ? null : islandId)}
                    className={`
                      relative p-4 rounded-xl transition-all duration-300 text-center
                      border-2 ${isSelected
                        ? 'border-cyan-400 bg-cyan-900/50 shadow-lg shadow-cyan-500/30'
                        : 'border-amber-700/40 bg-amber-900/30 hover:bg-amber-800/40 hover:border-amber-600/60'}
                    `}
                  >
                    <div className="text-3xl mb-2">🏝️</div>
                    <h4 className="text-amber-100 font-semibold text-sm mb-1">
                      {islandNames[islandId] || `Ilha ${islandId}`}
                    </h4>
                    <p className="text-amber-400/80 text-xs">
                      💎 {completedInIsland}/{islandTodos.length}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tesouro perdido (tarefas sem fase) */}
        {unassignedTodos.length > 0 && (
          <div className="p-6 rounded-xl border-2 border-dashed border-amber-600/40 bg-amber-950/30">
            <h3 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2" style={{ fontFamily: 'serif' }}>
              <span>🏴‍☠️</span>
              Tesouros Perdidos
              <span className="text-sm font-normal text-amber-500/70 ml-2">
                (aguardando uma região)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {unassignedTodos.map((todo) => (
                <button
                  type="button"
                  key={todo.id}
                  onClick={() => onToggleComplete(todo.id)}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg transition-all text-left
                    ${todo.completed 
                      ? 'bg-green-900/20 border border-green-700/30' 
                      : 'bg-amber-950/40 border border-amber-800/20 hover:bg-amber-900/30'}
                  `}
                >
                  <span className="text-lg">{todo.completed ? '✅' : '❓'}</span>
                  <span className={`text-sm flex-1 ${todo.completed ? 'text-green-300 line-through' : 'text-amber-200'}`}>
                    {todo.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Legenda do mapa */}
        <div className="mt-8 p-4 rounded-xl bg-amber-950/50 border border-amber-800/40">
          <h4 className="text-amber-200 font-semibold mb-3" style={{ fontFamily: 'serif' }}>
            📜 Legenda do Mapa
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-amber-300">
              <span>✅</span>
              <span>Tesouro encontrado</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <span>❌</span>
              <span>Tesouro a encontrar</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <span>💎</span>
              <span>Contagem de tesouros</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <span>🏝️</span>
              <span>Ilha/Projeto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TreasureMapView.displayName = 'TreasureMapView';

export default TreasureMapView;
