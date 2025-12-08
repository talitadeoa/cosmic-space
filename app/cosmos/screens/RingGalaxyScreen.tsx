"use client";

import React, { useState } from "react";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
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
  const [inputValue, setInputValue] = useState("");
  const [initialEnergyValue, setInitialEnergyValue] = useState("");

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
    const currentValue = energyNotes[moonType] ?? "";
    setInputValue(currentValue);
    setInitialEnergyValue(currentValue);
  };

  const handleEnergyChange = (value: string) => {
    setInputValue(value);
    if (selectedMoon) {
      setEnergyNotes((prev) => ({ ...prev, [selectedMoon]: value }));
    }
  };

  const handleDiscardChanges = () => {
    if (selectedMoon) {
      setEnergyNotes((prev) => ({ ...prev, [selectedMoon]: initialEnergyValue }));
      setInputValue(initialEnergyValue);
    }
    setSelectedMoon(null);
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-violet-300/70 shadow-[0_0_55px_rgba(196,181,253,0.8)]">
        <Card
          interactive
          onClick={() => navigateTo("columnSolLuaPlaneta")}
          className="w-40"
        />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedMoon(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-violet-300/30 bg-slate-900/95 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-violet-300">
                  {moonEnergyPrompts[selectedMoon].title}
                </p>
                <p className="text-xs text-violet-200/80">
                  {moonEnergyPrompts[selectedMoon].question}
                </p>
              </div>
              <button
                onClick={() => setSelectedMoon(null)}
                className="rounded-full p-1 text-violet-200 transition hover:bg-violet-300/10 hover:text-white"
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <textarea
              className="w-full rounded-xl border border-violet-300/30 bg-slate-800/70 p-3 text-sm text-violet-50 placeholder:text-violet-200/60 focus:border-violet-300/60 focus:outline-none focus:ring-1 focus:ring-violet-300/60"
              rows={4}
              value={inputValue}
              onChange={(e) => handleEnergyChange(e.target.value)}
              placeholder={moonEnergyPrompts[selectedMoon].placeholder}
            />

            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-violet-300/50 bg-transparent px-4 py-2 text-sm font-medium text-violet-100 transition hover:bg-violet-300/10"
                onClick={handleDiscardChanges}
              >
                Descartar alterações
              </button>
              <button
                className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/60"
                onClick={() => setSelectedMoon(null)}
              >
                Concluído
              </button>
            </div>

            <div className="mt-3 text-xs text-violet-200/70">
              <p className="font-medium">Valor atual:</p>
              <p className="mt-1 rounded-lg border border-violet-300/20 bg-slate-800/40 p-2 min-h-[48px]">
                {energyNotes[selectedMoon]?.trim() || "Ainda não registrado"}
              </p>
            </div>

            <div className="mt-3 text-xs text-emerald-200/80">
              <p className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                Salvando automaticamente enquanto você digita
              </p>
            </div>

            <div className="mt-4 text-xs text-violet-200/70">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default RingGalaxyScreen;
