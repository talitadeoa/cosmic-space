'use client';

import React, { useEffect, useState } from 'react';
import { GalaxyInnerView } from '../components/GalaxyInnerView';
import { CelestialObject } from '../components/CelestialObject';
import { Card } from '../components/Card';
import CosmosChatModal from '../components/CosmosChatModal';
import { getLatestUserMessageFromHistory } from '@/lib/chatHistory';
import {
  RING_ENERGY_PROMPTS,
  RING_ENERGY_RESPONSES,
  buildRingEnergyStorageKey,
} from '../utils/insightChatPresets';
import type { MoonPhase } from '../utils/moonPhases';
import type { ScreenProps } from '../types';

const RingGalaxyScreen: React.FC<ScreenProps> = ({ navigateTo, navigateWithFocus }) => {
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

  // Raio da órbita das luas (distância do centro)
  const orbitRadius = 180;

  // Calcular posições das 4 luas em um círculo (90 graus de distância)
  const moonPositions = [
    { angle: 0, type: 'luaCheia' as const, label: 'Top' }, // 0° - Top
    { angle: 90, type: 'luaCrescente' as const, label: 'Right' }, // 90° - Right
    { angle: 180, type: 'luaNova' as const, label: 'Bottom' }, // 180° - Bottom
    { angle: 270, type: 'luaMinguante' as const, label: 'Left' }, // 270° - Left
  ];

  const getMoonPosition = (angleDegrees: number) => {
    const angleRad = (angleDegrees * Math.PI) / 180;
    const x = Math.cos(angleRad) * orbitRadius;
    const y = Math.sin(angleRad) * orbitRadius;
    return { x, y };
  };

  const handleMoonClick = (moonType: MoonPhase) => {
    setSelectedMoon(moonType);
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-violet-300/70 shadow-[0_0_55px_rgba(196,181,253,0.8)]">
        <Card
          interactive
          onClick={() => navigateTo('columnSolLuaPlaneta')}
          className="w-52 text-center"
        >
          <GalaxyInnerView compact />
        </Card>
      </div>

      {/* Luas posicionadas em círculo orbital */}
      {moonPositions.map((moon, index) => {
        const { x, y } = getMoonPosition(moon.angle);
        const floatOffsets = [-2, 1, 2, -1];

        return (
          <div
            key={moon.label}
            className="absolute"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            }}
          >
            <CelestialObject
              type={moon.type}
              size="sm"
              interactive
              onClick={() => handleMoonClick(moon.type)}
              floatOffset={floatOffsets[index]}
            />
          </div>
        );
      })}

      {selectedMoon && (
        <CosmosChatModal
          isOpen={Boolean(selectedMoon)}
          storageKey={buildRingEnergyStorageKey(selectedMoon)}
          title={RING_ENERGY_PROMPTS[selectedMoon].title}
          eyebrow="Energia da fase"
          subtitle={RING_ENERGY_PROMPTS[selectedMoon].question}
          placeholder={RING_ENERGY_PROMPTS[selectedMoon].placeholder}
          systemGreeting={RING_ENERGY_PROMPTS[selectedMoon].title}
          systemQuestion={RING_ENERGY_PROMPTS[selectedMoon].question}
          initialValue={energyNotes[selectedMoon]}
          submitLabel="✨ Concluir energia"
          tone="violet"
          submitStrategy="last"
          systemResponses={RING_ENERGY_RESPONSES}
          headerExtra={
            <div className="mt-3 text-xs text-violet-200/70">
              <button
                className="underline underline-offset-2 transition hover:text-white"
                onClick={() =>
                  navigateWithFocus('luaList', {
                    type: selectedMoon,
                    size: 'sm',
                  })
                }
              >
                Ir para insights da Lua
              </button>
            </div>
          }
          onClose={() => setSelectedMoon(null)}
          onSubmit={async (value) => {
            setEnergyNotes((prev) => ({ ...prev, [selectedMoon]: value }));
          }}
        />
      )}
    </div>
  );
};

export default RingGalaxyScreen;
