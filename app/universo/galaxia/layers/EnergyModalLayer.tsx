'use client';

import React, { useState } from 'react';
import CosmosChatModal from '@/app/cosmos/components/CosmosChatModal';
import EmotionalInput, { Emotion } from '@/components/EmotionalInput';
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
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);

  if (!selectedMoon) {
    return null;
  }

  const prompt = RING_ENERGY_PROMPTS[selectedMoon];

  return (
    <CosmosChatModal
      isOpen={Boolean(selectedMoon)}
      requiresAuthOnSave
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
        <div className="mt-6 space-y-4">
          {/* Emotional Input */}
          <div>
            <label className="block text-xs font-semibold text-violet-300 mb-3">
              Qual é sua emoção?
            </label>
            <div className="rounded-lg bg-violet-950/30 p-3 border border-violet-500/20">
              <EmotionalInput
                onEmotionSelect={setSelectedEmotion}
                selectedEmotion={selectedEmotion}
                size="sm"
                disabled={false}
              />
            </div>
            {selectedEmotion && (
              <p className="text-xs text-violet-300/70 mt-2">
                Emoção selecionada: <span className="font-semibold">{selectedEmotion.label}</span>
              </p>
            )}
          </div>

          {/* Navigation Link */}
          {onNavigateToLuaInsights && (
            <div className="pt-2 text-xs text-violet-200/70 border-t border-violet-500/20">
              <button
                className="underline underline-offset-2 transition hover:text-white"
                onClick={() => onNavigateToLuaInsights(selectedMoon)}
              >
                Ir para insights da Lua
              </button>
            </div>
          )}
        </div>
      }
      onClose={onClose}
      onSubmit={async (value) => {
        await onSubmit(selectedMoon, value);
      }}
    />
  );
};

export default EnergyModalLayer;
