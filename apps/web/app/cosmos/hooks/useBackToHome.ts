'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCosmosNavigationSafe } from '@/app/cosmos/context/CosmosNavigationContext';

/**
 * Hook para gerenciar navegação de volta para home e cliques em background
 */
export function useBackToHome() {
  const router = useRouter();
  const { getBackToHomeRoute } = useCosmosNavigationSafe();

  const navigateToHome = useCallback(() => {
    const homeRoute = getBackToHomeRoute();
    router.push(homeRoute);
  }, [router, getBackToHomeRoute]);

  const onBackgroundClick = useCallback(() => {
    navigateToHome();
  }, [navigateToHome]);

  return {
    navigateToHome,
    onBackgroundClick,
  };
}
