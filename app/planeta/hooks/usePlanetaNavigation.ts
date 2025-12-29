'use client';

import { useCallback } from 'react';
import type { ScreenProps } from '@/app/cosmos/types';

/**
 * Hook customizado para gerenciar a navegação na tela Planeta
 * Fornece os handlers para navegação com e sem foco
 */
export const usePlanetaNavigation = () => {
  const handleNavigateWithFocus: ScreenProps['navigateWithFocus'] = useCallback(
    (screenId, options) => {
      // Implementar navegação conforme necessário
      console.log('Navigation request:', screenId, options);
    },
    []
  );

  const handleNavigateTo: ScreenProps['navigateTo'] = useCallback((screenId) => {
    // Placeholder até integrar a navegação real
    console.log('Navigation request:', screenId);
  }, []);

  return {
    navigateWithFocus: handleNavigateWithFocus,
    navigateTo: handleNavigateTo,
  };
};
