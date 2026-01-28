'use client';

import React from 'react';
import { Card } from '@/app/cosmos/components/Card';
import { GalaxyInnerView } from '@/app/cosmos/galaxia/components/GalaxyInnerView';

type GalaxyCoreLayerProps = {
  onNavigate?: () => void;
};

const GalaxyCoreLayer: React.FC<GalaxyCoreLayerProps> = ({ onNavigate }) => {
  return (
    <div className="relative flex h-52 w-52 sm:h-64 sm:w-64 items-center justify-center rounded-full border-4 border-violet-300/70 shadow-[0_0_45px_rgba(196,181,253,0.7)] sm:shadow-[0_0_55px_rgba(196,181,253,0.8)]">
      <Card interactive={Boolean(onNavigate)} onClick={onNavigate} className="w-40 sm:w-52 text-center">
        <GalaxyInnerView compact />
      </Card>
    </div>
  );
};

export default GalaxyCoreLayer;
