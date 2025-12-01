import type { FC } from "react";
import { PhasesCanvas } from "@/components/PhasesCanvas";
import { CanvasErrorBoundary } from "@/components/CanvasErrorBoundary";

/**
 * Exploração interativa das fases da Lua.
 * Divida em 4 quadrantes (A1, A2, B1, B2), cada um mostrando a Lua
 * em sua posição de órbita com Terra movendo-se suavemente.
 * Passe o mouse por cada quadrante para ver a animação!
 */
export const PhasesView: FC = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative">
      {/* Canvas de animação */}
      <div className="flex-1 relative">
        <CanvasErrorBoundary>
          <PhasesCanvas />
        </CanvasErrorBoundary>
      </div>

      {/* Instruções sobrepostas */}
      <div className="absolute top-6 left-6 max-w-sm space-y-2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-cyan-300">
          Fases da Lua
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Passe o mouse pelos 4 quadrantes para ver a Terra orbitar o Sol e a
          Lua em suas diferentes fases: Nova, Crescente, Cheia e Minguante.
        </p>
        <ul className="text-xs text-slate-400 space-y-1 mt-3">
          <li>
            <span className="text-slate-200">⊕ A1 (topo-esquerda)</span> — Lua
            Cheia
          </li>
          <li>
            <span className="text-slate-200">⊖ A2 (topo-direita)</span> — Lua
            Nova
          </li>
          <li>
            <span className="text-slate-200">◑ B1 (baixo-esquerda)</span> — Quarto
            Minguante
          </li>
          <li>
            <span className="text-slate-200">◐ B2 (baixo-direita)</span> — Quarto
            Crescente
          </li>
        </ul>
      </div>

      {/* Dica de mouse */}
      <div className="absolute bottom-6 right-6 text-xs text-slate-500 text-center max-w-xs">
        <p>Passe o mouse pelos quadrantes para explorar as órbitas</p>
      </div>
    </div>
  );
};
