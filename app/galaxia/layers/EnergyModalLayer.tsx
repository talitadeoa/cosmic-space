'use client';

import React from 'react';
import CosmosChatModal from '@/app/cosmos/components/CosmosChatModal';
import {
  RING_ENERGY_PROMPTS,
  RING_ENERGY_RESPONSES,
  buildRingEnergyStorageKey,
} from '@/app/cosmos/utils/insightChatPresets';
import type { MoonPhase } from '@/app/cosmos/utils/moonPhases';

type EnergyModalLayerProps = {
  selectedMoon: MoonPhase | null;
  energyNotes: Record<MoonPhase, string>;
  onClose: () => void;
  onSubmit: (moon: MoonPhase, value: string) => Promise<void> | void;
  onNavigateToLuaInsights?: (moon: MoonPhase) => void;
};

const EnergyModalLayer: React.FC<EnergyModalLayerProps> = ({
  selectedMoon,
  energyNotes,
  onClose,
  onSubmit,
  onNavigateToLuaInsights,
}) => {
  if (!selectedMoon) {
    return null;
  }

  const prompt = RING_ENERGY_PROMPTS[selectedMoon];

  return (
    <CosmosChatModal
      isOpen={Boolean(selectedMoon)}
      storageKey={buildRingEnergyStorageKey(selectedMoon)}
      title={prompt.title}
      eyebrow="Energia da fase"
      subtitle={prompt.question}
      placeholder={prompt.placeholder}
      systemGreeting={prompt.title}
      systemQuestion={prompt.question}
      initialValue={energyNotes[selectedMoon]}
      submitLabel="✨ Concluir energia"
      tone="violet"
      submitStrategy="last"
      systemResponses={RING_ENERGY_RESPONSES}
      headerExtra={
        onNavigateToLuaInsights ? (
          <div className="mt-3 text-xs text-violet-200/70">
            <button
              className="underline underline-offset-2 transition hover:text-white"
              onClick={() => onNavigateToLuaInsights(selectedMoon)}
            >
              Ir para insights da Lua
            </button>
          </div>
        ) : undefined
      }
      onClose={onClose}
      onSubmit={async (value) => {
        await onSubmit(selectedMoon, value);
      }}
    />
  );
};

export default EnergyModalLayer;
