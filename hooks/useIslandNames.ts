'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_ISLAND_NAMES,
  loadIslandNames,
  saveIslandNames,
  type IslandId,
  type IslandNames,
} from '@/app/cosmos/utils/islandNames';

export const useIslandNames = () => {
  const [islandNames, setIslandNames] = useState<IslandNames>(DEFAULT_ISLAND_NAMES);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setIslandNames(loadIslandNames());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    saveIslandNames(islandNames);
  }, [hasLoaded, islandNames]);

  const renameIsland = (islandId: IslandId, name: string) => {
    setIslandNames((prev) => ({ ...prev, [islandId]: name }));
  };

  return { islandNames, renameIsland };
};
