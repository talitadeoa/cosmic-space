'use client';

import { SpacePageLayout } from '@/components/layouts';
import { CosmosRouteHelper } from '@/app/cosmos/components';
import { useRouter } from 'next/navigation';
import { useCosmosNavigationSafe } from '@/app/cosmos/context/CosmosNavigationContext';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import LuaScreen from './screen/LuaScreen';

const LuaPage = () => {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <LuaScreen />
      <CosmosRouteHelper routeKey="lua" position="bottom-right" />
    </SpacePageLayout>
  );
};

export default LuaPage;
