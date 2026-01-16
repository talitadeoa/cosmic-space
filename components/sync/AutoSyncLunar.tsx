'use client';

import { useEffect, useState } from 'react';
import { useLunarPhase } from '@/hooks/useLunarCompute';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sincroniza a fase lunar atual e signo solar automaticamente ao autenticar
 * Componente de efeito colateral (sem UI)
 * 
 * Usa useState para 'synced' pois:
 * 1. Se a sincronização falhar, podemos mostrar feedback visual futuramente
 * 2. O estado é semântico - representa o status do componente
 * 3. Não há problema de performance (componente sem UI, monta uma vez)
 */
export default function AutoSyncLunar() {
  const auth = useAuth();
  const [hasSynced, setHasSynced] = useState(false);
  // Novo cache com deduplica automática
  const { phase: moonData } = useLunarPhase(new Date(), { includeZodiac: true });

  useEffect(() => {
    // Evitar sincronizar múltiplas vezes
    if (hasSynced || !auth.isAuthenticated || !moonData) return;

    let cancelled = false;

    async function sync() {
      if (!moonData) return;

      try {
        await fetch('/api/form/lunar-phase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: moonData.date,
            faseLua: moonData.phase,
            signo: moonData.zodiac_sign,
            energia: '',
            checks: '',
            observacoes: '',
            energiaDaFase: '',
            intencoesLua: '',
            intencoesSemana: '',
            intencoesAno: '',
          }),
          credentials: 'include',
        });
        if (!cancelled) {
          setHasSynced(true);
        }
      } catch {
        // Silenciar erros - sincronização é best-effort
      }
    }

    sync();

    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, hasSynced, moonData]);

  return null;
}
