'use client';

import { SpacePageLayout } from '@/components/layouts';
import { CosmosRouteHelper } from '@/app/cosmos/components';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import LuaScreen from './screen/LuaScreen';

const LuaPage = () => {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <LuaScreen />
      <CosmosRouteHelper routeKey="lua" position="bottom-left" forceShow />
    </SpacePageLayout>
  );
};

export default LuaPage;
