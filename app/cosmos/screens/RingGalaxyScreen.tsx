"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GalaxyInnerView } from "../components/GalaxyInnerView";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import CosmosChatModal from "../components/CosmosChatModal";
import { getLatestUserMessageFromHistory } from "@/lib/chatHistory";
import {
  RING_ENERGY_PROMPTS,
  RING_ENERGY_RESPONSES,
  buildRingEnergyStorageKey,
} from "../utils/insightChatPresets";
import { PHASE_VIBES } from "../utils/phaseVibes";
import type { MoonPhase } from "../utils/moonPhases";
import type { ScreenProps } from "../types";
import { usePhaseInputs } from "@/hooks/usePhaseInputs";
import type { PhaseInputRecord } from "@/lib/phaseInputs";

const RingGalaxyScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  const [selectedMoon, setSelectedMoon] = useState<MoonPhase | null>(null);
  const [energyNotes, setEnergyNotes] = useState<Record<MoonPhase, string>>({
    luaNova: "",
    luaCrescente: "",
    luaCheia: "",
    luaMinguante: "",
  });
  const [phaseInputs, setPhaseInputs] = useState<Record<MoonPhase, PhaseInputRecord[]>>({
    luaNova: [],
    luaCrescente: [],
    luaCheia: [],
    luaMinguante: [],
  });
  const { loadInputs, saveInput } = usePhaseInputs();

  useEffect(() => {
    let isActive = true;

    const fallbackNotes: Record<MoonPhase, string> = {
      luaNova: getLatestUserMessageFromHistory(buildRingEnergyStorageKey("luaNova")),
      luaCrescente: getLatestUserMessageFromHistory(buildRingEnergyStorageKey("luaCrescente")),
      luaCheia: getLatestUserMessageFromHistory(buildRingEnergyStorageKey("luaCheia")),
      luaMinguante: getLatestUserMessageFromHistory(buildRingEnergyStorageKey("luaMinguante")),
    };

    const loadPhaseInputs = async () => {
      try {
        const items = await loadInputs({ limit: 200 });
        if (!isActive) return;

        const grouped: Record<MoonPhase, PhaseInputRecord[]> = {
          luaNova: [],
          luaCrescente: [],
          luaCheia: [],
          luaMinguante: [],
        };

        items.forEach((item) => {
          grouped[item.moonPhase].push(item);
        });

        const nextNotes: Record<MoonPhase, string> = { ...fallbackNotes };
        (Object.keys(grouped) as MoonPhase[]).forEach((phase) => {
          const latestEnergy = grouped[phase].find(
            (item) => item.inputType === "energia" && item.sourceId === "ring",
          );
          if (latestEnergy?.content) {
            nextNotes[phase] = latestEnergy.content;
          }
        });

        setPhaseInputs(grouped);
        setEnergyNotes(nextNotes);
      } catch (error) {
        console.warn("Falha ao carregar inputs da fase, usando histórico local.", error);
        setEnergyNotes(fallbackNotes);
      }
    };

    loadPhaseInputs();

    return () => {
      isActive = false;
    };
  }, [loadInputs]);

  const upsertPhaseInput = (item: PhaseInputRecord) => {
    setPhaseInputs((prev) => {
      const next = { ...prev };
      const list = next[item.moonPhase] ?? [];
      const index = list.findIndex((entry) => entry.id === item.id);
      if (index >= 0) {
        const updated = [...list];
        updated[index] = item;
        next[item.moonPhase] = updated;
      } else {
        next[item.moonPhase] = [item, ...list];
      }
      return next;
    });
  };

  // Raio da órbita das luas (distância do centro)
  const orbitRadius = 180;
  
  // Calcular posições das 4 luas em um círculo (90 graus de distância)
  const moonPositions = [
    { angle: 0, type: "luaCheia" as const, label: "Top" },           // 0° - Top
    { angle: 90, type: "luaCrescente" as const, label: "Right" },    // 90° - Right
    { angle: 180, type: "luaNova" as const, label: "Bottom" },       // 180° - Bottom
    { angle: 270, type: "luaMinguante" as const, label: "Left" },    // 270° - Left
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

  const contextEntries = useMemo(() => {
    if (!selectedMoon) return [];
    const entries: Array<{ id: string; label: string; content: string }> = [];
    const items = phaseInputs[selectedMoon] ?? [];
    const quarterly = items.find((item) => item.inputType === "insight_trimestral");
    if (quarterly) {
      const meta = quarterly.metadata ?? {};
      const quarterLabel =
        typeof meta.quarterLabel === "string" && meta.quarterLabel.trim()
          ? meta.quarterLabel
          : "";
      entries.push({
        id: `quarter-${quarterly.id}`,
        label: quarterLabel ? `Insight Trimestral • ${quarterLabel}` : "Insight Trimestral",
        content: quarterly.content,
      });
    }

    const tasks = items.filter((item) => item.inputType === "tarefa");
    tasks.forEach((item) => {
      if (entries.length >= 6) return;
      const meta = item.metadata ?? {};
      const label =
        (typeof meta.project === "string" && meta.project.trim()) ||
        (typeof meta.category === "string" && meta.category.trim()) ||
        "Tarefa";
      const suffix = typeof meta.dueDate === "string" && meta.dueDate.trim()
        ? ` • ${meta.dueDate}`
        : "";
      entries.push({
        id: `task-${item.id}`,
        label: `${label}${suffix}`,
        content: item.content,
      });
    });

    return entries;
  }, [phaseInputs, selectedMoon]);

  const energySuggestions = useMemo(() => {
    if (!selectedMoon) return [];
    return PHASE_VIBES[selectedMoon].tags.map((tag) => ({
      id: `tag-${selectedMoon}-${tag}`,
      label: tag,
      meta: { tags: [tag] },
    }));
  }, [selectedMoon]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-violet-300/70 shadow-[0_0_55px_rgba(196,181,253,0.8)]">
        <Card
          interactive
          onClick={() => navigateTo("columnSolLuaPlaneta")}
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
          contextTitle={`Vibe ${PHASE_VIBES[selectedMoon].label}`}
          contextEntries={contextEntries}
          placeholder={RING_ENERGY_PROMPTS[selectedMoon].placeholder}
          systemGreeting={RING_ENERGY_PROMPTS[selectedMoon].title}
          systemQuestion={RING_ENERGY_PROMPTS[selectedMoon].question}
          initialValue={energyNotes[selectedMoon]}
          submitLabel="✨ Concluir energia"
          tone="violet"
          submitStrategy="last"
          systemResponses={RING_ENERGY_RESPONSES}
          suggestions={energySuggestions}
          headerExtra={
            <div className="mt-3 text-xs text-violet-200/70">
              <div className="mb-2 text-[0.65rem] uppercase tracking-[0.22em] text-violet-100/80">
                {PHASE_VIBES[selectedMoon].label}
              </div>
              <button
                className="underline underline-offset-2 transition hover:text-white"
                onClick={() =>
                  navigateWithFocus("luaList", {
                    type: selectedMoon,
                    size: "sm",
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
            const saved = await saveInput({
              moonPhase: selectedMoon,
              inputType: "energia",
              sourceId: "ring",
              content: value,
              vibe: PHASE_VIBES[selectedMoon].label,
              metadata: { source: "ring-galaxy" },
            });
            upsertPhaseInput(saved);
          }}
        />
      )}
    </div>
  );
};

export default RingGalaxyScreen;
