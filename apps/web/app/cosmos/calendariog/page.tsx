'use client';

import { useMemo, useState } from 'react';
import { SpacePageLayout } from '@/components/layouts';
import { useBackToHome } from '@/app/cosmos/hooks/useBackToHome';
import LuaCycleMenu from '@/app/cosmos/lua/components/LuaCycleMenu';
import LunarCalendarWidget, { LunarDayData, LunarPhase } from './LunarCalendarWidget';
import { useLunarBatchUSNO } from '@/hooks/useLunarPhaseUSNO';

// Mapa de fases USNO para nomes esperados
const mapUSNOPhase = (phase: string): LunarPhase => {
  const phaseMap: Record<string, LunarPhase> = {
    'New Moon': 'new',
    'Waxing Crescent': 'waxing-crescent',
    'First Quarter': 'first-quarter',
    'Waxing Gibbous': 'waxing-gibbous',
    'Full Moon': 'full',
    'Waning Gibbous': 'waning-gibbous',
    'Last Quarter': 'last-quarter',
    'Waning Crescent': 'waning-crescent',
  };
  return phaseMap[phase] || 'new';
};

const pad = (value: number) => value.toString().padStart(2, '0');

const toDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const CalendarPage = () => {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(now);

  // Gerar datas do mês
  const monthDates = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    return Array.from({ length: daysInMonth }, (_, i) => {
      return new Date(viewYear, viewMonth - 1, i + 1);
    });
  }, [viewYear, viewMonth]);

  // Carregar fases lunares da USNO
  const { phases, loading, error } = useLunarBatchUSNO(monthDates);

  // Converter para formato esperado pelo widget
  const lunarDataByDate = useMemo(() => {
    const data: Record<string, LunarDayData> = {};

    monthDates.forEach((date) => {
      const key = toDateKey(date);
      const phase = phases.get(key);

      if (phase) {
        data[key] = {
          phase: mapUSNOPhase(phase.phase) as LunarPhase,
          illumination: (phase.illumination || 0) / 100, // Converter de 0-100 para 0-1
          showIcon: true,
          hasEvent: false,
        };
      } else if (!loading && error) {
        // Fallback se erro
        data[key] = {
          phase: 'new',
          illumination: 0,
          showIcon: false,
          hasEvent: false,
        };
      }
    });

    return data;
  }, [phases, monthDates, loading, error]);

  const handleMonthChange = (nextYear: number, nextMonth: number) => {
    setViewYear(nextYear);
    setViewMonth(nextMonth);
    setSelectedDate((previous) => {
      const day = Math.min(previous.getDate(), getDaysInMonth(nextYear, nextMonth));
      return new Date(nextYear, nextMonth - 1, day);
    });
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    const nextMonth = date.getMonth() + 1;
    const nextYear = date.getFullYear();
    if (nextMonth !== viewMonth || nextYear !== viewYear) {
      setViewMonth(nextMonth);
      setViewYear(nextYear);
    }
  };

  const { onBackgroundClick } = useBackToHome();

  if (loading) {
    return (
      <SpacePageLayout onBackgroundClick={onBackgroundClick}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🌙</div>
            <p className="text-gray-500">Carregando calendário lunar...</p>
          </div>
        </div>
      </SpacePageLayout>
    );
  }

  return (
    <SpacePageLayout onBackgroundClick={onBackgroundClick}>
      <div className="absolute top-3 left-3 z-40 sm:top-4 sm:left-4">
        <LuaCycleMenu currentPath="/cosmos/calendariog" />
      </div>
      <main className="min-h-screen p-[clamp(16px,4vw,36px)]">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              ⚠️ Erro ao carregar dados lunares. Usando dados de fallback.
            </p>
          </div>
        )}
        <LunarCalendarWidget
          month={viewMonth}
          year={viewYear}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onMonthChange={handleMonthChange}
          lunarDataByDate={lunarDataByDate}
        />
      </main>
    </SpacePageLayout>
  );
};

export default CalendarPage;
