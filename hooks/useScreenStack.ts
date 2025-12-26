import { useCallback, useState } from 'react';
import type { ScreenId } from '@/app/cosmos/types';

export const useScreenStack = () => {
  const [screenStack, setScreenStack] = useState<ScreenId[]>(['home']);
  const currentScreen = screenStack[screenStack.length - 1];

  const navigateTo = useCallback((next: ScreenId) => {
    setScreenStack((prev) => [...prev, next]);
  }, []);

  const goBack = useCallback(() => {
    setScreenStack((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  }, []);

  const resetToHome = useCallback(() => {
    setScreenStack(['home']);
  }, []);

  return {
    screenStack,
    currentScreen,
    navigateTo,
    goBack,
    resetToHome,
  };
};
