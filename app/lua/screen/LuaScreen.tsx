/**
 * LuaScreen - Visualização Lunar Interativa com Timeline
 * Experiência contemplativa e física de scrubbing temporal
 */

'use client';

import React, { useState, useCallback } from 'react';
import { LunarTimeline } from '@/components/lunar-timeline';
import type { MoonData } from '@/components/lunar-timeline';

type LuaScreenProps = {
  navigateWithFocus?: any;
};

const LuaScreen: React.FC<LuaScreenProps> = ({ navigateWithFocus }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentMoonData, setCurrentMoonData] = useState<MoonData | null>(null);

  /**
   * Handler quando a data mudar via timeline scrubbing
   */
  const handleDateChange = useCallback((date: Date, moonData: MoonData) => {
    setCurrentDate(date);
    setCurrentMoonData(moonData);
    
    // Log para debug (opcional)
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

export default LuaScreen;
