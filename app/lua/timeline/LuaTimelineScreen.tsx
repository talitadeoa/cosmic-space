/**
 * LuaTimelineScreen - Visualização Lunar Interativa com Timeline
 * Experiência contemplativa e física de scrubbing temporal
 */

'use client';

import React, { useCallback, useState } from 'react';
import { LunarTimeline } from '@/components/lunar-timeline';
import type { MoonData } from '@/components/lunar-timeline';

const LuaTimelineScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const handleDateChange = useCallback((date: Date, moonData: MoonData) => {
    setCurrentDate(date);

    if (process.env.NODE_ENV === 'development') {
      console.log('📅 Data selecionada:', date);
      console.log('🌙 Fase lunar:', moonData.phaseName);
      console.log('💡 Iluminação:', `${(moonData.illumination * 100).toFixed(1)}%`);
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
