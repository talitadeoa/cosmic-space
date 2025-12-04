import { useEffect, useRef, useState } from "react";

export interface RadioStation {
  id: string;
  name: string;
  url: string;
}

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(
    null
  );
  const [volume, setVolume] = useState(0.3);
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa o elemento de áudio
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      // Event listeners
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("loadstart", () => setIsLoading(true));
      audio.addEventListener("canplay", () => setIsLoading(false));
      audio.addEventListener("error", () => {
        setIsLoading(false);
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sincroniza o volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = (station: RadioStation) => {
    if (!audioRef.current) return;

    setCurrentStation(station);
    audioRef.current.src = station.url;
    audioRef.current.play().catch((error) => {
      console.error("Erro ao reproduzir:", error);
      setIsPlaying(false);
    });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggle = (station?: RadioStation) => {
    if (!audioRef.current) return;

    if (isPlaying) {
      pause();
    } else if (station) {
      play(station);
    } else if (currentStation) {
      audioRef.current.play().catch((error) => {
        console.error("Erro ao reproduzir:", error);
      });
    }
  };

  return {
    isPlaying,
    currentStation,
    volume,
    setVolume,
    play,
    pause,
    toggle,
    isLoading
  };
};
