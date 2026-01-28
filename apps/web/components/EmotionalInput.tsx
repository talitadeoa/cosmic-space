'use client';

import { useState, useEffect } from 'react';

interface EmotionalInputProps {
  onEmotionSelect?: (emotion: Emotion) => void;
  selectedEmotion?: Emotion | null;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  disabled?: boolean;
  storageKey?: string;
  showHistory?: boolean;
}

export interface Emotion {
  id: string;
  emoji: string;
  label: string;
  color: string;
  description: string;
}

export interface EmotionRecord {
  emotion: Emotion;
  timestamp: string;
  date: string;
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

const sizeClasses = {
  sm: 'text-3xl gap-2 p-2',
  md: 'text-5xl gap-3 p-3',
  lg: 'text-7xl gap-4 p-4',
};

const buttonSizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

export default function EmotionalInput({
  onEmotionSelect,
  selectedEmotion,
  size = 'md',
  showLabels = false,
  disabled = false,
  storageKey = 'current_emotion',
  showHistory = true,
}: EmotionalInputProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  const [loadedEmotion, setLoadedEmotion] = useState<Emotion | null>(selectedEmotion || null);
  const [justSaved, setJustSaved] = useState(false);
  const [savedEmoji, setSavedEmoji] = useState<string | null>(null);

  // Carregar emoção salva ao montar
  useEffect(() => {
    const savedEmotion = localStorage.getItem(storageKey);
    if (savedEmotion) {
      try {
        const emotion = JSON.parse(savedEmotion);
        setLoadedEmotion(emotion);
      } catch (e) {
        console.error('Erro ao carregar emoção:', e);
      }
    }

    // Carregar histórico
    const history = localStorage.getItem(`${storageKey}_history`);
    if (history) {
      try {
        setEmotionHistory(JSON.parse(history));
      } catch (e) {
        console.error('Erro ao carregar histórico:', e);
      }
    }
  }, [storageKey]);

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

      const updatedHistory = [newRecord, ...emotionHistory].slice(0, 30); // Guardar últimos 30
      localStorage.setItem(`${storageKey}_history`, JSON.stringify(updatedHistory));
      setEmotionHistory(updatedHistory);

      // Atualizar emoção local
      setLoadedEmotion(emotion);

      // Mostrar feedback visual
      setSavedEmoji(emotion.emoji);
      setJustSaved(true);
      setTimeout(() => {
        setJustSaved(false);
        setSavedEmoji(null);
      }, 2500);

      // Callback
      onEmotionSelect?.(emotion);
    }
  };

  return (
    <div className="w-full">
      {/* Feedback de salvo */}
      {justSaved && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-400/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-center gap-2 text-emerald-300 font-medium">
            <span className="text-2xl">{savedEmoji}</span>
            <span>✓ Emoção registrada com sucesso!</span>
          </div>
        </div>
      )}

      {(selectedEmotion || loadedEmotion) && !justSaved && (
        <div
          className={`mb-4 p-4 rounded-lg bg-gradient-to-r ${(selectedEmotion || loadedEmotion)!.color} bg-opacity-20 border border-current border-opacity-20`}
        >
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Emoção selecionada
          </p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{(selectedEmotion || loadedEmotion)!.emoji}</span>
            <div>
              <p className="font-semibold text-lg">{(selectedEmotion || loadedEmotion)!.label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(selectedEmotion || loadedEmotion)!.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Como você está se sentindo?
        </label>
        {!loadedEmotion && !selectedEmotion && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Toque em um emoji para registrar sua emoção
          </p>
        )}
      </div>

      <div
        className={`flex flex-wrap ${sizeClasses[size]} rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 border border-gray-200 dark:border-gray-700`}
      >
        {EMOTIONS.map((emotion) => {
          const isSelected = (selectedEmotion?.id || loadedEmotion?.id) === emotion.id;
          const wasJustSaved = justSaved && savedEmoji === emotion.emoji;
          
          return (
            <button
              key={emotion.id}
              onClick={() => handleSelect(emotion)}
              onMouseEnter={() => setHovered(emotion.id)}
              onMouseLeave={() => setHovered(null)}
              disabled={disabled}
              className={`
                ${buttonSizeClasses[size]}
                relative flex items-center justify-center rounded-xl
                transition-all duration-300 ease-out
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110 active:scale-95'}
                ${
                  isSelected
                    ? `ring-4 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 shadow-lg bg-gradient-to-br ${emotion.color} ${wasJustSaved ? 'ring-emerald-400' : ''}`
                    : 'hover:shadow-lg hover:bg-white dark:hover:bg-gray-700'
                }
                focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2
              `}
              title={`${emotion.label} - ${emotion.description}`}
              aria-label={`Selecionar ${emotion.label}`}
            >
              <span className="select-none">{emotion.emoji}</span>

              {/* Checkmark quando acabou de salvar */}
              {wasJustSaved && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-in zoom-in duration-200 shadow-lg">
                  ✓
                </span>
              )}

              {/* Tooltip */}
              {hovered === emotion.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold rounded-lg whitespace-nowrap pointer-events-none z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {emotion.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showLabels && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {EMOTIONS.map((emotion) => (
            <div
              key={emotion.id}
              className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 p-1"
            >
              <p className="truncate">{emotion.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Histórico de emoções */}
      {showHistory && emotionHistory.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📊 Histórico de Emoções
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {emotionHistory.map((record, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors duration-300"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{record.emotion.emoji}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {record.emotion.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(record.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-500">{record.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
