'use client';

import { useEffect, useState } from 'react';
import { getLunarPhaseAndSign } from '@/lib/astro';
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

  useEffect(() => {
    // Evitar sincronizar múltiplas vezes
    if (hasSynced || !auth.isAuthenticated) return;

    let cancelled = false;

    async function sync() {
      const data = getLunarPhaseAndSign(new Date());

      try {
        await fetch('/api/form/lunar-phase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: data.data,
            faseLua: data.faseLua,
            signo: data.signo,
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
  }, [auth.isAuthenticated, hasSynced]);

  return null;
}
