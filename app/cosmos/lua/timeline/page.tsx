'use client';

import { SpacePageLayout } from '@/components/layouts';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import LuaTimelineScreen from './LuaTimelineScreen';
import LuaCycleMenu from '../components/LuaCycleMenu';

const LuaTimelinePage = () => {
  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div className="absolute top-3 left-3 z-40 sm:top-4 sm:left-4">
        <LuaCycleMenu currentPath="/cosmos/lua/timeline" />
      </div>
      <LuaTimelineScreen />
    </SpacePageLayout>
  );
};

export default LuaTimelinePage;
