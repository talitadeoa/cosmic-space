import { useEffect, useRef, useState } from 'react';

export interface RadioStation {
  id: string;
  name: string;
  url: string;
}

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockHandlerRef = useRef<(() => void) | null>(null);
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
    if (error.name === 'NotAllowedError') {
      _registerAutoplayUnlock();
    }
  };

  const _registerAutoplayUnlock = () => {
    if (typeof window === 'undefined') return;
    if (unlockHandlerRef.current) return;

    const handler = () => {
      unlockHandlerRef.current = null;
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      audioRef.current?.play().catch(_handlePlayError);
    };

    unlockHandlerRef.current = handler;
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
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
      if (unlockHandlerRef.current) {
        window.removeEventListener('pointerdown', unlockHandlerRef.current);
        window.removeEventListener('keydown', unlockHandlerRef.current);
        unlockHandlerRef.current = null;
      }
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
