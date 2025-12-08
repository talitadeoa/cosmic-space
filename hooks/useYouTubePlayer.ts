import { useEffect, useRef, useState } from "react";

export interface YouTubeStation {
  id: string;
  name: string;
  videoId: string;
}

let youtubeApiPromise: Promise<void> | null = null;

const loadYouTubeIframeAPI = () => {
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const w = window as typeof window & {
      YT?: any;
      onYouTubeIframeAPIReady?: () => void;
    };

    if (w.YT?.Player) {
      resolve();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;

    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    tag.onerror = () => resolve();
  });

  return youtubeApiPromise;
};

export const useYouTubePlayer = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState<YouTubeStation | null>(
    null
  );
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    loadYouTubeIframeAPI().then(() => {
      if (cancelled) return;
      const w = window as typeof window & { YT?: any };
      if (!w.YT?.Player || !containerRef.current) return;

      playerRef.current = new w.YT.Player(containerRef.current, {
        height: "0",
        width: "0",
        videoId: undefined,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            setIsReady(true);
            playerRef.current?.setVolume(volume * 100);
          },
          onStateChange: (event: any) => {
            if (cancelled) return;
            switch (event.data) {
              case w.YT.PlayerState.PLAYING:
                setIsPlaying(true);
                setIsLoading(false);
                break;
              case w.YT.PlayerState.BUFFERING:
                setIsLoading(true);
                break;
              default:
                setIsPlaying(false);
                setIsLoading(false);
                break;
            }
          },
          onError: () => {
            setIsLoading(false);
            setIsPlaying(false);
          }
        }
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  useEffect(() => {
    if (!isReady || !currentStation || isPlaying || !playerRef.current) return;

    setIsLoading(true);
    const currentVideoId = playerRef.current.getVideoData?.()?.video_id;
    if (currentVideoId !== currentStation.videoId) {
      playerRef.current.loadVideoById(currentStation.videoId);
    } else {
      playerRef.current.playVideo();
    }
  }, [currentStation, isPlaying, isReady]);

  const play = (station: YouTubeStation) => {
    if (!playerRef.current) return;

    setCurrentStation(station);
    setIsLoading(true);

    if (!isReady) return;

    const currentVideoId = playerRef.current.getVideoData?.()?.video_id;
    if (currentVideoId !== station.videoId) {
      playerRef.current.loadVideoById(station.videoId);
    } else {
      playerRef.current.playVideo();
    }
  };

  const pause = () => {
    playerRef.current?.pauseVideo();
  };

  const toggle = (station?: YouTubeStation) => {
    if (isPlaying) {
      pause();
    } else if (station) {
      play(station);
    } else if (currentStation) {
      play(currentStation);
    }
  };

  return {
    containerRef,
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
