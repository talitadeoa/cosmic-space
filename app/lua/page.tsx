'use client';

import AuthGate from '@/components/AuthGate';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import LuaScreen from './screen/LuaScreen';

const LuaPage = () => {
  return (
    <AuthGate>
      <SpacePageLayout allowBackNavigation>
        <LuaScreen />
      </SpacePageLayout>
    </AuthGate>
  );
};

export default LuaPage;
