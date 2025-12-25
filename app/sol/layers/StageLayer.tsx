'use client';

import React from 'react';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import SolOrbitStage from '../components/SolOrbitStage';

type StageLayerProps = {
  onSolClick: () => void;
  onMoonClick: (phase: MoonPhase) => void;
};

const StageLayer: React.FC<StageLayerProps> = ({ onSolClick, onMoonClick }) => {
  return <SolOrbitStage onSolClick={onSolClick} onMoonClick={onMoonClick} />;
};

export default StageLayer;
