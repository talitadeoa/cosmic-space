'use client';

import { useEffect, useState } from 'react';
import { getLunarPhaseAndSign } from '@/lib/astro';
import { useAuth } from '@/hooks/useAuth';

/**
 * Sincroniza a fase lunar atual e signo solar automaticamente ao autenticar
 * Componente de efeito colateral (sem UI)
 */
export default function AutoSyncLunar() {
  const auth = useAuth();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    async function sync() {
      if (!auth.isAuthenticated) return;

      const data = getLunarPhaseAndSign(new Date());

      try {
        const resp = await fetch('/api/form/lunar-phase', {
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

        if (resp.ok) setSynced(true);
      } catch (e) {
        // ignore
      }
    }

    // Sincroniza uma vez após autenticação
    if (auth.isAuthenticated && !synced) {
      sync();
    }
  }, [auth.isAuthenticated, synced, auth]);

  return null;
}
