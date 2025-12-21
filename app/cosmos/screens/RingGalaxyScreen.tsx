"use client";

import React, { useEffect, useState } from "react";
import { GalaxyInnerView } from "@/components/views/GalaxyInnerView";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import CosmosChatModal from "@/components/CosmosChatModal";
import { getLatestUserMessageFromHistory } from "@/lib/chatHistory";
import type { ScreenProps } from "../types";

const RingGalaxyScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  type MoonPhase = "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante";

  const [selectedMoon, setSelectedMoon] = useState<MoonPhase | null>(null);
  const [energyNotes, setEnergyNotes] = useState<Record<MoonPhase, string>>({
    luaNova: "",
    luaCrescente: "",
    luaCheia: "",
    luaMinguante: "",
  });

  useEffect(() => {
    const next: Record<MoonPhase, string> = {
      luaNova: getLatestUserMessageFromHistory("energia-ring-luaNova"),
      luaCrescente: getLatestUserMessageFromHistory("energia-ring-luaCrescente"),
      luaCheia: getLatestUserMessageFromHistory("energia-ring-luaCheia"),
      luaMinguante: getLatestUserMessageFromHistory("energia-ring-luaMinguante"),
    };
    setEnergyNotes(next);
  }, []);

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

  const moonEnergyPrompts: Record<MoonPhase, { title: string; question: string; placeholder: string }> = {
    luaNova: {
      title: "Energia da Lua Nova",
      question: "Como você se sente na Nova, no início das coisas?",
      placeholder: "Ex.: curiosa, aberta a experimentar, em modo rascunho...",
    },
    luaCrescente: {
      title: "Energia da Lua Crescente",
      question: "Que impulso está crescendo e pedindo movimento?",
      placeholder: "Ex.: disciplinada, com vontade de testar, buscando ritmo...",
    },
    luaCheia: {
      title: "Energia da Lua Cheia",
      question: "Como sua energia transborda quando tudo aparece?",
      placeholder: "Ex.: expansiva, cheia de ideias, querendo celebrar...",
    },
    luaMinguante: {
      title: "Energia da Lua Minguante",
      question: "O que pede pausa ou liberação agora?",
      placeholder: "Ex.: cansada, pronta para simplificar, recolhendo energia...",
    },
  };

  const handleMoonClick = (moonType: MoonPhase) => {
    setSelectedMoon(moonType);
  };

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
          storageKey={`energia-ring-${selectedMoon}`}
          title={moonEnergyPrompts[selectedMoon].title}
          eyebrow="Energia da fase"
          subtitle={moonEnergyPrompts[selectedMoon].question}
          placeholder={moonEnergyPrompts[selectedMoon].placeholder}
          systemGreeting={moonEnergyPrompts[selectedMoon].title}
          systemQuestion={moonEnergyPrompts[selectedMoon].question}
          initialValue={energyNotes[selectedMoon]}
          submitLabel="✨ Concluir energia"
          tone="violet"
          submitStrategy="last"
          systemResponses={[
            "Energia registrada com clareza. ✨",
            "Seu corpo falou, e você ouviu. 🌙",
            "Que leitura honesta do momento. 💫",
          ]}
          headerExtra={
            <div className="mt-3 text-xs text-violet-200/70">
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
          }}
        />
      )}
    </div>
  );
};

export default RingGalaxyScreen;
