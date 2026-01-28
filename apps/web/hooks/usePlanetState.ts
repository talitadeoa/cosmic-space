'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_PLANET_FILTERS, DEFAULT_PLANET_STATE, type PlanetUiState } from '@/types/planetState';
import {
  loadPlanetStateSync,
  normalizePlanetState,
  savePlanetState,
  loadPlanetStateMeta,
  savePlanetStateMeta,
  getDeviceId,
  listOutboxChanges,
} from '@/client/storage';
import {
  enqueueStateChange,
  pullStateChanges,
  pushStateChanges,
  type SyncStateItem,
} from '@/app/cosmos/utils/planetSync';

const SYNC_INTERVAL_MS = 30000; // Aumentado de 10s para 30s para reduzir requisições

const createChangeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `change-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const shouldApplyState = (incoming: SyncStateItem, localVersion: number | null) => {
  if (!localVersion) return true;
  return incoming.version >= localVersion;
};

export const usePlanetState = () => {
  // Start with deterministic defaults; load persisted state after hydration to avoid SSR mismatches
  const [state, setStateInternal] = useState<PlanetUiState>(() => ({
    ...DEFAULT_PLANET_STATE,
    // Clone filters to avoid mutating the shared default reference
    filters: { ...DEFAULT_PLANET_FILTERS },
  }));
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const deviceId = useMemo(() => getDeviceId(), []);
  const metaRef = useRef(loadPlanetStateMeta());
  const pendingRef = useRef(false);
  const suppressOutboxRef = useRef(false);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setState = useCallback(
    (next: PlanetUiState | ((prev: PlanetUiState) => PlanetUiState)) => {
      setStateInternal((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        if (!hasLoaded || suppressOutboxRef.current) {
          return resolved;
        }

        const updatedAt = new Date().toISOString();
        metaRef.current = {
          version: metaRef.current.version ?? null,
          updatedAt,
        };
        savePlanetStateMeta(metaRef.current);
        pendingRef.current = true;
        // Remove filtros de UI transitórios antes de enviar ao servidor
        // Estes são apenas estados de UI locais e nunca devem ser sincronizados:
        // - view: qual visualização está ativa
        // - island: qual ilha está filtrada
        // - phase: qual fase está filtrada
        const { filters: resolvedFilters, ...stateWithoutFilters } = resolved;
        const payloadFilters = {
          ...resolvedFilters,
          view: 'todos', // Reset para padrão
          island: null, // Não sincronizar filtro de ilha
          phase: null, // Não sincronizar filtro de fase
        };
        const payload = {
          ...stateWithoutFilters,
          filters: payloadFilters,
        } as PlanetUiState;
        void enqueueStateChange({
          clientChangeId: createChangeId(),
          type: 'planet_state',
          entityId: 'planet_state',
          deviceId,
          baseVersion: metaRef.current.version ?? null,
          updatedAt,
          deletedAt: null,
          payload,
        });
        return resolved;
      });
    },
    [deviceId, hasLoaded]
  );

  useEffect(() => {
    if (loading) return;
    
    // Se não está autenticado, limpar dados e usar padrões
    if (!isAuthenticated) {
      pendingRef.current = false;
      const defaultState = {
        ...DEFAULT_PLANET_STATE,
        filters: { ...DEFAULT_PLANET_FILTERS },
      };
      setStateInternal(defaultState);
      setHasLoaded(true);
      return;
    }
    
    // Se está autenticado, carregar dados locais
    const localState = normalizePlanetState(loadPlanetStateSync());
    setStateInternal(localState);
    setHasLoaded(true);

    void listOutboxChanges('planet_state', 50, true).then((items) => {
      pendingRef.current = items.length > 0;
    });
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (!hasLoaded) return;
    savePlanetState(state);
  }, [hasLoaded, state]);

  useEffect(() => {
    if (!hasLoaded || !isAuthenticated || !user?.userId) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let isFirstSync = true;

    const syncState = async () => {
      if (!isMounted) return;
      try {
        const pushResult = await pushStateChanges();
        if (pushResult?.applied?.length) {
          const latest = pushResult.applied[pushResult.applied.length - 1];
          metaRef.current = {
            version: latest.version,
            updatedAt: latest.updatedAt,
          };
          savePlanetStateMeta(metaRef.current);
          pendingRef.current = false;
        }
      } catch (error) {
        console.debug('Falha ao enviar estado do Planeta:', error);
      }

      try {
        // Na primeira sincronização, forçar busca desde o início (cursor = 0)
        const pullResult = await pullStateChanges(user.userId, isFirstSync);
        isFirstSync = false;
        if (!pullResult.item) return;
        
        // Aplicar estado do servidor mesmo com mudanças locais pendentes
        // O servidor sempre tem a verdade dos dados sincronizados
        if (!shouldApplyState(pullResult.item, metaRef.current.version)) return;
        
        suppressOutboxRef.current = true;
        const normalized = normalizePlanetState(pullResult.item.payload);
        // IMPORTANTE: Alguns filtros são estados de UI transitórios (qual visualização/ilha/fase
        // o usuário está vendo NESTE momento). Estes nunca devem ser sincronizados com o servidor
        // para não resetar a visualização do usuário durante sincronizações automáticas (a cada 30s).
        setStateInternal((prev) => ({
          ...normalized,
          filters: {
            ...normalized.filters,
            view: prev.filters.view, // Sempre manter a view local
            island: prev.filters.island, // Preservar ilha selecionada
            phase: prev.filters.phase, // Preservar fase selecionada
          },
        }));
        metaRef.current = {
          version: pullResult.item.version,
          updatedAt: pullResult.item.updatedAt,
        };
        savePlanetStateMeta(metaRef.current);
        suppressOutboxRef.current = false;
      } catch (error) {
        console.debug('Falha ao buscar estado do Planeta:', error);
      }
    };

    // Sincronização IMEDIATA após login para carregar dados do servidor
    syncState();

    syncIntervalRef.current = setInterval(syncState, SYNC_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [hasLoaded, isAuthenticated, user?.userId]);

  return { state, setState, hasLoaded };
};
