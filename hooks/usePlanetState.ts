'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_PLANET_FILTERS, DEFAULT_PLANET_STATE, type PlanetUiState } from '@/types/planetState';
import { loadPlanetStateSync, normalizePlanetState, savePlanetState } from '@/app/cosmos/utils/planetStateStorage';
import { loadPlanetStateMeta, savePlanetStateMeta } from '@/app/cosmos/utils/planetStateMetaStorage';
import { getDeviceId } from '@/app/cosmos/utils/deviceId';
import {
  enqueueStateChange,
  pullStateChanges,
  pushStateChanges,
  type SyncStateItem,
} from '@/app/cosmos/utils/planetSync';
import { listOutboxChanges } from '@/app/cosmos/utils/syncOutbox';

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
        void enqueueStateChange({
          clientChangeId: createChangeId(),
          type: 'planet_state',
          entityId: 'planet_state',
          deviceId,
          baseVersion: metaRef.current.version ?? null,
          updatedAt,
          deletedAt: null,
          payload: resolved,
        });
        return resolved;
      });
    },
    [deviceId, hasLoaded]
  );

  useEffect(() => {
    if (loading) return;
    const localState = normalizePlanetState(loadPlanetStateSync());
    setStateInternal(localState);
    setHasLoaded(true);

    if (isAuthenticated) {
      void listOutboxChanges('planet_state', 50, true).then((items) => {
        pendingRef.current = items.length > 0;
      });
    } else {
      pendingRef.current = false;
    }
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
        const pullResult = await pullStateChanges(user.userId);
        if (!pullResult.item || pendingRef.current) return;
        if (!shouldApplyState(pullResult.item, metaRef.current.version)) return;
        suppressOutboxRef.current = true;
        const normalized = normalizePlanetState(pullResult.item.payload);
        setStateInternal(normalized);
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

    const immediateTimeoutRef = setTimeout(() => {
      syncState();
    }, 100);

    syncIntervalRef.current = setInterval(syncState, SYNC_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearTimeout(immediateTimeoutRef);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [hasLoaded, isAuthenticated, user?.userId]);

  return { state, setState, hasLoaded };
};
