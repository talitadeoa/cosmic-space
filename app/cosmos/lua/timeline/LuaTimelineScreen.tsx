/**
 * LuaTimelineScreen - Visualização Lunar Interativa com Timeline
 * Experiência contemplativa e física de scrubbing temporal
 */

'use client';

import React, { useCallback, useState } from 'react';
import { LunarTimeline } from '@/components/lunar-timeline';
import type { MoonDataCallback } from '@/components/lunar-timeline';

const LuaTimelineScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const handleDateChange = useCallback((date: Date, moonData: MoonDataCallback) => {
    setCurrentDate(date);

    if (process.env.NODE_ENV === 'development') {
      console.warn('📅 Data selecionada:', date);
      console.warn('🌙 Fase lunar:', moonData.phaseName);
      console.warn('💡 Iluminação:', `${(moonData.illumination * 100).toFixed(1)}%`);
    }
  }, []);

  return (
    <LunarTimeline
      initialDate={currentDate}
      onDateChange={handleDateChange}
      showDetails={true}
      className="lua-screen-timeline"
    />
  );
};

export default LuaTimelineScreen;
