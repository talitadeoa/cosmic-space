'use client';

import { useState, useEffect } from 'react';
import type { Emotion, EmotionRecord } from '@/components/EmotionalInput';

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
  setEmotion: (emotion: Emotion) => void;
  clearEmotion: () => void;
  getEmotionByDate: (date: string) => EmotionRecord | undefined;
  getAllEmotionsForDate: (date: string) => EmotionRecord[];
  getMostFrequentEmotion: () => Emotion | null;
  isLoading: boolean;
}

/**
 * Hook para gerenciar emoções com persistência
 * @param storageKey - Chave do localStorage (padrão: 'current_emotion')
 * @returns Objeto com estado e funções de emoção
 */
export function useEmotionalInput(
  storageKey: string = 'current_emotion'
): UseEmotionalInputReturn {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const setEmotion = (emotion: Emotion) => {
    // Salvar como emoção atual
    localStorage.setItem(storageKey, JSON.stringify(emotion));
    setCurrentEmotion(emotion);

    // Adicionar ao histórico
    const today = new Date().toISOString().split('T')[0];
    const newRecord: EmotionRecord = {
      emotion,
      timestamp: new Date().toISOString(),
      date: today,
    };

    const updated = [newRecord, ...emotionHistory].slice(0, 100);
    localStorage.setItem(`${storageKey}_history`, JSON.stringify(updated));
    setEmotionHistory(updated);
  };

  const clearEmotion = () => {
    localStorage.removeItem(storageKey);
    setCurrentEmotion(null);
  };

  const getEmotionByDate = (date: string): EmotionRecord | undefined => {
    return emotionHistory.find((record) => record.date === date);
  };

  const getAllEmotionsForDate = (date: string): EmotionRecord[] => {
    return emotionHistory.filter((record) => record.date === date);
  };

  const getMostFrequentEmotion = (): Emotion | null => {
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
  };

  return {
    currentEmotion,
    emotionHistory,
    setEmotion,
    clearEmotion,
    getEmotionByDate,
    getAllEmotionsForDate,
    getMostFrequentEmotion,
    isLoading,
  };
}

export { EMOTIONS };
