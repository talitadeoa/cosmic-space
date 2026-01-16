'use client';

import { useState, useEffect } from 'react';
import { useLunarPhase } from '@/hooks/useLunationCache';
import { useCycle, type CycleRecord } from '@/hooks/useCycle';

// Re-exportar tipo para compatibilidade
export type { CycleRecord };

interface CycleInputCompactProps {
  onRecordAdd?: (record: CycleRecord) => void;
  disabled?: boolean;
}

const FLOW_OPTIONS = [
  { value: 'light', label: 'Leve', emoji: '💧', color: 'from-pink-300 to-pink-400' },
  { value: 'moderate', label: 'Moderado', emoji: '💧💧', color: 'from-pink-400 to-rose-500' },
  { value: 'heavy', label: 'Intenso', emoji: '💧💧💧', color: 'from-rose-500 to-red-500' },
];

const SYMPTOMS = [
  { id: 'cramps', label: 'Cólicas', emoji: '😣' },
  { id: 'headache', label: 'Cabeça', emoji: '🤕' },
  { id: 'fatigue', label: 'Cansaço', emoji: '😴' },
  { id: 'bloating', label: 'Inchaço', emoji: '🫧' },
  { id: 'mood', label: 'Humor', emoji: '🎭' },
  { id: 'back_pain', label: 'Costas', emoji: '🛌' },
  { id: 'anxiety', label: 'Ansiedade', emoji: '😰' },
  { id: 'sensitive', label: 'Sensível', emoji: '💗' },
];

/**
 * Componente compacto e intuitivo para registro de ciclo
 * Similar ao EmotionalInputCompact - feedback visual imediato
 * Sincroniza automaticamente com o banco de dados
 */
export default function CycleInputCompact({
  onRecordAdd,
  disabled = false,
}: CycleInputCompactProps) {
  // Hook com sincronização
  const { cycles, addCycle, isSyncing, lastCycle } = useCycle();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dateObj = new Date(selectedDate + 'T12:00:00');
  // Novo cache com deduplica automática
  const { data: lunarData, isLoading: lunarLoading } = useLunarPhase(dateObj, { includeZodiac: true });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [flowIntensity, setFlowIntensity] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [moonData, setMoonData] = useState<{ faseLua: string; signo: string } | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Atualizar dados lunares quando dados chegam
  useEffect(() => {
    if (lunarData) {
      setMoonData({
        faseLua: lunarData.phase || 'N/A',
        signo: lunarData.zodiac_sign || 'N/A',
      });
    }
  }, [lunarData]);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((s) => s !== symptomId) : [...prev, symptomId]
    );
  };

  const handleSave = async () => {
    if (disabled || isSaving) return;
    
    setIsSaving(true);

    const success = await addCycle({
      date: selectedDate,
      flowIntensity,
      symptoms: selectedSymptoms,
      notes: notes || undefined,
      moonPhase: moonData?.faseLua
    });

    if (success) {
      // Feedback visual
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);

      // Callback externo
      if (onRecordAdd) {
        onRecordAdd({
          date: selectedDate,
          flowIntensity,
          symptoms: selectedSymptoms,
          notes,
          moonPhase: moonData?.faseLua
        });
      }

      // Resetar form
      setFlowIntensity('moderate');
      setSelectedSymptoms([]);
      setNotes('');
      setIsExpanded(false);
    }
    
    setIsSaving(false);
  };

  // Calcular dias desde último ciclo
  const daysSinceLastCycle = lastCycle
    ? Math.floor(
        (new Date().getTime() - new Date(lastCycle.date).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="w-full space-y-3">
      {/* Feedback de salvo */}
      {justSaved && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-center gap-2 text-emerald-300 font-medium text-sm">
            <span>✓</span>
            <span>Ciclo registrado com sucesso!</span>
          </div>
        </div>
      )}

      {/* Status atual */}
      {lastCycle && !isExpanded && !justSaved && (
        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-rose-300 text-sm">🌸</span>
              <div>
                <p className="text-xs text-rose-300/70">Último registro</p>
                <p className="text-sm font-medium text-rose-200">
                  {new Date(lastCycle.date).toLocaleDateString('pt-BR')}
                  {daysSinceLastCycle !== null && (
                    <span className="text-rose-300/60 ml-2">
                      (há {daysSinceLastCycle} dias)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSyncing && (
                <span className="text-xs text-rose-300/50">↻</span>
              )}
              <span className="text-lg">
                {FLOW_OPTIONS.find((f) => f.value === lastCycle.flowIntensity)?.emoji}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botão principal */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl font-medium transition-all duration-300
            bg-gradient-to-r from-rose-500/20 to-pink-500/20 
            border border-rose-400/40 hover:border-rose-400/70
            text-rose-200 hover:text-white
            hover:shadow-lg hover:shadow-rose-500/20
            active:scale-[0.98]
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className="flex items-center justify-center gap-2">
            <span>🌸</span>
            <span>Registrar Ciclo</span>
          </span>
        </button>
      )}

      {/* Form expandido */}
      {isExpanded && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 to-pink-950/40 border border-rose-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-rose-200 flex items-center gap-2">
              🌸 Novo registro
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-rose-300/60 hover:text-rose-200 text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-medium text-rose-300/70 mb-1.5">
              📅 Quando começou?
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-white text-sm focus:border-rose-400 focus:outline-none"
            />
            {moonData && (
              <div className="flex gap-3 mt-2 text-xs text-rose-300/60">
                <span>🌙 {moonData.faseLua}</span>
                <span>♈ {moonData.signo}</span>
              </div>
            )}
          </div>

          {/* Intensidade */}
          <div>
            <label className="block text-xs font-medium text-rose-300/70 mb-2">
              💧 Intensidade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FLOW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFlowIntensity(option.value as 'light' | 'moderate' | 'heavy')}
                  className={`
                    p-2.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${
                      flowIntensity === option.value
                        ? `bg-gradient-to-br ${option.color} text-white shadow-lg ring-2 ring-white/30`
                        : 'bg-rose-900/30 border border-rose-500/30 text-rose-200 hover:border-rose-400/50'
                    }
                  `}
                >
                  <span className="block text-base mb-0.5">{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sintomas */}
          <div>
            <label className="block text-xs font-medium text-rose-300/70 mb-2">
              🎭 Como você está? (opcional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOMS.map((symptom) => (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => handleSymptomToggle(symptom.id)}
                  className={`
                    px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-rose-500/50 border border-rose-300/50 text-white'
                        : 'bg-rose-900/20 border border-rose-500/20 text-rose-200/70 hover:border-rose-400/40'
                    }
                  `}
                >
                  {symptom.emoji} {symptom.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-medium text-rose-300/70 mb-1.5">
              📝 Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Como você está se sentindo?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-100 placeholder-rose-400/40 text-sm focus:border-rose-400 focus:outline-none resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`
                flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 
                text-white font-medium text-sm hover:shadow-lg hover:shadow-rose-500/30 
                transition-all duration-300 active:scale-[0.98]
                ${isSaving ? 'opacity-70 cursor-wait' : ''}
              `}
            >
              {isSaving ? '⏳ Salvando...' : '✨ Registrar'}
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-lg bg-rose-900/30 border border-rose-500/30 text-rose-200 font-medium text-sm hover:border-rose-400/50 transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { FLOW_OPTIONS, SYMPTOMS };
