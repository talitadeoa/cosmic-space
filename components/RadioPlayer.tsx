"use client";

import { useAudioPlayer, RadioStation } from "@/hooks/useAudioPlayer";
import { useYouTubePlayer, YouTubeStation } from "@/hooks/useYouTubePlayer";
import { useMemo, useState } from "react";

type Station =
  | (RadioStation & { type?: "radio" })
  | (YouTubeStation & { type: "youtube" });

const STATIONS: Station[] = [
  {
    id: "ambient",
    name: "🌌 Cosmic Ambient",
    url: "https://stream.zeno.fm/qewbq9kvnqruv",
    type: "radio"
  },
  {
    id: "lo-fi",
    name: "🎵 Lo-Fi Beats",
    url: "https://stream.zeno.fm/7npc13b3h5quv",
    type: "radio"
  },
  {
    id: "space-sounds",
    name: "🚀 Space Sounds",
    url: "https://stream.zeno.fm/1n0xa7yft6zuv",
    type: "radio"
  },
  {
    id: "chillwave",
    name: "🌊 Chillwave",
    url: "https://stream.zeno.fm/kpv77c4tnfruv",
    type: "radio"
  },
  {
    id: "cyberpunk",
    name: "🎬 Cyberpunk",
    videoId: "KyfvIw48V6g",
    type: "youtube"
  }
];

export default function RadioPlayer() {
  const {
    isPlaying: isAudioPlaying,
    currentStation: currentAudioStation,
    volume: audioVolume,
    setVolume: setAudioVolume,
    toggle: toggleAudio,
    pause: pauseAudio,
    isLoading: isAudioLoading
  } = useAudioPlayer();

  const {
    isPlaying: isYouTubePlaying,
    currentStation: currentYouTubeStation,
    volume: youtubeVolume,
    setVolume: setYoutubeVolume,
    toggle: toggleYouTube,
    pause: pauseYouTube,
    isLoading: isYouTubeLoading,
    containerRef: youtubeContainerRef
  } = useYouTubePlayer();

  const [isOpen, setIsOpen] = useState(false);
  const [currentType, setCurrentType] = useState<"radio" | "youtube" | null>(
    null
  );

  const activeStation = useMemo(() => {
    if (currentType === "youtube") return currentYouTubeStation;
    if (currentType === "radio") return currentAudioStation;
    return null;
  }, [currentAudioStation, currentType, currentYouTubeStation]);

  const isPlaying =
    currentType === "youtube" ? isYouTubePlaying : isAudioPlaying;
  const isLoading =
    currentType === "youtube" ? isYouTubeLoading : isAudioLoading;
  const volume = currentType === "youtube" ? youtubeVolume : audioVolume;

  const handleSelect = (station: Station) => {
    if (station.type === "youtube") {
      pauseAudio();
      toggleYouTube(station);
      setCurrentType("youtube");
    } else {
      pauseYouTube();
      toggleAudio(station);
      setCurrentType("radio");
    }
  };

  const handleVolumeChange = (value: number) => {
    setAudioVolume(value);
    setYoutubeVolume(value);
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      <div
        ref={youtubeContainerRef}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        aria-hidden
      />

      {/* Player aberto */}
      {isOpen && (
        <div className="mb-2 sm:mb-4 rounded-xl sm:rounded-2xl border border-slate-700 bg-black/60 p-3 sm:p-4 shadow-2xl backdrop-blur-md w-64 sm:w-72">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-100">
              🎙️ Rádio
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Estação atual */}
          {activeStation && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-xs text-slate-400">
                Tocando agora ({currentType === "youtube" ? "YouTube" : "Rádio"}):
              </p>
              <p className="text-xs sm:text-sm font-medium text-indigo-300">
                {activeStation.name}
              </p>
            </div>
          )}

          {/* Lista de estações */}
          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 max-h-48 overflow-y-auto">
            {STATIONS.map((station) => {
              const isCurrent = activeStation?.id === station.id;
              return (
                <button
                  key={station.id}
                  onClick={() => handleSelect(station)}
                  className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
                    isCurrent
                      ? "bg-indigo-500/30 text-indigo-200 border border-indigo-500/50"
                      : "bg-slate-800/40 text-slate-300 hover:bg-slate-700/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {station.type === "youtube" ? "▶️" : "📡"}
                      {station.name}
                    </span>
                    {isCurrent && isPlaying && <span className="text-xs">▶</span>}
                  </div>
                </button>
              );
            })}
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
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => {
          if (!isOpen && !activeStation) {
            handleSelect(STATIONS[0]);
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
