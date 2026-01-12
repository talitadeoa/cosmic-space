'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Emotion, EmotionRecord } from '@/components/EmotionalInput';

interface SyncedEmotionRecord {
  emotion: Emotion;
  context?: string;
  notes?: string;
  timestamp: string;
  date: string;
}

interface EmotionSyncResponse {
  current: {
    id: string;
    emoji: string;
    label: string;
    color?: string;
    description?: string;
    updatedAt: string;
  } | null;
  history: SyncedEmotionRecord[];
  count: number;
}

const EMOTIONS: Emotion[] = [
  {
    id: 'happy',
    emoji: '😊',
    label: 'Feliz',
    color: 'from-yellow-300 to-yellow-500',
    description: 'Alegre e contente',
  },
  {
    id: 'love',
    emoji: '😍',
    label: 'Apaixonado',
    color: 'from-red-300 to-red-500',
    description: 'Cheio de amor',
  },
  {
    id: 'excited',
    emoji: '🤩',
    label: 'Animado',
    color: 'from-purple-300 to-purple-500',
    description: 'Muito empolgado',
  },
  {
    id: 'sad',
    emoji: '😢',
    label: 'Triste',
    color: 'from-blue-300 to-blue-500',
    description: 'Infeliz',
  },
  {
    id: 'angry',
    emoji: '😠',
    label: 'Raiva',
    color: 'from-orange-300 to-orange-500',
    description: 'Irritado',
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutro',
    color: 'from-gray-300 to-gray-500',
    description: 'Sem expressão',
  },
  {
    id: 'confused',
    emoji: '😕',
    label: 'Confuso',
    color: 'from-indigo-300 to-indigo-500',
    description: 'Perplexo',
  },
  {
    id: 'tired',
    emoji: '😴',
    label: 'Cansado',
    color: 'from-teal-300 to-teal-500',
    description: 'Esgotado',
  },
  {
    id: 'cool',
    emoji: '😎',
    label: 'Confiante',
    color: 'from-cyan-300 to-cyan-500',
    description: 'Seguro de si',
  },
  {
    id: 'worried',
    emoji: '😰',
    label: 'Preocupado',
    color: 'from-pink-300 to-pink-500',
    description: 'Ansioso',
  },
];

export interface UseEmotionalInputReturn {
  currentEmotion: Emotion | null;
  emotionHistory: EmotionRecord[];
  setEmotion: (emotion: Emotion, context?: string, notes?: string) => void;
  clearEmotion: () => void;
  getEmotionByDate: (date: string) => EmotionRecord | undefined;
  getAllEmotionsForDate: (date: string) => EmotionRecord[];
  getMostFrequentEmotion: () => Emotion | null;
  syncFromServer: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
}

/**
 * Hook para gerenciar emoções com persistência local e sincronização com servidor
 * @param storageKey - Chave do localStorage (padrão: 'current_emotion')
 * @param autoSync - Se deve sincronizar automaticamente ao montar (padrão: true)
 * @returns Objeto com estado e funções de emoção
 */
