'use client';

import { useState, useEffect } from 'react';

export interface MenstrualRecord {
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

export interface CycleAnalysis {
  totalRecords: number;
  averageCycleDays: number;
  lastMenstruationDate: string | null;
  nextEstimatedDate: string | null;
  mostCommonSymptoms: string[];
  mostCommonFlowIntensity: 'light' | 'moderate' | 'heavy';
  moonPhaseDistribution: Record<string, number>;
  zodiacDistribution: Record<string, number>;
  cycleHistory: Array<{
    startDate: string;
    endDate: string;
    durationDays: number;
  }>;
}

const AVERAGE_CYCLE_LENGTH = 28; // dias

/**
 * Hook para gerenciar registros de ciclo menstrual
 * Salva automaticamente no localStorage
 */
export function useMenstrualCycle(storageKey: string = 'menstrual_records') {
  const [records, setRecords] = useState<MenstrualRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<CycleAnalysis | null>(null);

  // Carregar registros ao montar
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecords(parsed);
        calculateAnalysis(parsed);
      } catch (e) {
        console.error('Erro ao carregar ciclos:', e);
      }
    }
    setIsLoading(false);
  }, [storageKey]);

  const calculateAnalysis = (recordList: MenstrualRecord[]): CycleAnalysis => {
    if (recordList.length === 0) {
      return {
        totalRecords: 0,
        averageCycleDays: AVERAGE_CYCLE_LENGTH,
        lastMenstruationDate: null,
        nextEstimatedDate: null,
        mostCommonSymptoms: [],
        mostCommonFlowIntensity: 'moderate',
        moonPhaseDistribution: {},
        zodiacDistribution: {},
        cycleHistory: [],
      };
    }

    // Ordenar por data
    const sorted = [...recordList].sort(
      (a, b) => new Date(b.menstruationDate).getTime() - new Date(a.menstruationDate).getTime()
    );

    const lastDate = sorted[0]?.menstruationDate;

    // Calcular ciclos
    const cycleHistory = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i].menstruationDate);
      const next = new Date(sorted[i + 1].menstruationDate);
      const diff = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0 && diff < 100) {
        cycleHistory.push({
          startDate: sorted[i + 1].menstruationDate,
          endDate: sorted[i].menstruationDate,
          durationDays: diff,
        });
      }
    }

    // Média de ciclos
    const avgCycle =
      cycleHistory.length > 0
        ? Math.round(cycleHistory.reduce((sum, c) => sum + c.durationDays, 0) / cycleHistory.length)
        : AVERAGE_CYCLE_LENGTH;

    // Próxima menstruação estimada
    let nextEstimated = null;
    if (lastDate) {
      const lastDateObj = new Date(lastDate);
      const nextDateObj = new Date(lastDateObj.getTime() + avgCycle * 24 * 60 * 60 * 1000);
      nextEstimated = nextDateObj.toISOString().split('T')[0];
    }

    // Sintomas mais comuns
    const symptomCount = new Map<string, number>();
    recordList.forEach((record) => {
      record.symptoms.forEach((symptom) => {
        symptomCount.set(symptom, (symptomCount.get(symptom) || 0) + 1);
      });
    });
    const mostCommonSymptoms = Array.from(symptomCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0]);

    // Intensidade mais comum
    const flowCount = new Map<'light' | 'moderate' | 'heavy', number>();
    recordList.forEach((record) => {
      flowCount.set(record.flowIntensity, (flowCount.get(record.flowIntensity) || 0) + 1);
    });
    const mostCommonFlow = Array.from(flowCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'moderate';

    // Distribuição de fases lunares
    const moonPhases = new Map<string, number>();
    recordList.forEach((record) => {
      moonPhases.set(record.moonPhase, (moonPhases.get(record.moonPhase) || 0) + 1);
    });
    const moonPhaseDistribution = Object.fromEntries(moonPhases);

    // Distribuição de signos
    const zodiacSigns = new Map<string, number>();
    recordList.forEach((record) => {
      zodiacSigns.set(record.zodiacSign, (zodiacSigns.get(record.zodiacSign) || 0) + 1);
    });
    const zodiacDistribution = Object.fromEntries(zodiacSigns);

    const result: CycleAnalysis = {
      totalRecords: recordList.length,
      averageCycleDays: avgCycle,
      lastMenstruationDate: lastDate,
      nextEstimatedDate: nextEstimated,
      mostCommonSymptoms,
      mostCommonFlowIntensity: mostCommonFlow,
      moonPhaseDistribution,
      zodiacDistribution,
      cycleHistory,
    };

    setAnalysis(result);
    return result;
  };

  const addRecord = (record: MenstrualRecord) => {
    const updated = [record, ...records];
    setRecords(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    calculateAnalysis(updated);
  };

  const updateRecord = (id: string, updates: Partial<MenstrualRecord>) => {
    const updated = records.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRecords(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    calculateAnalysis(updated);
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    calculateAnalysis(updated);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ciclos_menstruais_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getDaysUntilNextCycle = (): number | null => {
    if (!analysis?.nextEstimatedDate) return null;
    const next = new Date(analysis.nextEstimatedDate);
    const today = new Date();
    const diff = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isInCycleWindow = (): boolean => {
    const daysUntil = getDaysUntilNextCycle();
    if (!daysUntil) return false;
    return daysUntil >= -2 && daysUntil <= 2; // ±2 dias da data estimada
  };

  return {
    records,
    analysis,
    isLoading,
    addRecord,
    updateRecord,
    deleteRecord,
    exportData,
    getDaysUntilNextCycle,
    isInCycleWindow,
  };
}
