'use client';

import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import { CosmosRouteHelper } from '@/app/cosmos/components';
import LuaScreen from './screen/LuaScreen';

const LuaPage = () => {
  const router = useRouter();

  return (
    <SpacePageLayout onBackgroundClick={() => router.push('/cosmos')}>
      <LuaScreen />
      <CosmosRouteHelper routeKey="lua" position="bottom-right" />
    </SpacePageLayout>
  );
};

export default LuaPage;
