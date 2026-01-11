'use client';

import React from 'react';
import LuaScreen from '@/app/cosmos/lua/screen/LuaScreen';
import { useUniverseNavigation } from '../hooks/useUniverseNavigation';

const LuaListScreen: React.FC = () => {
  const { navigateWithFocus } = useUniverseNavigation();
  return <LuaScreen navigateWithFocus={navigateWithFocus} />;
};

export default LuaListScreen;
