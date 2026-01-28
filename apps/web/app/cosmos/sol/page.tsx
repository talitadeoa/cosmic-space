'use client';

import { CosmosRouteHelper } from '@/app/cosmos/components';
import { YearProvider } from '@/app/cosmos/context/YearContext';
import { SpacePageLayout } from '@/components/layouts';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import SolScreen from './screen/SolScreen';

/**
 * SolPage - Página da entidade Sol
 * Delegação completa de lógica para SolScreen
 */
const SolPage = () => {
  const { onBackgroundClick } = useBackToHome();

  return (
    <YearProvider>
      <SpacePageLayout onBackgroundClick={onBackgroundClick}>
        <SolScreen />
        <CosmosRouteHelper routeKey="sol" position="top-left" />
      </SpacePageLayout>
    </YearProvider>
  );
};

export default SolPage;
