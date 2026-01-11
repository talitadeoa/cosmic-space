'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CycleRecord {
  id?: string;
  date: string;
  flowIntensity: 'light' | 'moderate' | 'heavy';
  symptoms: string[];
  notes?: string;
  moonPhase?: string;
  recordedAt?: string;
  updatedAt?: string;
}

interface UseCycleOptions {
  autoSync?: boolean;
}

interface UseCycleReturn {
  cycles: CycleRecord[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
  addCycle: (record: Omit<CycleRecord, 'id' | 'recordedAt' | 'updatedAt'>) => Promise<boolean>;
  removeCycle: (date: string) => Promise<boolean>;
  getCycleByDate: (date: string) => CycleRecord | undefined;
  syncFromServer: () => Promise<void>;
  hasCycleToday: boolean;
  lastCycle: CycleRecord | null;
}

const STORAGE_KEY = 'cosmic-cycles';

export function useCycle(options: UseCycleOptions = {}): UseCycleReturn {
  const { autoSync = true } = options;
  
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CycleRecord[];
        setCycles(parsed);
      }
    } catch (err) {
      console.error('Erro ao carregar ciclos do localStorage:', err);
    }
    setIsLoading(false);
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (!isLoading && cycles.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cycles));
    }
  }, [cycles, isLoading]);

  // Sincronizar do servidor
  const syncFromServer = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);

      const response = await fetch('/api/cycle-sync', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 401) {
        // Usuário não autenticado, usar apenas localStorage
        return;
      }

      if (!response.ok) {
        throw new Error('Falha ao sincronizar ciclos');
      }

      const data = await response.json();
      
      if (data.success && data.cycles) {
        setCycles(data.cycles);
        setLastSyncedAt(new Date());
      }
    } catch (err) {
      console.error('Erro ao sincronizar ciclos:', err);
      setError('Falha ao sincronizar com o servidor');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Auto-sync na montagem
  useEffect(() => {
    if (autoSync && !isLoading) {
      syncFromServer();
    }
  }, [autoSync, isLoading, syncFromServer]);

  // Adicionar novo registro de ciclo
  const addCycle = useCallback(async (record: Omit<CycleRecord, 'id' | 'recordedAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      setError(null);

      const newRecord: CycleRecord = {
        ...record,
        recordedAt: new Date().toISOString()
      };

      // Atualiza localmente primeiro (otimista)
      setCycles(prev => {
        const filtered = prev.filter(c => c.date !== record.date);
        return [newRecord, ...filtered].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      // Sincroniza com o servidor
      const response = await fetch('/api/cycle-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: record.date,
          flow_intensity: record.flowIntensity,
          symptoms: record.symptoms,
          notes: record.notes,
          moon_phase: record.moonPhase
        })
      });

      if (response.status === 401) {
        // Não autenticado, mantém apenas local
        return true;
      }

      if (!response.ok) {
        throw new Error('Falha ao salvar ciclo');
      }

      const data = await response.json();
      
      if (data.success && data.cycle) {
        // Atualiza com dados do servidor (inclui ID)
        setCycles(prev => {
          const filtered = prev.filter(c => c.date !== data.cycle.date);
          return [data.cycle, ...filtered].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
      }

      return true;
    } catch (err) {
      console.error('Erro ao adicionar ciclo:', err);
      setError('Falha ao salvar registro');
      return false;
    }
  }, []);

  // Remover registro de ciclo
  const removeCycle = useCallback(async (date: string): Promise<boolean> => {
    try {
      setError(null);

      // Remove localmente primeiro
      setCycles(prev => prev.filter(c => c.date !== date));

      // Remove do servidor
      const response = await fetch(`/api/cycle-sync?date=${date}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.status === 401) {
        // Não autenticado, só remove local
        return true;
      }

      if (!response.ok && response.status !== 404) {
        throw new Error('Falha ao remover ciclo');
      }

      return true;
    } catch (err) {
      console.error('Erro ao remover ciclo:', err);
      setError('Falha ao remover registro');
      return false;
    }
  }, []);

  // Buscar ciclo por data
  const getCycleByDate = useCallback((date: string): CycleRecord | undefined => {
    return cycles.find(c => c.date === date);
  }, [cycles]);

  // Verifica se há ciclo registrado hoje
  const today = new Date().toISOString().split('T')[0];
  const hasCycleToday = cycles.some(c => c.date === today);

  // Último ciclo registrado
  const lastCycle = cycles.length > 0 ? cycles[0] : null;

  return {
    cycles,
    isLoading,
    isSyncing,
    lastSyncedAt,
    error,
    addCycle,
    removeCycle,
    getCycleByDate,
    syncFromServer,
    hasCycleToday,
    lastCycle
  };
}

export default useCycle;
