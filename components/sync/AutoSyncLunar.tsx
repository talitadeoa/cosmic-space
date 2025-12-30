'use client';

import { useEffect, useRef } from 'react';
import { getLunarPhaseAndSign } from '@/lib/astro';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sincroniza a fase lunar atual e signo solar automaticamente ao autenticar
 * Componente de efeito colateral (sem UI)
 */
export default function AutoSyncLunar() {
  const auth = useAuth();
  const syncedRef = useRef(false);

  useEffect(() => {
    // Evitar sincronizar múltiplas vezes
    if (syncedRef.current || !auth.isAuthenticated) return;

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
        syncedRef.current = true;
      } catch (e) {
        // ignore
      }
    }

    sync();
  }, [auth.isAuthenticated]);

  return null;
}
