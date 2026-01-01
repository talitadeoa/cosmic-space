'use client';

import React from 'react';
import { CelestialObject } from '@/app/cosmos/components/CelestialObject';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';

type OrbitingMoon = {
  label: string;
  type: MoonPhase;
  position: { x: number; y: number };
  floatOffset: number;
};

type OrbitingMoonsLayerProps = {
  moons: OrbitingMoon[];
  onSelect?: (moon: MoonPhase) => void;
};

const OrbitingMoonsLayer: React.FC<OrbitingMoonsLayerProps> = ({ moons, onSelect }) => {
  return (
    <>
      {moons.map((moon) => (
        <div
          key={moon.label}
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${moon.position.x}px), calc(-50% + ${moon.position.y}px))`,
          }}
        >
          <CelestialObject
            type={moon.type}
            size="sm"
            interactive={Boolean(onSelect)}
            onClick={() => onSelect?.(moon.type)}
            floatOffset={moon.floatOffset}
          />
        </div>
      ))}
    </>
  );
};

export type { OrbitingMoon };
export default OrbitingMoonsLayer;
