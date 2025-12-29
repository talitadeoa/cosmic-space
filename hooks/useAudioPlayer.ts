import { useEffect, useRef, useState } from 'react';

export interface RadioStation {
  id: string;
  name: string;
  url: string;
}

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Configurar event listeners de áudio
   */
  const _setupAudioListeners = (audio: HTMLAudioElement) => {
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('loadstart', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));
    audio.addEventListener('error', () => {
      setIsLoading(false);
      setIsPlaying(false);
    });
  };

  /**
   * Handler centralizado para erros de reprodução
   */
  const _handlePlayError = (error: Error) => {
    console.error('Erro ao reproduzir:', error);
    setIsPlaying(false);
  };

  // Inicializa o elemento de áudio
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audioRef.current = audio;
      _setupAudioListeners(audio);
      if (typeof document !== 'undefined') {
        audio.setAttribute('data-radio-player', 'true');
        audio.style.display = 'none';
        document.body.appendChild(audio);
      }
    }

    return () => {
      if (!audioRef.current) return;
      audioRef.current.pause();
      if (audioRef.current.parentNode) {
        audioRef.current.parentNode.removeChild(audioRef.current);
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
    const audio = audioRef.current;
    if (audio.src !== station.url) {
      audio.pause();
      audio.src = station.url;
      audio.load();
    }
    audio.play().catch(_handlePlayError);
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
      audioRef.current.play().catch(_handlePlayError);
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
    isLoading,
  };
};
