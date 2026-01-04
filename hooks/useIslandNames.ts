'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_ISLAND_NAMES,
  loadIslandNames,
  loadIslandIds,
  saveIslandIds,
  ISLAND_IDS,
  MAX_ISLANDS,
  saveIslandNames,
  type IslandId,
  type IslandNames,
} from '@/app/cosmos/utils/islandNames';
import { useAuth } from '@/hooks/useAuth';
import { getDeviceId } from '@/app/cosmos/utils/deviceId';
import { loadIslandMeta, saveIslandMeta, type IslandMeta } from '@/app/cosmos/utils/islandMetaStorage';
import {
  buildIslandPayload,
  enqueueIslandChange,
  pullIslandChanges,
  pushIslandChanges,
  type SyncIslandItem,
} from '@/app/cosmos/utils/islandSync';
import { listOutboxChanges } from '@/app/cosmos/utils/syncOutbox';

const SYNC_INTERVAL_MS = 10000;

const createChangeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `change-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const orderIslandIds = (ids: Iterable<IslandId>) =>
  ISLAND_IDS.filter((id) => Array.from(ids).includes(id)).slice(0, MAX_ISLANDS);

const applyIslandItems = (
  prevNames: IslandNames,
  prevIds: IslandId[],
  meta: IslandMeta,
  items: SyncIslandItem[]
) => {
  const names: IslandNames = { ...prevNames };
  const idSet = new Set<IslandId>(prevIds);

  items.forEach((item) => {
    meta[item.id] = {
      version: item.version,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
    };

    if (item.deletedAt) {
      idSet.delete(item.id);
      return;
    }

    idSet.add(item.id);
    const title = item.payload?.title?.trim();
    if (title) {
      names[item.id] = title;
    }
  });

  if (!idSet.has('ilha1')) {
    idSet.add('ilha1');
  }

  return {
    names,
    ids: orderIslandIds(idSet),
  };
};

export const useIslandNames = () => {
  const [islandNames, setIslandNamesState] = useState<IslandNames>(DEFAULT_ISLAND_NAMES);
  const [islandIds, setIslandIdsState] = useState<IslandId[]>(['ilha1']);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const deviceId = useMemo(() => getDeviceId(), []);
  const metaRef = useRef<IslandMeta>(loadIslandMeta());
  const pendingRef = useRef<Set<IslandId>>(new Set());
  const suppressOutboxApplyRef = useRef(false);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) return;
    const localNames = loadIslandNames();
    const localIds = loadIslandIds().slice(0, MAX_ISLANDS);

    setIslandNamesState({
      ...DEFAULT_ISLAND_NAMES,
      ...localNames,
    });
    setIslandIdsState(orderIslandIds(localIds));
    setHasLoaded(true);

    if (isAuthenticated) {
      void listOutboxChanges('island', 200, true).then((items) => {
        pendingRef.current = new Set(items.map((item) => item.entityId as IslandId));
      });
    } else {
      pendingRef.current = new Set();
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (!hasLoaded) return;
    saveIslandNames(islandNames);
    saveIslandIds(islandIds);
    saveIslandMeta(metaRef.current);
  }, [hasLoaded, islandNames, islandIds]);

  useEffect(() => {
    if (!hasLoaded || !isAuthenticated || !user?.userId) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const syncIslands = async () => {
      if (!isMounted) return;
      try {
        const pushResult = await pushIslandChanges();
        if (pushResult?.applied?.length) {
          pushResult.applied.forEach((item) => {
            metaRef.current[item.id] = {
              ...metaRef.current[item.id],
              version: item.version,
              updatedAt: item.updatedAt,
              deletedAt: null,
            };
            pendingRef.current.delete(item.id);
          });
          saveIslandMeta(metaRef.current);
        }
      } catch (error) {
        console.debug('Falha ao enviar ilhas:', error);
      }

      try {
        const pullResult = await pullIslandChanges(user.userId);
        if (!pullResult.items?.length) return;
        suppressOutboxApplyRef.current = true;
        setIslandNamesState((prevNames) => {
          const filtered = pullResult.items.filter((item) => !pendingRef.current.has(item.id));
          const { names, ids } = applyIslandItems(prevNames, islandIds, metaRef.current, filtered);
          setIslandIdsState(ids);
          saveIslandMeta(metaRef.current);
          return names;
        });
        suppressOutboxApplyRef.current = false;
      } catch (error) {
        console.debug('Falha ao buscar ilhas:', error);
      }
    };

    const immediateTimeoutRef = setTimeout(() => {
      syncIslands();
    }, 100);

    syncIntervalRef.current = setInterval(syncIslands, SYNC_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearTimeout(immediateTimeoutRef);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [hasLoaded, isAuthenticated, user?.userId, islandIds]);

  const queueIslandChange = useCallback(
    (islandId: IslandId, name: string | null, deletedAt: string | null) => {
      const now = new Date().toISOString();
      pendingRef.current.add(islandId);
      metaRef.current[islandId] = {
        ...metaRef.current[islandId],
        updatedAt: now,
        deletedAt,
      };
      saveIslandMeta(metaRef.current);
      void enqueueIslandChange({
        clientChangeId: createChangeId(),
        type: 'island',
        entityId: islandId,
        deviceId,
        baseVersion: metaRef.current[islandId]?.version ?? null,
        updatedAt: now,
        deletedAt,
        payload: buildIslandPayload(name),
      });
    },
    [deviceId]
  );

  const renameIsland = (islandId: IslandId, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIslandNamesState((prev) => ({ ...prev, [islandId]: trimmed }));
    queueIslandChange(islandId, trimmed, null);
  };

  const createIsland = (name: string): IslandId | null => {
    if (islandIds.length >= MAX_ISLANDS) return null;
    const nextId = ISLAND_IDS.find((id) => !islandIds.includes(id));
    if (!nextId) return null;
    const trimmed = name.trim();
    if (!trimmed) return null;

    setIslandIdsState((prev) => orderIslandIds([...prev, nextId]));
    setIslandNamesState((prev) => ({ ...prev, [nextId]: trimmed }));
    queueIslandChange(nextId, trimmed, null);
    return nextId;
  };

  const removeIsland = (islandId: IslandId): boolean => {
    if (!islandIds.includes(islandId)) return false;
    if (islandIds.length <= 1) return false;
    setIslandIdsState((prev) => prev.filter((id) => id !== islandId));
    queueIslandChange(islandId, islandNames[islandId], new Date().toISOString());
    return true;
  };

  return { islandNames, islandIds, renameIsland, createIsland, removeIsland };
};
