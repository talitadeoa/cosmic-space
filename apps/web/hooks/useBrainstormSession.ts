'use client';

import { useState, useCallback, useMemo } from 'react';

export type BrainstormStatus = 'idle' | 'brainstorming' | 'organizing' | 'summarizing';

export interface BrainstormIdea {
  id: string;
  content: string;
  timestamp: string;
  cluster?: string;
  isKeyIdea?: boolean;
  connections?: string[];
}

export interface BrainstormCluster {
  id: string;
  name: string;
  color: string;
  ideaIds: string[];
}

export interface BrainstormSession {
  id: string;
  title?: string;
  status: BrainstormStatus;
  ideas: BrainstormIdea[];
  clusters: BrainstormCluster[];
  startedAt: string;
  endedAt?: string;
  summary?: string;
}

const CLUSTER_COLORS = [
  'bg-violet-500/30 border-violet-400/40',
  'bg-sky-500/30 border-sky-400/40',
  'bg-amber-500/30 border-amber-400/40',
  'bg-emerald-500/30 border-emerald-400/40',
  'bg-rose-500/30 border-rose-400/40',
  'bg-indigo-500/30 border-indigo-400/40',
];

const BRAINSTORM_PROMPTS = {
  welcome: `🧠 **Modo Brainstorm Ativado!**

Vamos explorar suas ideias juntos. Aqui está como funciona:

1. **Despeje tudo** — Escreva qualquer ideia que vier à mente, sem julgamento
2. **Eu vou ajudar** — Farei perguntas para expandir seus conceitos
3. **Organizamos juntos** — Ao final, agrupamos e priorizamos

Qual é o tema ou problema que você quer explorar?`,

  followUp: [
    'Interessante! E se você levasse isso ainda mais longe... o que aconteceria?',
    'Gostei dessa direção. O que mais se conecta com essa ideia?',
    'Hmm, isso me faz pensar... existe algum obstáculo que precisamos considerar?',
    'Legal! Qual seria o primeiro passo prático para isso?',
    'Que tal explorarmos o oposto disso? O que aconteceria?',
    'Essa ideia tem potencial. Como ela se relaciona com as anteriores?',
    'E se combinássemos isso com uma das ideias anteriores?',
    'Interessante! O que te fez pensar nisso?',
    'Ótimo ponto! Existe alguma variação dessa ideia?',
    'Perfeito. Vamos expandir... o que mais?',
  ],

  organizing: `📋 **Hora de organizar!**

Olhando para todas as ideias que surgiram, identifiquei alguns padrões. 
Você pode arrastar as ideias para reorganizá-las ou marcar as mais importantes.

Quando estiver satisfeito, clique em "Gerar Resumo".`,

  summary: `✨ **Resumo do Brainstorm**

Aqui está uma síntese das suas ideias organizadas:`,
};

