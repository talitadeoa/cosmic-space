'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNativeGestures, type NativeGestureConfig } from '@/hooks/useNativeGestures';
import type { SwipeGesture } from '@/types/gestures';

export interface GestureNavigationConfig extends NativeGestureConfig {
  /** Habilita navegação por swipe */
  enableSwipeNavigation?: boolean;
  /** Habilita edge swipe para voltar (iOS style) */
  enableEdgeBack?: boolean;
  /** Callback customizado ao navegar para trás */
  onNavigateBack?: () => void;
  /** Callback customizado ao navegar para frente */
  onNavigateForward?: () => void;
  /** Histórico de navegação customizado */
  navigationStack?: string[];
}

/**
 * Hook que combina gestos nativos com navegação
 * 
 * Fornece navegação iOS-style com:
 * - Edge swipe right → voltar
 * - Swipe down → fechar modal/sheet
 * - Shake → desfazer última ação
 * 
 * @example
 * const { bind, canGoBack } = useGestureNavigation({
 *   enableEdgeBack: true,
 *   onNavigateBack: () => router.back(),
 * });
 * 
 * return <div {...bind()}>Conteúdo navegável</div>;
 */
export function useGestureNavigation(config: GestureNavigationConfig = {}) {
  const {
    enableSwipeNavigation = true,
    enableEdgeBack = true,
    onNavigateBack,
    onNavigateForward,
    ...gestureConfig
  } = config;

  const router = useRouter();

  /**
   * Handler para edge swipe right (voltar)
   */
  const handleEdgeSwipeRight = useCallback((_gesture: SwipeGesture) => {
    if (!enableEdgeBack) return;
    
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      router.back();
    }
  }, [enableEdgeBack, onNavigateBack, router]);

  /**
   * Handler para swipe right (navegação alternativa)
   */
  const handleSwipeRight = useCallback((_gesture: SwipeGesture) => {
    if (!enableSwipeNavigation) return;
    
    // Swipe right também pode voltar se não tiver edge back
    if (!enableEdgeBack) {
      if (onNavigateBack) {
        onNavigateBack();
      } else {
        router.back();
      }
    }
  }, [enableSwipeNavigation, enableEdgeBack, onNavigateBack, router]);

  /**
   * Handler para swipe left (avançar)
   */
  const handleSwipeLeft = useCallback((_gesture: SwipeGesture) => {
    if (!enableSwipeNavigation) return;
    
    if (onNavigateForward) {
      onNavigateForward();
    }
    // Não há router.forward() padrão, depende da implementação
  }, [enableSwipeNavigation, onNavigateForward]);

  const nativeGestures = useNativeGestures(
    {
      onEdgeSwipeRight: handleEdgeSwipeRight,
      onSwipeRight: handleSwipeRight,
      onSwipeLeft: handleSwipeLeft,
    },
    {
      ...gestureConfig,
      edgeZone: gestureConfig.edgeZone ?? 0.15, // 15% da borda para edge gestures
    }
  );

  return {
    ...nativeGestures,
    // Helpers de navegação
    canGoBack: typeof window !== 'undefined' && window.history.length > 1,
  };
}
