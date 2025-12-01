// app/teste/page.tsx (exemplo)
"use client";

import { useState } from "react";
import { LuaView } from "../../components/html-views/LuaView";
// depois você pode importar as outras views: LuaFasesView, SolView, ZoomView etc.

const VIEWS = [
  { id: "lua", label: "Caminho de Luas", component: LuaView },
  // { id: "fases", label: "Fases da Lua", component: LuaFasesView },
  // { id: "sol", label: "Órbita Trocoidal", component: SolView },
  // { id: "zoom", label: "Sistema Solar", component: ZoomView },
];

export default function TestePage() {
  const [selectedViewId, setSelectedViewId] = useState("lua");
  const SelectedComponent =
    VIEWS.find((v) => v.id === selectedViewId)?.component ?? LuaView;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">Página de Teste</h1>

      <div className="flex gap-2 mb-8 flex-wrap justify-center">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            onClick={() => setSelectedViewId(view.id)}
            className={`px-4 py-2 rounded-full border text-sm transition
              ${
                view.id === selectedViewId
                  ? "bg-sky-500 border-sky-400 text-white shadow"
                  : "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
              }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      <section className="w-full max-w-5xl aspect-[16/9] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <SelectedComponent />
      </section>
    </main>
  );
}
