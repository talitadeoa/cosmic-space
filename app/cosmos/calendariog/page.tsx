'use client';

import React, { useMemo, useState } from 'react';
import LunarCalendarWidget, { LunarDayData, LunarPhase } from './LunarCalendarWidget';

const phaseCycle: LunarPhase[] = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'waning-gibbous',
  'last-quarter',
  'waning-crescent',
];

const phaseIllumination: Record<LunarPhase, number> = {
  new: 0,
  'waxing-crescent': 0.25,
  'first-quarter': 0.5,
  'waxing-gibbous': 0.75,
  full: 1,
  'waning-gibbous': 0.75,
  'last-quarter': 0.5,
  'waning-crescent': 0.25,
};

const pad = (value: number) => value.toString().padStart(2, '0');

const toDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const buildSampleLunarData = (year: number, month: number): Record<string, LunarDayData> => {
  const daysInMonth = getDaysInMonth(year, month);
  const data: Record<string, LunarDayData> = {};

  for (let day = 1; day <= daysInMonth; day += 3) {
    const phase = phaseCycle[(Math.floor(day / 3) + month) % phaseCycle.length];
    const date = new Date(year, month - 1, day);
    data[toDateKey(date)] = {
      phase,
      illumination: phaseIllumination[phase],
      showIcon: true,
      hasEvent: day % 10 === 0,
    };
  }

  return data;
};

const CalendarPage = () => {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(now);

  const lunarDataByDate = useMemo(
    () => buildSampleLunarData(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

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

  return (
    <main className="min-h-screen bg-[#080c12] p-[clamp(16px,4vw,36px)]">
      <LunarCalendarWidget
        month={viewMonth}
        year={viewYear}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onMonthChange={handleMonthChange}
        lunarDataByDate={lunarDataByDate}
      />
    </main>
  );
};

export default CalendarPage;
