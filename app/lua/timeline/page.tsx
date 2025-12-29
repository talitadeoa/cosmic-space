'use client';

import { SpacePageLayout } from '@/components/layouts';
import LuaTimelineScreen from './LuaTimelineScreen';

const LuaTimelinePage = () => {
  return (
    <SpacePageLayout allowBackNavigation>
      <LuaTimelineScreen />
    </SpacePageLayout>
  );
};

export default LuaTimelinePage;
