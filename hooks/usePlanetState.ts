'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { PlanetUiState } from '@/types/planetState';
import {
  hasCustomPlanetState,
  loadPlanetState,
  normalizePlanetState,
  savePlanetState,
} from '@/app/cosmos/utils/planetStateStorage';

const SAVE_DEBOUNCE_MS = 800;
const SYNC_INTERVAL_MS = 10000; // Sincroniza a cada 10 segundos

export const usePlanetState = () => {
  const [state, setState] = useState<PlanetUiState>(() => loadPlanetState());
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didHydrateRef = useRef(false);

  // Carregamento inicial e sincronização periódica
  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const loadState = async () => {
      const localState = loadPlanetState();
      const localHasCustom = hasCustomPlanetState(localState);

      if (isAuthenticated) {
        try {
          const response = await fetch('/api/planet-state', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            const remoteState = normalizePlanetState(data?.state ?? null);
            const remoteHasCustom = Boolean(data?.state) && hasCustomPlanetState(remoteState);

            if (!remoteHasCustom && localHasCustom) {
              if (isMounted) {
                setState(localState);
              }
              await fetch('/api/planet-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ state: localState }),
              });
              if (isMounted) {
                setHasLoaded(true);
              }
              return;
            }

            if (isMounted) {
              setState(remoteState);
            }
          } else {
            if (isMounted) {
              setState(localState);
            }
          }
        } catch (error) {
          console.warn('Falha ao carregar estado do Planeta:', error);
          if (isMounted) {
            setState(localState);
          }
        }
      } else if (isMounted) {
        setState(localState);
      }

      if (isMounted) {
        setHasLoaded(true);
      }
    };

    loadState();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, loading]);

  // ✅ NOVO: Sincronização periódica (polling) em efeito separado
  useEffect(() => {
    if (!hasLoaded || !isAuthenticated) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    let isMounted = true;

    // Executar imediatamente na primeira vez
    (async () => {
      if (isMounted && isAuthenticated) {
        try {
          const response = await fetch('/api/planet-state', { credentials: 'include' });
          if (response.ok && isMounted) {
            const data = await response.json();
            const remoteState = normalizePlanetState(data?.state ?? null);
            setState(remoteState);
          }
        } catch (error) {
          console.debug('Falha ao sincronizar estado do Planeta:', error);
        }
      }
    })();

    // Depois, configurar polling periódico
    syncIntervalRef.current = setInterval(async () => {
      if (isMounted && isAuthenticated) {
        try {
          const response = await fetch('/api/planet-state', { credentials: 'include' });
          if (response.ok && isMounted) {
            const data = await response.json();
            const remoteState = normalizePlanetState(data?.state ?? null);
            setState(remoteState);
          }
        } catch (error) {
          console.debug('Falha ao sincronizar estado do Planeta:', error);
        }
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [hasLoaded, isAuthenticated]);

  useEffect(() => {
    if (!hasLoaded) return;
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (!isAuthenticated) {
      savePlanetState(state);
      return;
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/planet-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ state }),
        });
      } catch (error) {
        console.warn('Falha ao salvar estado do Planeta:', error);
        savePlanetState(state);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasLoaded, state, isAuthenticated]);

  return { state, setState, hasLoaded };
};
