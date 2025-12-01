"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthGate from "@/components/AuthGate";
import { UniverseScene } from "@/components/UniverseScene";
import {
  FocusSphere,
  Sphere,
  SphereConfig,
  SphereId
} from "@/components/Sphere";
import { GalaxyInnerView } from "@/components/views/GalaxyInnerView";
import { LunationsView } from "@/components/views/LunationsView";
import { SolarOrbitView } from "@/components/views/SolarOrbitView";
import {
  ChecklistItem,
  PlanetsChecklistView
} from "@/components/views/PlanetsChecklistView";
import { ComingSoonView } from "@/components/views/ComingSoonView";

/**
 * Configuração estática das seis esferas do universo inicial.
 * Caso o projeto cresça, isso pode ser extraído para um JSON o uma API.
 */
const SPHERES: SphereConfig[] = [
  {
    id: "galaxy",
    label: "Galáxia Interior",
    accent: "#a5b4fc",
    floatAnimation: "float-slow"
  },
  {
    id: "lunations",
    label: "Lunações",
    accent: "#f9a8d4",
    floatAnimation: "float-fast"
  },
  {
    id: "solar",
    label: "Órbita Solar",
    accent: "#facc15",
    floatAnimation: "float-medium"
  },
  {
    id: "planets",
    label: "Planetas",
    accent: "#38bdf8",
    floatAnimation: "float-slow"
  },
  {
    id: "soon1",
    label: "Em Breve I",
    accent: "#22c55e",
    floatAnimation: "float-medium"
  },
  {
    id: "soon2",
    label: "Em Breve II",
    accent: "#eab308",
    floatAnimation: "float-fast"
  }
];

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: "1", label: "Mapear intenções para o próximo ciclo", done: false },
  { id: "2", label: "Escolher um planeta-foco (projeto principal)", done: false },
  { id: "3", label: "Definir um pequeno ritual diário", done: false }
];

export default function UniversePage() {
  const [activeSphere, setActiveSphere] = useState<SphereId | null>(null);
  const [checklistItems, setChecklistItems] =
    useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  const handleToggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const activeConfig = SPHERES.find((s) => s.id === activeSphere) || null;

  return (
    <AuthGate>
      <main className="relative min-h-screen overflow-hidden bg-space-dark text-slate-50">
        {/* Cena 3D de fundo */}
        <ErrorBoundary>
          <UniverseScene />
        </ErrorBoundary>

      {/* Overlay leve para garantir contraste sobre o Canvas */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />

      {/* Conteúdo principal */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header simples */}
        <header className="flex items-center justify-between px-4 py-4 md:px-8">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-slate-400">
              Universo
            </p>
            <h1 className="text-lg font-semibold md:text-xl">
              Portal{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-rose-300 bg-clip-text text-transparent">
                Imersivo
              </span>
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-700/80 bg-black/60 px-3 py-1.5 text-xs text-slate-200 transition hover:border-indigo-400 hover:bg-indigo-500/20 focus-visible:outline-none"
          >
            ← Voltar à entrada
          </Link>
        </header>

        {/* Grade de esferas */}
        <section className="flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-4 md:px-8">
          <p className="mb-8 max-w-xl text-center text-xs text-slate-300 md:text-sm">
            Seis esferas flutuam à sua frente. Cada uma é um pequeno módulo de
            visualização ou prática — uma forma de navegar o cosmos dentro e
            fora de você.
          </p>

          <div
            className="grid w-full max-w-3xl grid-cols-2 gap-8 sm:grid-cols-3 md:gap-10"
            aria-label="Esferas principais do universo"
          >
            {SPHERES.map((sphere) => (
              <Sphere
                key={sphere.id}
                config={sphere}
                onClick={setActiveSphere}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Overlay da esfera em foco + conteúdo associado */}
      <AnimatePresence>
        {activeSphere && activeConfig && (
          <FocusSphere
            config={activeConfig}
            onBack={() => setActiveSphere(null)}
          >
            {activeSphere === "galaxy" && <GalaxyInnerView />}
            {activeSphere === "lunations" && <LunationsView />}
            {activeSphere === "solar" && <SolarOrbitView />}
            {activeSphere === "planets" && (
              <PlanetsChecklistView
                items={checklistItems}
                onToggle={handleToggleChecklist}
              />
            )}
            {activeSphere === "soon1" && (
              <ComingSoonView label="Em Breve I" />
            )}
            {activeSphere === "soon2" && (
              <ComingSoonView label="Em Breve II" />
            )}
          </FocusSphere>
        )}
      </AnimatePresence>
      </main>
    </AuthGate>
  );
}
