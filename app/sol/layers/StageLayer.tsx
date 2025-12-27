'use client';

import React from 'react';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import SolOrbitStage from '../components/SolOrbitStage';

type StageLayerProps = {
  onSolClick: () => void;
  onMoonClick: (phase: MoonPhase) => void;
  onSpaceClick?: () => void;
};

const StageLayer: React.FC<StageLayerProps> = ({ onSolClick, onMoonClick, onSpaceClick }) => {
  return (
    <SolOrbitStage onSolClick={onSolClick} onMoonClick={onMoonClick} onSpaceClick={onSpaceClick} />
  );
};

export default StageLayer;
