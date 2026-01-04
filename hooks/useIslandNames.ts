'use client';

import { useEffect, useRef, useState } from 'react';
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

export const useIslandNames = () => {
  const [islandNames, setIslandNames] = useState<IslandNames>(DEFAULT_ISLAND_NAMES);
  const [islandIds, setIslandIds] = useState<IslandId[]>(['ilha1']);
  const [hasLoaded, setHasLoaded] = useState(false);
  const didHydrateRef = useRef(false);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const loadNames = async () => {
      const localNames = loadIslandNames();
      const localIds = loadIslandIds().slice(0, MAX_ISLANDS);
      const localHasCustomNames = ISLAND_IDS.some(
        (islandId) => localNames[islandId] !== DEFAULT_ISLAND_NAMES[islandId]
      );

      if (isAuthenticated) {
        try {
          const response = await fetch('/api/islands', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            const remoteIds = Array.isArray(data?.ids)
              ? data.ids.filter((id: any): id is IslandId => ISLAND_IDS.includes(id))
              : [];
            const activeIds = (remoteIds.length > 0 ? remoteIds : ['ilha1']).slice(0, MAX_ISLANDS);
            const nextNames = {
              ...DEFAULT_ISLAND_NAMES,
              ...(data?.names ?? {}),
            };
            const remoteIsDefaultOnly =
              activeIds.length === 1 &&
              activeIds[0] === 'ilha1' &&
              Object.keys(data?.names ?? {}).length === 0;
            const localHasExtraIds = localIds.some((id) => !activeIds.includes(id));
            const shouldSeedRemote = remoteIsDefaultOnly && (localHasExtraIds || localHasCustomNames);

            if (shouldSeedRemote) {
              if (isMounted) {
                setIslandNames(localNames);
                setIslandIds(localIds);
              }
              await fetch('/api/islands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ids: localIds, names: localNames }),
              });
              if (isMounted) {
                setHasLoaded(true);
              }
              return;
            }
            if (isMounted) {
              setIslandNames(nextNames);
              setIslandIds(activeIds);
            }
          } else {
            if (isMounted) {
              setIslandNames(localNames);
              setIslandIds(localIds);
            }
          }
        } catch (error) {
          console.warn('Falha ao carregar ilhas do servidor:', error);
          if (isMounted) {
            setIslandNames(localNames);
            setIslandIds(localIds);
          }
        }
      } else {
        if (isMounted) {
          setIslandNames(localNames);
          setIslandIds(localIds);
        }
      }

      if (isMounted) {
        setHasLoaded(true);
      }
    };

    loadNames();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (!hasLoaded) return;
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      return;
    }

    if (!isAuthenticated) {
      saveIslandNames(islandNames);
      saveIslandIds(islandIds);
      return;
    }

    const persistRemote = async () => {
      try {
        const namesPayload: Partial<IslandNames> = {};
        islandIds.forEach((islandId) => {
          namesPayload[islandId] = islandNames[islandId] ?? DEFAULT_ISLAND_NAMES[islandId];
        });

        await fetch('/api/islands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ids: islandIds, names: namesPayload }),
        });
      } catch (error) {
        console.warn('Falha ao salvar ilhas no servidor:', error);
        saveIslandNames(islandNames);
        saveIslandIds(islandIds);
      }
    };

    persistRemote();
  }, [hasLoaded, islandNames, islandIds, isAuthenticated]);

  const renameIsland = (islandId: IslandId, name: string) => {
    setIslandNames((prev) => ({ ...prev, [islandId]: name }));
  };

  const createIsland = (name: string): IslandId | null => {
    if (islandIds.length >= MAX_ISLANDS) return null;
    const nextId = ISLAND_IDS.find((id) => !islandIds.includes(id));
    if (!nextId) return null;
    const trimmed = name.trim();
    if (!trimmed) return null;

    setIslandIds((prev) => [...prev, nextId]);
    setIslandNames((prev) => ({ ...prev, [nextId]: trimmed }));
    return nextId;
  };

  const removeIsland = (islandId: IslandId): boolean => {
    if (!islandIds.includes(islandId)) return false;
    if (islandIds.length <= 1) return false;
    setIslandIds((prev) => prev.filter((id) => id !== islandId));
    return true;
  };

  return { islandNames, islandIds, renameIsland, createIsland, removeIsland };
};