export function useEmotionalInput(
  storageKey: string = 'current_emotion',
  autoSync: boolean = true
): UseEmotionalInputReturn {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const syncInProgress = useRef(false);

  // Carregar dados ao montar
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCurrentEmotion(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar emoção:', e);
      }
    }

    const history = localStorage.getItem(`${storageKey}_history`);
    if (history) {
      try {
        setEmotionHistory(JSON.parse(history));
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }

    setIsLoading(false);
  }, [storageKey]);

  // Sincronizar do servidor
  const syncFromServer = useCallback(async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const response = await fetch('/api/emotion-sync', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        // Se não autenticado, apenas ignora silenciosamente
        if (response.status === 401) {
          console.debug('Usuário não autenticado, usando dados locais');
          return;
        }
        throw new Error('Falha ao sincronizar do servidor');
      }

      const data = await response.json() as EmotionSyncResponse;

      // Atualizar emoção atual se o servidor tiver uma mais recente
      if (data.current) {
        const serverEmotion = EMOTIONS.find(e => e.id === data.current?.id) || {
          id: data.current.id,
          emoji: data.current.emoji,
          label: data.current.label,
          color: data.current.color || 'from-gray-300 to-gray-500',
          description: data.current.description || '',
        };
        
        // Comparar timestamps para decidir qual manter
        const localSaved = localStorage.getItem(storageKey);
        let shouldUpdate = true;
        
        if (localSaved) {
          try {
            const localData = JSON.parse(localStorage.getItem(`${storageKey}_last_update`) || '0');
            const serverUpdate = new Date(data.current.updatedAt).getTime();
            shouldUpdate = serverUpdate > localData;
          } catch {
            shouldUpdate = true;
          }
        }

        if (shouldUpdate) {
          localStorage.setItem(storageKey, JSON.stringify(serverEmotion));
          localStorage.setItem(`${storageKey}_last_update`, Date.now().toString());
          setCurrentEmotion(serverEmotion);
        }
      }

      // Mesclar históricos: manter registros locais que não estão no servidor
      if (data.history && data.history.length > 0) {
        const serverRecords: EmotionRecord[] = data.history.map(h => ({
          emotion: EMOTIONS.find(e => e.id === h.emotion.id) || h.emotion,
          timestamp: h.timestamp,
          date: h.date,
        }));

        setEmotionHistory(prev => {
          // Criar um Set de timestamps do servidor para evitar duplicatas
          const serverTimestamps = new Set(serverRecords.map(r => r.timestamp));
          
          // Manter registros locais que não estão no servidor
          const uniqueLocal = prev.filter(r => !serverTimestamps.has(r.timestamp));
          
          // Mesclar e ordenar por data
          const merged = [...serverRecords, ...uniqueLocal]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 100);
          
          localStorage.setItem(`${storageKey}_history`, JSON.stringify(merged));
          return merged;
        });
      }

      setLastSyncedAt(new Date());
    } catch (error) {
      console.debug('Erro ao sincronizar emoções do servidor:', error);
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [storageKey]);

  // Auto-sync ao montar se habilitado
  useEffect(() => {
    if (autoSync && !isLoading) {
      syncFromServer();
    }
  }, [autoSync, isLoading, syncFromServer]);

  const setEmotion = useCallback((emotion: Emotion, context?: string, notes?: string) => {
    const timestamp = new Date().toISOString();
    
    // Salvar como emoção atual
    localStorage.setItem(storageKey, JSON.stringify(emotion));
    localStorage.setItem(`${storageKey}_last_update`, Date.now().toString());
    setCurrentEmotion(emotion);

    // Adicionar ao histórico
    const today = timestamp.split('T')[0];
    const newRecord: EmotionRecord = {
      emotion,
      timestamp,
      date: today,
    };

    setEmotionHistory(prev => {
      const updated = [newRecord, ...prev].slice(0, 100);
      localStorage.setItem(`${storageKey}_history`, JSON.stringify(updated));
      return updated;
    });

    // Sincronizar com servidor em background
    fetch('/api/emotion-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        emotion: {
          emotion_id: emotion.id,
          emoji: emotion.emoji,
          label: emotion.label,
          color: emotion.color,
          description: emotion.description,
        },
        timestamp,
        context,
        notes,
      }),
    }).catch(err => {
      console.debug('Falha ao sincronizar emoção com servidor:', err);
    });
  }, [storageKey]);

  const clearEmotion = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_last_update`);
    setCurrentEmotion(null);

    // Remover do servidor em background
    fetch('/api/emotion-sync', {
      method: 'DELETE',
      credentials: 'include',
    }).catch(err => {
      console.debug('Falha ao remover emoção do servidor:', err);
    });
  }, [storageKey]);

  const getEmotionByDate = useCallback((date: string): EmotionRecord | undefined => {
    return emotionHistory.find((record) => record.date === date);
  }, [emotionHistory]);

  const getAllEmotionsForDate = useCallback((date: string): EmotionRecord[] => {
    return emotionHistory.filter((record) => record.date === date);
  }, [emotionHistory]);

  const getMostFrequentEmotion = useCallback((): Emotion | null => {
    if (emotionHistory.length === 0) return null;

    const counts = new Map<string, number>();
    emotionHistory.forEach((record) => {
      counts.set(record.emotion.id, (counts.get(record.emotion.id) || 0) + 1);
    });

    let maxCount = 0;
    let mostFrequent: string | null = null;
    counts.forEach((count, id) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = id;
      }
    });

    if (!mostFrequent) return null;
    return EMOTIONS.find((e) => e.id === mostFrequent) || null;
  }, [emotionHistory]);

  // Memoizar o retorno para estabilizar referências
  return useMemo(() => ({
    currentEmotion,
    emotionHistory,
    setEmotion,
    clearEmotion,
    getEmotionByDate,
    getAllEmotionsForDate,
    getMostFrequentEmotion,
    syncFromServer,
    isLoading,
    isSyncing,
    lastSyncedAt,
  }), [
    currentEmotion,
    emotionHistory,
    setEmotion,
    clearEmotion,
    getEmotionByDate,
    getAllEmotionsForDate,
    getMostFrequentEmotion,
    syncFromServer,
    isLoading,
    isSyncing,
    lastSyncedAt,
  ]);
}

export { EMOTIONS };
