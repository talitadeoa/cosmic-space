'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getLatestUserMessageFromHistory } from '@/lib/chatHistory';
import {
  buildRingEnergyStorageKey,
} from '@/app/cosmos/utils/insightChatPresets';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';
import GalaxyCoreLayer from './layers/GalaxyCoreLayer';
import OrbitingMoonsLayer, { OrbitingMoon } from './layers/OrbitingMoonsLayer';
import EnergyModalLayer from './layers/EnergyModalLayer';

type RingGalaxyExperienceProps = {
  onNavigateToColumn?: () => void;
  onNavigateToLuaInsights?: (moon: MoonPhase) => void;
};

const ORBIT_RADIUS = 180;

const moonDescriptors: Array<{
  angle: number;
  type: MoonPhase;
  label: string;
  floatOffset: number;
}> = [
  { angle: 0, type: 'luaCheia', label: 'Top', floatOffset: -2 },
  { angle: 90, type: 'luaCrescente', label: 'Right', floatOffset: 1 },
  { angle: 180, type: 'luaNova', label: 'Bottom', floatOffset: 2 },
  { angle: 270, type: 'luaMinguante', label: 'Left', floatOffset: -1 },
];

const RingGalaxyExperience: React.FC<RingGalaxyExperienceProps> = ({
  onNavigateToColumn,
  onNavigateToLuaInsights,
}) => {
  const [selectedMoon, setSelectedMoon] = useState<MoonPhase | null>(null);
  const [energyNotes, setEnergyNotes] = useState<Record<MoonPhase, string>>({
    luaNova: '',
    luaCrescente: '',
    luaCheia: '',
    luaMinguante: '',
  });

  useEffect(() => {
    const next: Record<MoonPhase, string> = {
      luaNova: getLatestUserMessageFromHistory(buildRingEnergyStorageKey('luaNova')),
      luaCrescente: getLatestUserMessageFromHistory(buildRingEnergyStorageKey('luaCrescente')),
      luaCheia: getLatestUserMessageFromHistory(buildRingEnergyStorageKey('luaCheia')),
      luaMinguante: getLatestUserMessageFromHistory(buildRingEnergyStorageKey('luaMinguante')),
    };

    setEnergyNotes(next);
  }, []);

  const moons: OrbitingMoon[] = useMemo(() => {
    return moonDescriptors.map((moon) => {
      const angleRad = (moon.angle * Math.PI) / 180;
      const x = Math.cos(angleRad) * ORBIT_RADIUS;
      const y = Math.sin(angleRad) * ORBIT_RADIUS;

      return {
        label: moon.label,
        type: moon.type,
        floatOffset: moon.floatOffset,
        position: { x, y },
      };
    });
  }, []);

  const handleSubmit = useCallback((moon: MoonPhase, value: string) => {
    setEnergyNotes((prev) => ({ ...prev, [moon]: value }));
  }, []);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <GalaxyCoreLayer onNavigate={onNavigateToColumn} />

      <OrbitingMoonsLayer
        moons={moons}
        onSelect={(moon) => setSelectedMoon(moon)}
      />

      <EnergyModalLayer
        selectedMoon={selectedMoon}
        energyNotes={energyNotes}
        onClose={() => setSelectedMoon(null)}
        onSubmit={handleSubmit}
        onNavigateToLuaInsights={onNavigateToLuaInsights}
      />
    </div>
  );
};

export type { RingGalaxyExperienceProps };
export default RingGalaxyExperience;
