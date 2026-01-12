'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

interface YearContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Memoizar setSelectedYear para estabilizar referência
  const handleSetYear = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  // Memoizar o value do contexto para evitar re-renders desnecessários
  const value = useMemo<YearContextType>(() => ({
    selectedYear,
    setSelectedYear: handleSetYear,
  }), [selectedYear, handleSetYear]);

  return (
    <YearContext.Provider value={value}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error('useYear deve ser usado dentro de um YearProvider');
  }
  return context;
}
