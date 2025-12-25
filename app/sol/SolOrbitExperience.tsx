'use client';

import React, { useEffect, useState } from 'react';
import StageLayer from './layers/StageLayer';
import QuarterlyModalLayer from './layers/QuarterlyModalLayer';
import AnnualModalLayer from './layers/AnnualModalLayer';
import { useQuarterlyInsights } from '@/hooks/useQuarterlyInsights';
import { useAnnualInsights } from '@/hooks/useAnnualInsights';
import { useYear } from '@/app/cosmos/context/YearContext';
import {
  QUARTERLY_INFO,
  QUARTERLY_PROMPTS,
  QUARTERLY_RESPONSES,
  buildAnnualStorageKey,
  buildQuarterlyStorageKey,
} from '@/app/cosmos/utils/insightChatPresets';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';

const SolOrbitExperience: React.FC = () => {
  const [isQuarterlyModalOpen, setIsQuarterlyModalOpen] = useState(false);
  const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<MoonPhase>('luaNova');
  const [displayYear, setDisplayYear] = useState<number>(new Date().getFullYear());
  const { saveInsight: saveQuarterlyInsight } = useQuarterlyInsights();
  const { saveInsight: saveAnnualInsight } = useAnnualInsights();
  const { selectedYear } = useYear();
  const phaseInfo = QUARTERLY_INFO[selectedMoonPhase];

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (selectedYear !== currentYear) {
      setDisplayYear(selectedYear);
    } else {
      setDisplayYear(currentYear);
    }
  }, [selectedYear]);

  const quarterlyStorageKey = buildQuarterlyStorageKey(displayYear, selectedMoonPhase);
  const annualStorageKey = buildAnnualStorageKey(displayYear);

  const handleMoonClick = (phase: MoonPhase) => {
    setSelectedMoonPhase(phase);
    setIsQuarterlyModalOpen(true);
  };

  const handleSolClick = () => {
    setIsAnnualModalOpen(true);
  };

  const handleQuarterlyInsightSubmit = async (insight: string) => {
    await saveQuarterlyInsight(selectedMoonPhase, insight, undefined, displayYear);
  };

  const handleAnnualInsightSubmit = async (insight: string) => {
    await saveAnnualInsight(insight, displayYear);
  };

  return (
    <>
      <StageLayer onSolClick={handleSolClick} onMoonClick={handleMoonClick} />

      <QuarterlyModalLayer
        isOpen={isQuarterlyModalOpen}
        storageKey={quarterlyStorageKey}
        title={phaseInfo.name}
        eyebrow="Insight Trimestral"
        subtitle={phaseInfo.quarter}
        badge={phaseInfo.months}
        placeholder={QUARTERLY_PROMPTS[selectedMoonPhase].placeholder}
        systemGreeting={QUARTERLY_PROMPTS[selectedMoonPhase].greeting}
        systemQuestion={QUARTERLY_PROMPTS[selectedMoonPhase].question}
        systemResponses={QUARTERLY_RESPONSES[selectedMoonPhase]}
        onClose={() => setIsQuarterlyModalOpen(false)}
        onSubmit={handleQuarterlyInsightSubmit}
      />

      <AnnualModalLayer
        isOpen={isAnnualModalOpen}
        storageKey={annualStorageKey}
        title={`${displayYear}`}
        subtitle="☀️ Sol"
        displayYear={displayYear}
        onClose={() => setIsAnnualModalOpen(false)}
        onSubmit={handleAnnualInsightSubmit}
      />
    </>
  );
};

export default SolOrbitExperience;
