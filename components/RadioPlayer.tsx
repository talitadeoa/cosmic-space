"use client";

import { useAudioPlayer, RadioStation } from "@/hooks/useAudioPlayer";
import { useState } from "react";

const RADIO_STATIONS: RadioStation[] = [
  {
    id: "ambient",
    name: "🌌 Cosmic Ambient",
    url: "https://stream.zeno.fm/qewbq9kvnqruv"
  },
  {
    id: "lo-fi",
    name: "🎵 Lo-Fi Beats",
    url: "https://stream.zeno.fm/7npc13b3h5quv"
  },
  {
    id: "space-sounds",
    name: "🚀 Space Sounds",
    url: "https://stream.zeno.fm/1n0xa7yft6zuv"
  },
  {
    id: "chillwave",
    name: "🌊 Chillwave",
    url: "https://stream.zeno.fm/kpv77c4tnfruv"
  }
];

export default function RadioPlayer() {
  const { isPlaying, currentStation, volume, setVolume, toggle, isLoading } =
    useAudioPlayer();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Player aberto */}
      {isOpen && (
        <div className="mb-2 sm:mb-4 rounded-xl sm:rounded-2xl border border-slate-700 bg-black/60 p-3 sm:p-4 shadow-2xl backdrop-blur-md w-64 sm:w-72">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-100">🎙️ Rádio</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Estação atual */}
          {currentStation && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-xs text-slate-400">Tocando agora:</p>
              <p className="text-xs sm:text-sm font-medium text-indigo-300">
                {currentStation.name}
              </p>
            </div>
          )}

          {/* Lista de estações */}
          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 max-h-48 overflow-y-auto">
            {RADIO_STATIONS.map((station) => (
              <button
                key={station.id}
                onClick={() => toggle(station)}
                className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                  currentStation?.id === station.id
                    ? "bg-indigo-500/30 text-indigo-200 border border-indigo-500/50"
                    : "bg-slate-800/40 text-slate-300 hover:bg-slate-700/40 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{station.name}</span>
                  {currentStation?.id === station.id && isPlaying && (
                    <span className="text-xs">▶</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Controle de volume */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400">Volume</label>
              <span className="text-xs text-slate-400">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => {
          if (!isOpen && !currentStation) {
            toggle(RADIO_STATIONS[0]);
          }
          setIsOpen(!isOpen);
        }}
        className={`p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isPlaying
            ? "bg-gradient-to-r from-indigo-500 to-sky-500 shadow-indigo-500/50"
            : "bg-slate-800 hover:bg-slate-700 shadow-slate-900/50"
        } border ${
          isPlaying ? "border-indigo-400" : "border-slate-700"
        } hover:scale-110 active:scale-95`}
        aria-label="Player de rádio"
      >
        {isLoading ? (
          <span className="animate-spin text-sm sm:text-base">⏳</span>
        ) : isPlaying ? (
          <span className="text-sm sm:text-base animate-pulse">🎵</span>
        ) : (
          <span className="text-sm sm:text-base">🎙️</span>
        )}
      </button>
    </div>
  );
}
