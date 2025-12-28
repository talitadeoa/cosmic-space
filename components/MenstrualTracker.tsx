'use client';

import React, { useState, useEffect } from 'react';
import { getLunarPhaseAndSign } from '@/lib/astro';

interface MenstrualRecord {
  id: string;
  date: string;
  menstruationDate: string;
  moonPhase: string;
  zodiacSign: string;
  flowIntensity: 'light' | 'moderate' | 'heavy';
  symptoms: string[];
  notes: string;
  recordedAt: string;
}

interface MenstrualTrackerProps {
  isEnabled: boolean; // true se women = true
  onRecordAdd?: (record: MenstrualRecord) => void;
  existingRecords?: MenstrualRecord[];
}

const FLOW_INTENSITY_OPTIONS = [
  { value: 'light', label: 'Leve', emoji: '🌧️' },
  { value: 'moderate', label: 'Moderada', emoji: '🌧️🌧️' },
  { value: 'heavy', label: 'Forte', emoji: '⛈️' },
];

const COMMON_SYMPTOMS = [
  { id: 'cramps', label: 'Cólicas', emoji: '😣' },
  { id: 'headache', label: 'Dor de cabeça', emoji: '🤕' },
  { id: 'fatigue', label: 'Cansaço', emoji: '😴' },
  { id: 'bloating', label: 'Inchaço', emoji: '💨' },
  { id: 'mood', label: 'Variação de humor', emoji: '🎭' },
  { id: 'acne', label: 'Acne', emoji: '😖' },
  { id: 'back_pain', label: 'Dor nas costas', emoji: '🛌' },
  { id: 'anxiety', label: 'Ansiedade', emoji: '😰' },
];

export default function MenstrualTracker({
  isEnabled,
  onRecordAdd,
  existingRecords = []
}: MenstrualTrackerProps) {
  const [records, setRecords] = useState<MenstrualRecord[]>(existingRecords);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [flowIntensity, setFlowIntensity] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [currentMoonData, setCurrentMoonData] = useState<any>(null);

  useEffect(() => {
    // Obter dados lunares e zodiacais da data selecionada
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const moonData = getLunarPhaseAndSign(selectedDateObj);
    setCurrentMoonData(moonData);
  }, [selectedDate]);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((s) => s !== symptomId) : [...prev, symptomId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRecord: MenstrualRecord = {
      id: `menstrual_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      menstruationDate: selectedDate,
      moonPhase: currentMoonData?.faseLua || 'N/A',
      zodiacSign: currentMoonData?.signo || 'N/A',
      flowIntensity,
      symptoms: selectedSymptoms,
      notes,
      recordedAt: new Date().toISOString(),
    };

    setRecords((prev) => [newRecord, ...prev]);
    onRecordAdd?.(newRecord);

    // Salvar no localStorage
    const allRecords = [newRecord, ...records];
    localStorage.setItem('menstrual_records', JSON.stringify(allRecords));

    // Resetar form
    setFlowIntensity('moderate');
    setSelectedSymptoms([]);
    setNotes('');
    setShowForm(false);
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Botão para abrir form */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-400/50 hover:border-pink-400 text-pink-200 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20"
        >
          📍 Registrar Menstruação
        </button>
      )}

      {/* Form de registro */}
      {showForm && (
        <div className="mt-4 p-6 rounded-lg bg-gradient-to-br from-pink-950/30 to-red-950/30 border border-pink-500/30 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-pink-200">📋 Registrar Menstruação</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-pink-300/60 hover:text-pink-200 text-2xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-pink-200 mb-2">
                📅 Data da Menstruação
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-pink-950/50 border border-pink-500/30 text-white focus:border-pink-400 focus:outline-none"
              />
            </div>

            {/* Fase Lunar e Signo */}
            {currentMoonData && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-pink-900/20 border border-pink-500/20">
                <div>
                  <p className="text-xs text-pink-300/70 font-medium">🌙 Fase Lunar</p>
                  <p className="text-sm font-semibold text-pink-200">{currentMoonData.faseLua}</p>
                </div>
                <div>
                  <p className="text-xs text-pink-300/70 font-medium">♈ Signo</p>
                  <p className="text-sm font-semibold text-pink-200">{currentMoonData.signo}</p>
                </div>
              </div>
            )}

            {/* Intensidade do fluxo */}
            <div>
              <label className="block text-sm font-medium text-pink-200 mb-3">
                💧 Intensidade do Fluxo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FLOW_INTENSITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFlowIntensity(option.value as 'light' | 'moderate' | 'heavy')}
                    className={`p-3 rounded-lg font-medium transition-all duration-300 ${
                      flowIntensity === option.value
                        ? 'bg-pink-500/50 border-2 border-pink-300 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-pink-900/20 border-2 border-pink-500/30 text-pink-200 hover:border-pink-400/50'
                    }`}
                  >
                    {option.emoji} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sintomas */}
            <div>
              <label className="block text-sm font-medium text-pink-200 mb-3">
                🎭 Sintomas (selecione quantos quiser)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_SYMPTOMS.map((symptom) => (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => handleSymptomToggle(symptom.id)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-pink-500/50 border-2 border-pink-300 text-white'
                        : 'bg-pink-900/20 border-2 border-pink-500/30 text-pink-200 hover:border-pink-400/50'
                    }`}
                  >
                    {symptom.emoji} {symptom.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-pink-200 mb-2">
                📝 Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Como você se sentiu neste dia? Algo especial?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-pink-950/50 border border-pink-500/30 text-pink-100 placeholder-pink-400/50 focus:border-pink-400 focus:outline-none resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
              >
                ✨ Registrar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-pink-900/30 border border-pink-500/30 text-pink-200 font-semibold hover:border-pink-400/50 transition-all duration-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Histórico de registros */}
      {records.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-pink-300 uppercase tracking-wider">
            📊 Histórico ({records.length} registros)
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {records.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-lg bg-pink-950/20 border border-pink-500/20 hover:border-pink-400/50 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-pink-200">{record.menstruationDate}</p>
                    <p className="text-xs text-pink-300/60">
                      Registrado em {new Date(record.recordedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-pink-500/30 text-pink-200">
                    {FLOW_INTENSITY_OPTIONS.find((o) => o.value === record.flowIntensity)?.emoji}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-pink-900/30 p-2 rounded">
                    <p className="text-pink-300/60">🌙 Fase</p>
                    <p className="font-medium text-pink-200">{record.moonPhase}</p>
                  </div>
                  <div className="bg-pink-900/30 p-2 rounded">
                    <p className="text-pink-300/60">♈ Signo</p>
                    <p className="font-medium text-pink-200">{record.zodiacSign}</p>
                  </div>
                </div>

                {record.symptoms.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-pink-300/60 mb-1">Sintomas:</p>
                    <div className="flex flex-wrap gap-1">
                      {record.symptoms.map((symptomId) => {
                        const symptom = COMMON_SYMPTOMS.find((s) => s.id === symptomId);
                        return (
                          <span
                            key={symptomId}
                            className="text-xs px-2 py-1 rounded-full bg-pink-500/20 text-pink-200"
                          >
                            {symptom?.emoji} {symptom?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {record.notes && (
                  <p className="text-xs text-pink-300/70 bg-pink-900/20 p-2 rounded">
                    {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
