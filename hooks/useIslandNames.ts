'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_ISLAND_NAMES,
  loadIslandNames,
  saveIslandNames,
  type IslandId,
  type IslandNames,
} from '@/app/cosmos/utils/islandNames';
import { useAuth } from '@/hooks/useAuth';

export const useIslandNames = () => {
  const [islandNames, setIslandNames] = useState<IslandNames>(DEFAULT_ISLAND_NAMES);
  const [hasLoaded, setHasLoaded] = useState(false);
  const didHydrateRef = useRef(false);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const loadNames = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/islands', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            const nextNames = {
              ...DEFAULT_ISLAND_NAMES,
              ...(data?.names ?? {}),
            };
            if (isMounted) {
              setIslandNames(nextNames);
            }
          } else {
            setIslandNames(loadIslandNames());
          }
        } catch (error) {
          console.warn('Falha ao carregar ilhas do servidor:', error);
          if (isMounted) {
            setIslandNames(loadIslandNames());
          }
        }
      } else {
        if (isMounted) {
          setIslandNames(loadIslandNames());
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
      return;
    }

    const persistRemote = async () => {
      try {
        await fetch('/api/islands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ names: islandNames }),
        });
      } catch (error) {
        console.warn('Falha ao salvar ilhas no servidor:', error);
        saveIslandNames(islandNames);
      }
    };

    persistRemote();
  }, [hasLoaded, islandNames, isAuthenticated]);

  const renameIsland = (islandId: IslandId, name: string) => {
    setIslandNames((prev) => ({ ...prev, [islandId]: name }));
  };

  return { islandNames, renameIsland };
};
