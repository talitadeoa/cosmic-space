import type { FC } from "react";
import { SolarOrbitCanvas } from "@/components/SolarOrbitCanvas";
import { CanvasErrorBoundary } from "@/components/CanvasErrorBoundary";

/**
 * Visualização da órbita trocoidal da Lua ao redor da Terra,
 * orbitando o Sol — um sistema de movimentos cósmicos em harmonia.
 */
export const SolarOrbitView: FC = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Canvas de animação */}
      <div className="flex-1 relative">
        <CanvasErrorBoundary>
          <SolarOrbitCanvas />
        </CanvasErrorBoundary>
      </div>

      {/* Informações descritivas */}
      <div className="absolute bottom-6 left-6 max-w-sm space-y-2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-cyan-300">
          Órbita Trocoidal
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          A Lua segue uma trajetória hipnótica ao orbitar a Terra, que por sua
          vez orbita o Sol. Este movimento composto cria uma curva trocoidal —
          um padrão que reflete a dança perpétua dos corpos celestes.
        </p>
        <ul className="text-xs text-slate-400 space-y-1 mt-3">
          <li>
            <span className="text-cyan-200">☀️ Sol</span> — Centro do sistema
          </li>
          <li>
            <span className="text-blue-300">🌍 Earth</span> — Órbita em azul
          </li>
          <li>
            <span className="text-cyan-100">🌙 Moon</span> — Traço luminoso
          </li>
        </ul>
      </div>

      {/* Crédito (opcional) */}
      <div className="absolute top-6 right-6 text-xs text-slate-500">
        Sistema Solar em Tempo Real
      </div>
    </div>
  );
};
