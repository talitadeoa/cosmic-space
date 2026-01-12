'use client';

import { CosmosRouteHelper } from '@/app/cosmos/components';
import { YearProvider } from '@/app/cosmos/context/YearContext';
import { SpacePageLayout } from '@/components/layouts';
import { useRouter } from 'next/navigation';
import SolScreen from './screen/SolScreen';

/**
 * SolPage - Página da entidade Sol
 * Delegação completa de lógica para SolScreen
 */
const SolPage = () => {
  const router = useRouter();

  return (
    <YearProvider>
      <SpacePageLayout onBackgroundClick={() => router.push('/cosmos')}>
        <SolScreen />
        <CosmosRouteHelper routeKey="sol" position="bottom-right" />
      </SpacePageLayout>
    </YearProvider>
  );
};

export default SolPage;
