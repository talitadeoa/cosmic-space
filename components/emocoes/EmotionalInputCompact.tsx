'use client';

import { useState, useEffect } from 'react';
import type { Emotion, EmotionRecord } from '@/components/EmotionalInput';

interface EmotionalInputCompactProps {
  onEmotionSelect?: (emotion: Emotion) => void;
  selectedEmotion?: Emotion | null;
  disabled?: boolean;
  storageKey?: string;
  label?: string;
  showSelected?: boolean;
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

/**
 * Versão compacta do EmotionalInput para uso em modais
 * - Sem histórico
 * - Tamanho reduzido
 * - Layout horizontal scrollável
 * - Feedback visual mínimo
 */
export default function EmotionalInputCompact({
  onEmotionSelect,
  selectedEmotion,
  disabled = false,
  storageKey = 'current_emotion',
  label = 'Como você está?',
  showSelected = true,
}: EmotionalInputCompactProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [loadedEmotion, setLoadedEmotion] = useState<Emotion | null>(selectedEmotion || null);

  // Carregar emoção salva ao montar
  useEffect(() => {
    if (selectedEmotion) {
      setLoadedEmotion(selectedEmotion);
      return;
    }
    
    const savedEmotion = localStorage.getItem(storageKey);
    if (savedEmotion) {
      try {
        const emotion = JSON.parse(savedEmotion);
        setLoadedEmotion(emotion);
      } catch (e) {
        console.error('Erro ao carregar emoção:', e);
      }
    }
  }, [storageKey, selectedEmotion]);

  const handleSelect = (emotion: Emotion) => {
    if (!disabled) {
      // Salvar emoção atual
      localStorage.setItem(storageKey, JSON.stringify(emotion));

      // Adicionar ao histórico
      const today = new Date().toISOString().split('T')[0];
      const newRecord: EmotionRecord = {
        emotion,
        timestamp: new Date().toISOString(),
        date: today,
      };

      const existingHistory = localStorage.getItem(`${storageKey}_history`);
      let history: EmotionRecord[] = [];
      try {
        history = existingHistory ? JSON.parse(existingHistory) : [];
      } catch {
        history = [];
      }

      const updatedHistory = [newRecord, ...history].slice(0, 30);
      localStorage.setItem(`${storageKey}_history`, JSON.stringify(updatedHistory));

      // Atualizar emoção local
      setLoadedEmotion(emotion);

      // Callback
      onEmotionSelect?.(emotion);
    }
  };

  const currentEmotion = selectedEmotion || loadedEmotion;

  return (
    <div className="w-full space-y-2">
      {/* Label opcional */}
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">{label}</span>
          {showSelected && currentEmotion && (
            <span className="text-xs text-slate-400">
              {currentEmotion.emoji} {currentEmotion.label}
            </span>
          )}
        </div>
      )}

      {/* Grid de emoções compacto */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {EMOTIONS.map((emotion) => {
          const isSelected = currentEmotion?.id === emotion.id;
          
          return (
            <button
              key={emotion.id}
              onClick={() => handleSelect(emotion)}
              onMouseEnter={() => setHovered(emotion.id)}
              onMouseLeave={() => setHovered(null)}
              disabled={disabled}
              className={`
                relative w-9 h-9 flex items-center justify-center rounded-lg
                text-xl transition-all duration-200 ease-out
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
                ${
                  isSelected
                    ? `ring-2 ring-white/50 ring-offset-1 ring-offset-transparent shadow-lg bg-gradient-to-br ${emotion.color}`
                    : 'hover:bg-white/10'
                }
                focus:outline-none focus:ring-2 focus:ring-white/40
              `}
              title={`${emotion.label} - ${emotion.description}`}
              aria-label={`${emotion.label} - ${emotion.description}`}
            >
              <span className="select-none">{emotion.emoji}</span>

              {/* Tooltip compacto */}
              {hovered === emotion.id && !isSelected && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900/95 text-white text-[10px] font-medium rounded-md whitespace-nowrap pointer-events-none z-20 animate-in fade-in slide-in-from-bottom-1 duration-150 border border-white/10">
                  {emotion.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900/95" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { EMOTIONS };
export type { EmotionalInputCompactProps };
