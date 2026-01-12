'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BrainstormIdea, BrainstormCluster, BrainstormStatus } from '@/hooks/useBrainstormSession';

interface BrainstormPanelProps {
  isOpen: boolean;
  status: BrainstormStatus;
  ideas: BrainstormIdea[];
  clusters: BrainstormCluster[];
  stats: {
    totalIdeas: number;
    keyIdeas: number;
    clusteredIdeas: number;
    unclusteredIdeas: number;
    totalClusters: number;
  };
  onToggleKeyIdea: (ideaId: string) => void;
  onCreateCluster: (name: string, ideaIds: string[]) => void;
  onStartOrganizing: () => void;
  onGenerateSummary: () => void;
  onEndSession: () => void;
  onClose: () => void;
}

const CLUSTER_COLORS_DISPLAY = [
  { bg: 'bg-violet-500/20', border: 'border-violet-400/40', text: 'text-violet-200' },
  { bg: 'bg-sky-500/20', border: 'border-sky-400/40', text: 'text-sky-200' },
  { bg: 'bg-amber-500/20', border: 'border-amber-400/40', text: 'text-amber-200' },
  { bg: 'bg-emerald-500/20', border: 'border-emerald-400/40', text: 'text-emerald-200' },
  { bg: 'bg-rose-500/20', border: 'border-rose-400/40', text: 'text-rose-200' },
];

