'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Componente que sincroniza lunações do banco de dados
 * Executa automaticamente ao montar
 *
 * Uso:
 *   <LunationSync autoSync={true} years={[2024, 2025]} onSuccess={handleSuccess} />
 */

interface LunationSyncProps {
  autoSync?: boolean;
  years?: number[];
  onSuccess?: (count: number) => void;
  onError?: (error: string) => void;
  verbose?: boolean;
}

export function LunationSync({
  autoSync = true,
  years = [],
  onSuccess,
  onError,
  verbose = false,
}: LunationSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  // useRef para evitar re-execução do effect quando anos são sincronizados
  const syncedYearsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!autoSync) return;

    const yearsToSync =
      years.length > 0
        ? years
        : [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

    async function sync() {
      for (const year of yearsToSync) {
        if (syncedYearsRef.current.has(year)) {
          if (verbose) console.warn(`⏭️  Pulando ${year} (já sincronizado)`);
          continue;
        }

        try {
          setIsSyncing(true);

          const startDate = `${year}-01-01`;
          const endDate = `${year}-12-31`;

          if (verbose) console.warn(`🌙 Sincronizando lunações para ${year}...`);

          // 1. Verificar se já existem dados no banco
          const checkResponse = await fetch(
            `/api/moons/lunations?start=${startDate}&end=${endDate}&source=auto`
          );

          const existingData = checkResponse.ok ? await checkResponse.json() : null;

          if (existingData?.days?.length > 0) {
            if (verbose)
              console.warn(`✅ ${year} já sincronizado (${existingData.days.length} dias)`);
            syncedYearsRef.current.add(year);
            if (onSuccess) onSuccess(existingData.days.length);
            continue;
          }

          // 2. Gerar dados localmente
          if (verbose) console.warn(`📊 Gerando dados para ${year}...`);
          const generateResponse = await fetch(
            `/api/moons/lunations?start=${startDate}&end=${endDate}&source=generated`
          );

          if (!generateResponse.ok) {
            throw new Error(`Erro ao gerar dados: ${generateResponse.status}`);
          }

          const { days } = await generateResponse.json();
          if (!Array.isArray(days) || days.length === 0) {
            throw new Error(`Nenhum dia gerado para ${year}`);
          }
          if (verbose) console.warn(`✨ ${days.length} dias gerados`);

          // 3. Salvar no banco
          if (verbose) console.warn(`📤 Salvando no banco...`);
          const saveResponse = await fetch('/api/moons/lunations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              days,
              action: 'append',
            }),
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json().catch(() => ({}));
            throw new Error(
              `Erro ao salvar: ${saveResponse.status} - ${errorData.error || 'erro desconhecido'}`
            );
          }

          const saveResult = await saveResponse.json();
          if (verbose) console.warn(`✅ ${saveResult.message}`);

          syncedYearsRef.current.add(year);
          if (onSuccess) onSuccess(days.length);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro desconhecido';
          console.error(`❌ Erro ao sincronizar ${year}:`, message);
          if (onError) onError(message);
        } finally {
          setIsSyncing(false);
        }
      }
    }

    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks são estáveis, years é comparado por referência
  }, [autoSync, years, verbose]);

  // Componente sem UI (só sincroniza em background)
  return null;
}

/**
 * Hook para sincronizar lunações manualmente
 */
export function useSyncLunations() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const sync = async (year: number, verbose = false) => {
    try {
      setIsSyncing(true);
      setLastError(null);

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      if (verbose) console.warn(`🌙 Sincronizando ${year}...`);

      // Gerar dados
      const generateResponse = await fetch(
        `/api/moons/lunations?start=${startDate}&end=${endDate}&source=generated`
      );

      if (!generateResponse.ok) {
        throw new Error(`Erro ao gerar dados: ${generateResponse.status}`);
      }

      const { days } = await generateResponse.json();
      if (!Array.isArray(days) || days.length === 0) {
        throw new Error(`Nenhum dia gerado para ${year}`);
      }
      if (verbose) console.warn(`✨ ${days.length} dias gerados`);

      // Salvar
      const saveResponse = await fetch('/api/moons/lunations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, action: 'replace' }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}));
        throw new Error(
          `Erro ao salvar: ${saveResponse.status} - ${errorData.error || 'erro desconhecido'}`
        );
      }

      const result = await saveResponse.json();
      if (verbose) console.warn(`✅ ${result.message}`);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setLastError(message);
      console.error(`❌ Erro ao sincronizar ${year}:`, message);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return { sync, isSyncing, lastError };
}
