'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';
import { useSfx } from '@/hooks/useSfx';

const SfxContext = createContext({ enabled: true, toggle: () => {} });

export function useSfxContext() {
  return useContext(SfxContext) as { enabled: boolean; toggle: () => void };
}

export default function SfxProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const { click } = useSfx();

  // Inicializar localStorage apenas uma vez após mount
  useEffect(() => {
    try {
      const v = localStorage.getItem('sfx_enabled');
      setEnabled(v === null ? true : v === '1');
    } catch (e) {
      setEnabled(true);
    }
    setMounted(true);
  }, []);

  // Persistir localStorage apenas quando muda
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('sfx_enabled', enabled ? '1' : '0');
    } catch (e) {}
  }, [enabled, mounted]);

  // Click handler com useCallback e debounce implícito
  const handleClickMemo = useCallback(() => {
    if (enabled) click();
  }, [enabled, click]);

  // Usar event delegation ao invés de listener global
  useEffect(() => {
    if (!mounted) return;
    
    function handleClick(e: MouseEvent) {
      if (enabled) click();
    }

    document.addEventListener('click', handleClick, { passive: true, capture: false });
    return () => document.removeEventListener('click', handleClick);
  }, [enabled, click, mounted]);

  const value = useMemo(() => ({ enabled, toggle: () => setEnabled((s) => !s) }), [enabled]);

  return (
    <SfxContext.Provider value={value}>
      {children}
    </SfxContext.Provider>
  );
}