export function BrainstormPanel({
  isOpen,
  status,
  ideas,
  clusters,
  stats,
  onToggleKeyIdea,
  onCreateCluster,
  onStartOrganizing,
  onGenerateSummary,
  onEndSession,
  onClose,
}: BrainstormPanelProps) {
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [newClusterName, setNewClusterName] = useState('');
  const [isCreatingCluster, setIsCreatingCluster] = useState(false);

  const toggleIdeaSelection = (ideaId: string) => {
    setSelectedIdeas((prev) => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }
      return next;
    });
  };

  const handleCreateCluster = () => {
    if (newClusterName.trim() && selectedIdeas.size > 0) {
      onCreateCluster(newClusterName.trim(), Array.from(selectedIdeas));
      setNewClusterName('');
      setSelectedIdeas(new Set());
      setIsCreatingCluster(false);
    }
  };

  const getClusterForIdea = (ideaId: string) => {
    return clusters.find((c) => c.ideaIds.includes(ideaId));
  };

  const unclusteredIdeas = ideas.filter((idea) => !idea.cluster);
  const keyIdeas = ideas.filter((idea) => idea.isKeyIdea);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 border-l border-white/10 backdrop-blur-xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="text-lg">🧠</span>
                Brainstorm
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
                aria-label="Fechar painel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-3 text-[0.65rem] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="text-base">💡</span>
                {stats.totalIdeas} ideias
              </span>
              <span className="flex items-center gap-1">
                <span className="text-base">⭐</span>
                {stats.keyIdeas} principais
              </span>
              <span className="flex items-center gap-1">
                <span className="text-base">📂</span>
                {stats.totalClusters} grupos
              </span>
            </div>
          </div>

          {/* Ideas List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {ideas.length === 0 ? (
              <div className="text-center text-slate-500 text-sm py-8">
                <span className="text-2xl block mb-2">💭</span>
                Suas ideias aparecerão aqui
              </div>
            ) : (
              <>
                {/* Key Ideas Section */}
                {keyIdeas.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1">
                      <span>⭐</span> Ideias-chave
                    </div>
                    <div className="space-y-1.5">
                      {keyIdeas.map((idea) => (
                        <IdeaCard
                          key={idea.id}
                          idea={idea}
                          isSelected={selectedIdeas.has(idea.id)}
                          cluster={getClusterForIdea(idea.id)}
                          onToggleSelect={() => toggleIdeaSelection(idea.id)}
                          onToggleKey={() => onToggleKeyIdea(idea.id)}
                          showCheckbox={status === 'organizing'}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Clustered Ideas */}
                {clusters.map((cluster, index) => {
                  const clusterIdeas = ideas.filter((i) => i.cluster === cluster.id && !i.isKeyIdea);
                  if (clusterIdeas.length === 0) return null;
                  
                  const colorStyle = CLUSTER_COLORS_DISPLAY[index % CLUSTER_COLORS_DISPLAY.length];
                  
                  return (
                    <div key={cluster.id} className="mb-4">
                      <div className={`text-[0.65rem] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1 ${colorStyle.text}`}>
                        <span>📂</span> {cluster.name}
                      </div>
                      <div className="space-y-1.5">
                        {clusterIdeas.map((idea) => (
                          <IdeaCard
                            key={idea.id}
                            idea={idea}
                            isSelected={selectedIdeas.has(idea.id)}
                            cluster={cluster}
                            colorIndex={index}
                            onToggleSelect={() => toggleIdeaSelection(idea.id)}
                            onToggleKey={() => onToggleKeyIdea(idea.id)}
                            showCheckbox={status === 'organizing'}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Unclustered Ideas */}
                {unclusteredIdeas.filter((i) => !i.isKeyIdea).length > 0 && (
                  <div className="mb-4">
                    <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                      <span>💭</span> Outras ideias
                    </div>
                    <div className="space-y-1.5">
                      {unclusteredIdeas
                        .filter((i) => !i.isKeyIdea)
                        .map((idea) => (
                          <IdeaCard
                            key={idea.id}
                            idea={idea}
                            isSelected={selectedIdeas.has(idea.id)}
                            onToggleSelect={() => toggleIdeaSelection(idea.id)}
                            onToggleKey={() => onToggleKeyIdea(idea.id)}
                            showCheckbox={status === 'organizing'}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create Cluster UI */}
          {status === 'organizing' && selectedIdeas.size > 0 && (
            <div className="p-3 border-t border-white/10 bg-slate-900/80">
              {isCreatingCluster ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newClusterName}
                    onChange={(e) => setNewClusterName(e.target.value)}
                    placeholder="Nome do grupo..."
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-white/30"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateCluster}
                      disabled={!newClusterName.trim()}
                      className="flex-1 py-2 text-xs font-medium bg-violet-500/30 border border-violet-400/40 text-violet-100 rounded-lg hover:bg-violet-500/40 transition disabled:opacity-50"
                    >
                      Criar grupo ({selectedIdeas.size})
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingCluster(false);
                        setNewClusterName('');
                      }}
                      className="px-3 py-2 text-xs text-slate-400 hover:text-white transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingCluster(true)}
                  className="w-full py-2 text-xs font-medium bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10 hover:border-white/20 transition"
                >
                  📂 Agrupar {selectedIdeas.size} ideia{selectedIdeas.size !== 1 ? 's' : ''} selecionada{selectedIdeas.size !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}

          {/* Actions Footer */}
          <div className="p-3 border-t border-white/10 space-y-2">
            {status === 'brainstorming' && ideas.length >= 2 && (
              <button
                onClick={onStartOrganizing}
                className="w-full py-2.5 text-sm font-medium bg-violet-500/20 border border-violet-400/30 text-violet-100 rounded-xl hover:bg-violet-500/30 transition"
              >
                📋 Organizar ideias
              </button>
            )}

            {status === 'organizing' && (
              <button
                onClick={onGenerateSummary}
                className="w-full py-2.5 text-sm font-medium bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 rounded-xl hover:bg-emerald-500/30 transition"
              >
                ✨ Gerar resumo
              </button>
            )}

            <button
              onClick={onEndSession}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              Encerrar brainstorm
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface IdeaCardProps {
  idea: BrainstormIdea;
  isSelected: boolean;
  cluster?: BrainstormCluster;
  colorIndex?: number;
  showCheckbox: boolean;
  onToggleSelect: () => void;
  onToggleKey: () => void;
}

function IdeaCard({
  idea,
  isSelected,
  colorIndex = 0,
  showCheckbox,
  onToggleSelect,
  onToggleKey,
}: IdeaCardProps) {
  const colorStyle = CLUSTER_COLORS_DISPLAY[colorIndex % CLUSTER_COLORS_DISPLAY.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        group relative p-2.5 rounded-lg border text-xs transition-all cursor-pointer
        ${isSelected 
          ? `${colorStyle.bg} ${colorStyle.border}` 
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }
        ${idea.isKeyIdea ? 'ring-1 ring-amber-400/30' : ''}
      `}
      onClick={showCheckbox ? onToggleSelect : undefined}
    >
      <div className="flex items-start gap-2">
        {showCheckbox && (
          <div
            className={`
              w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center mt-0.5
              ${isSelected 
                ? 'bg-violet-500/50 border-violet-400' 
                : 'border-white/30 hover:border-white/50'
              }
            `}
          >
            {isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}

        <p className="flex-1 text-slate-200 leading-relaxed">{idea.content}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleKey();
          }}
          className={`
            flex-shrink-0 p-1 rounded transition opacity-0 group-hover:opacity-100
            ${idea.isKeyIdea 
              ? 'text-amber-400 opacity-100' 
              : 'text-slate-500 hover:text-amber-400'
            }
          `}
          title={idea.isKeyIdea ? 'Remover destaque' : 'Marcar como ideia-chave'}
        >
          <svg className="w-3.5 h-3.5" fill={idea.isKeyIdea ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export default BrainstormPanel;
