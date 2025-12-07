import type { FC } from "react";
import { ZoomCanvas } from "@/components/ZoomCanvas";
import { CanvasErrorBoundary } from "@/components/CanvasErrorBoundary";

/**
 * Exploração interativa do sistema solar com zoom e transições suaves.
 * Clique nos planetas, luas e sol para fazer zoom e explorar cada um.
 */
export const ZoomView: FC = () => {
  return (
    <div className="w-full h-screen flex flex-col bg-black overflow-hidden relative">
      {/* Canvas de animação */}
      <div className="flex-1 relative">
        <CanvasErrorBoundary>
          <ZoomCanvas />
        </CanvasErrorBoundary>
      </div>

      {/* Instruções sobrepostas */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 max-w-xs sm:max-w-sm space-y-2 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-slate-700/50">
        <h3 className="text-xs sm:text-sm font-semibold text-cyan-300">
          Sistema Solar Interativo
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Clique nos corpos celestes para explorar. Use zoom para visualizar
          planetas, luas e spin. Clique no vazio para voltar.
        </p>
        <ul className="text-xs text-slate-400 space-y-1 mt-2 sm:mt-3">
          <li>☀️ <span className="text-yellow-300">Sol</span></li>
          <li>🪨 <span className="text-gray-300">Mercúrio</span></li>
          <li>🌍 <span className="text-blue-300">Terra</span></li>
          <li>🟠 <span className="text-orange-300">Júpiter</span></li>
          <li>🟡 <span className="text-yellow-100">Saturno</span></li>
        </ul>
      </div>

      {/* Dica de clique */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 text-xs text-slate-500 text-center max-w-xs">
        <p>Clique em qualquer planeta para fazer zoom</p>
        <p className="mt-1 text-slate-600 text-xs">Clique no vazio para voltar</p>
      </div>
    </div>
  );
};
