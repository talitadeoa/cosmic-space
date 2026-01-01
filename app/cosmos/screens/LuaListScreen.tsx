'use client';

import React from 'react';
import LuaScreen from '@/app/cosmos/lua/screen/LuaScreen';
import type { ScreenProps } from '../types';

const LuaListScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  return <LuaScreen navigateWithFocus={navigateWithFocus} />;
};

export default LuaListScreen;
