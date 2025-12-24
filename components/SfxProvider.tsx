'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSfx } from '@/hooks/useSfx';

const SfxContext = createContext({ enabled: true, toggle: () => {} });

export function useSfxContext() {
  return useContext(SfxContext) as { enabled: boolean; toggle: () => void };
}

export default function SfxProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('sfx_enabled');
      return v === null ? true : v === '1';
    } catch (e) {
      return true;
    }
  });

  const { click } = useSfx();

  useEffect(() => {
    try {
      localStorage.setItem('sfx_enabled', enabled ? '1' : '0');
    } catch (e) {}
  }, [enabled]);

  useEffect(() => {
    function handleClick() {
      if (enabled) click();
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enabled, click]);

  return (
    <SfxContext.Provider value={{ enabled, toggle: () => setEnabled((s) => !s) }}>
      {children}
    </SfxContext.Provider>
  );
}