const generateId = () => `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function useBrainstormSession(storageKey?: string) {
  const [session, setSession] = useState<BrainstormSession | null>(null);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);

  const status = session?.status ?? 'idle';
  const isActive = status !== 'idle';
  const ideas = session?.ideas ?? [];
  const clusters = session?.clusters ?? [];

  // Iniciar nova sessão de brainstorm
  const startSession = useCallback((title?: string) => {
    const newSession: BrainstormSession = {
      id: `session-${Date.now()}`,
      title,
      status: 'brainstorming',
      ideas: [],
      clusters: [],
      startedAt: new Date().toISOString(),
    };
    setSession(newSession);
    setPendingResponse(BRAINSTORM_PROMPTS.welcome);
    
    if (storageKey) {
      localStorage.setItem(`brainstorm:${storageKey}`, JSON.stringify(newSession));
    }
    
    return newSession;
  }, [storageKey]);

  // Adicionar ideia à sessão
  const addIdea = useCallback((content: string): BrainstormIdea | null => {
    if (!session || session.status !== 'brainstorming') return null;
    
    const newIdea: BrainstormIdea = {
      id: generateId(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setSession((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        ideas: [...prev.ideas, newIdea],
      };
      if (storageKey) {
        localStorage.setItem(`brainstorm:${storageKey}`, JSON.stringify(updated));
      }
      return updated;
    });

    // Gerar resposta de follow-up
    const randomPrompt = BRAINSTORM_PROMPTS.followUp[
      Math.floor(Math.random() * BRAINSTORM_PROMPTS.followUp.length)
    ];
    setPendingResponse(randomPrompt);

    return newIdea;
  }, [session, storageKey]);

  // Criar cluster de ideias
  const createCluster = useCallback((name: string, ideaIds: string[]) => {
    if (!session) return null;
    
    const colorIndex = clusters.length % CLUSTER_COLORS.length;
    const newCluster: BrainstormCluster = {
      id: `cluster-${Date.now()}`,
      name,
      color: CLUSTER_COLORS[colorIndex],
      ideaIds,
    };

    setSession((prev) => {
      if (!prev) return prev;
      
      // Atualizar ideias com o cluster
      const updatedIdeas = prev.ideas.map((idea) => 
        ideaIds.includes(idea.id) ? { ...idea, cluster: newCluster.id } : idea
      );
      
      const updated = {
        ...prev,
        ideas: updatedIdeas,
        clusters: [...prev.clusters, newCluster],
      };
      
      if (storageKey) {
        localStorage.setItem(`brainstorm:${storageKey}`, JSON.stringify(updated));
      }
      return updated;
    });

    return newCluster;
  }, [session, clusters.length, storageKey]);

  // Marcar ideia como key idea
  const toggleKeyIdea = useCallback((ideaId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      
      const updatedIdeas = prev.ideas.map((idea) =>
        idea.id === ideaId ? { ...idea, isKeyIdea: !idea.isKeyIdea } : idea
      );
      
      const updated = { ...prev, ideas: updatedIdeas };
      
      if (storageKey) {
        localStorage.setItem(`brainstorm:${storageKey}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [storageKey]);

  // Mover para modo de organização
  const startOrganizing = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, status: 'organizing' as BrainstormStatus };
      if (storageKey) {
        localStorage.setItem(`brainstorm:${storageKey}`, JSON.stringify(updated));
      }
      return updated;
    });
    setPendingResponse(BRAINSTORM_PROMPTS.organizing);
  }, [storageKey]);

  // Gerar resumo final
  const generateSummary = useCallback(() => {
    if (!session) return null;

    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, status: 'summarizing' as BrainstormStatus };
    });

    // Construir resumo baseado nas ideias
    const keyIdeas = ideas.filter((i) => i.isKeyIdea);
    const clusteredIdeas = clusters.map((cluster) => ({
      ...cluster,
      ideas: ideas.filter((i) => i.cluster === cluster.id),
    }));
    const unclusteredIdeas = ideas.filter((i) => !i.cluster && !i.isKeyIdea);

    let summary = BRAINSTORM_PROMPTS.summary + '\n\n';

    if (keyIdeas.length > 0) {
      summary += '**🌟 Ideias-chave:**\n';
      keyIdeas.forEach((idea) => {
        summary += `• ${idea.content}\n`;
      });
      summary += '\n';
    }

    if (clusteredIdeas.length > 0) {
      summary += '**📂 Ideias agrupadas:**\n';
      clusteredIdeas.forEach((cluster) => {
        if (cluster.ideas.length > 0) {
          summary += `\n*${cluster.name}:*\n`;
          cluster.ideas.forEach((idea) => {
            summary += `  • ${idea.content}\n`;
          });
        }
      });
      summary += '\n';
    }

    if (unclusteredIdeas.length > 0) {
      summary += '**💭 Outras ideias:**\n';
      unclusteredIdeas.forEach((idea) => {
        summary += `• ${idea.content}\n`;
      });
    }

    summary += `\n---\n📊 Total: ${ideas.length} ideias | ⭐ ${keyIdeas.length} principais | 📂 ${clusters.length} grupos`;

    setSession((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        summary,
        endedAt: new Date().toISOString(),
      };
      if (storageKey) {
        localStorage.setItem(`brainstorm:${storageKey}`, JSON.stringify(updated));
      }
      return updated;
    });

    setPendingResponse(summary);
    return summary;
  }, [session, ideas, clusters, storageKey]);

  // Finalizar sessão
  const endSession = useCallback(() => {
    const finalSession = session;
    setSession(null);
    setPendingResponse(null);
    
    if (storageKey) {
      localStorage.removeItem(`brainstorm:${storageKey}`);
    }
    
    return finalSession;
  }, [session, storageKey]);

  // Consumir resposta pendente
  const consumePendingResponse = useCallback(() => {
    const response = pendingResponse;
    setPendingResponse(null);
    return response;
  }, [pendingResponse]);

  // Auto-clustering baseado em palavras-chave simples
  const suggestClusters = useCallback(() => {
    if (ideas.length < 3) return [];

    // Análise simples de palavras frequentes
    const wordCounts = new Map<string, string[]>();
    
    ideas.forEach((idea) => {
      const words = idea.content
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4); // palavras com mais de 4 letras
      
      words.forEach((word) => {
        if (!wordCounts.has(word)) {
          wordCounts.set(word, []);
        }
        wordCounts.get(word)?.push(idea.id);
      });
    });

    // Encontrar palavras que aparecem em múltiplas ideias
    const suggestions: Array<{ keyword: string; ideaIds: string[] }> = [];
    
    wordCounts.forEach((ideaIds, word) => {
      if (ideaIds.length >= 2) {
        suggestions.push({ keyword: word, ideaIds: [...new Set(ideaIds)] });
      }
    });

    return suggestions.slice(0, 5); // Top 5 sugestões
  }, [ideas]);

  // Carregar sessão salva
  const loadSession = useCallback(() => {
    if (!storageKey) return null;
    
    try {
      const saved = localStorage.getItem(`brainstorm:${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved) as BrainstormSession;
        setSession(parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  }, [storageKey]);

  // Stats da sessão
  const stats = useMemo(() => ({
    totalIdeas: ideas.length,
    keyIdeas: ideas.filter((i) => i.isKeyIdea).length,
    clusteredIdeas: ideas.filter((i) => i.cluster).length,
    unclusteredIdeas: ideas.filter((i) => !i.cluster).length,
    totalClusters: clusters.length,
  }), [ideas, clusters]);

  return {
    // Estado
    session,
    status,
    isActive,
    ideas,
    clusters,
    stats,
    pendingResponse,
    
    // Ações
    startSession,
    endSession,
    addIdea,
    createCluster,
    toggleKeyIdea,
    startOrganizing,
    generateSummary,
    suggestClusters,
    loadSession,
    consumePendingResponse,
  };
}
