'use client';

import { SpacePageLayout } from '@/components/layouts';
import LuaScreen from './screen/LuaScreen';

const LuaPage = () => {
  return (
    <SpacePageLayout allowBackNavigation>
      <LuaScreen />
    </SpacePageLayout>
  );
};

export default LuaPage;
