'use client';

import { useRouter } from 'next/navigation';
import { SpacePageLayout } from '@/components/layouts';
import LuaScreen from './screen/LuaScreen';

const LuaPage = () => {
  const router = useRouter();

  return (
    <SpacePageLayout onBackgroundClick={() => router.push('/cosmos/home')}>
      <LuaScreen />
    </SpacePageLayout>
  );
};

export default LuaPage;
