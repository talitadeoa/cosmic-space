'use client';

import React from 'react';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import SolOrbitStage from './SolOrbitStage';

type StageLayerProps = {
  onSolClick: () => void;
  onMoonClick: (phase: MoonPhase) => void;
  onOrbitClick?: () => void;
  onOutsideClick?: () => void;
};

const StageLayer: React.FC<StageLayerProps> = ({
  onSolClick,
  onMoonClick,
  onOrbitClick,
  onOutsideClick,
}) => {
  return (
    <SolOrbitStage
      onSolClick={onSolClick}
      onMoonClick={onMoonClick}
      onOrbitClick={onOrbitClick}
      onOutsideClick={onOutsideClick}
    />
  );
};

export default StageLayer;
