'use client';

import React, { useState, useCallback } from 'react';
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

  return (
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
  );
}
