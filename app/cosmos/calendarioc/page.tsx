'use client';

import React, { useState, useCallback } from 'react';
import { SpacePageLayout } from '@/components/layouts';
import { useRouter } from 'next/navigation';
import { useCosmosNavigationSafe } from '@/app/cosmos/context/CosmosNavigationContext';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import LuaCycleMenu from '@/app/cosmos/lua/components/LuaCycleMenu';
import { LunarCalendarWidget, generateMockLunarData } from '@/components/lunar-calendar';
import type { LunarDataByDate } from '@/components/lunar-calendar';

export default function CalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  // Gera dados lunares simulados para o mês atual
  // Em produção, isso viria de uma API ou banco de dados
  const lunarDataByDate: LunarDataByDate = generateMockLunarData(year, month);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleMonthChange = useCallback((newMonth: number, newYear: number) => {
    setMonth(newMonth);
    setYear(newYear);
  }, []);

  const { onBackgroundClick } = useBackToHome();

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div className="absolute top-3 left-3 z-40 sm:top-4 sm:left-4">
        <LuaCycleMenu currentPath="/cosmos/calendarioc" />
      </div>
      <main style={{ minHeight: '100vh' }}>
        <LunarCalendarWidget
          month={month}
          year={year}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          lunarDataByDate={lunarDataByDate}
          onMonthChange={handleMonthChange}
          locale="pt-BR"
          ariaLabel="Widget de calendário lunar interativo"
        />
      </main>
    </SpacePageLayout>
  );
}
