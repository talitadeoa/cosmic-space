'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { ScreenId, CelestialType, CelestialSize } from '../types';

/**
 * Contexto de navegação durante animação de foco
 */
export interface NavigationFocusContext {
  event?: React.MouseEvent<HTMLDivElement>;
  type: CelestialType;
  size?: CelestialSize;
  year?: number;
}

/**
 * Hook centralizado para navegação e gestos no cosmos
 * Fornece métodos padronizados para navegação com foco e gestos comuns
 *
 * @example
 * const { navigateTo, navigateWithFocus } = useUniverseNavigation();
 *
 * // Navegação simples
 * navigateTo('luaList');
 *
 * // Navegação com foco na origem (para animação)
 * navigateWithFocus('luaList', {
 *   event,
 *   type: 'lua',
 *   size: 'md'
 * });
 */
export function useUniverseNavigation() {
  const router = useRouter();
  const navigationHistoryRef = useRef<ScreenId[]>([]);

  /**
   * Navega para uma tela específica
   * @param target - ID da tela de destino
   * @param options - Opções de navegação (ex.: recarregar, abrir em nova aba)
   */
  const navigateTo = useCallback(
    (
      target: ScreenId,
      options?: {
        replace?: boolean;
        external?: boolean;
        newTab?: boolean;
      }
    ) => {
      const path = `/cosmos/${target}`;

      if (options?.external || options?.newTab) {
        window.open(path, options?.newTab ? '_blank' : '_self');
        return;
      }

      // Registra no histórico para possível back navigation
      navigationHistoryRef.current.push(target);

      if (options?.replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    },
    [router]
  );

  /**
   * Navega com contexto de foco (para animações de transição)
   * @param target - ID da tela de destino
   * @param context - Contexto de foco (posição do elemento origem, tipo, etc)
   */
  const navigateWithFocus = useCallback(
    (target: ScreenId, context: NavigationFocusContext) => {
      const { event, type, size = 'md', year } = context;

      // Calcula coordenadas do elemento de origem se existir
      let focusData: Record<string, unknown> = {
        type,
        size,
      };

      if (event?.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        focusData = {
          ...focusData,
          x: rect.left,
          y: rect.top,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      }

      if (year) {
        focusData.year = year;
      }

      // Armazena contexto de foco para a próxima tela (pode ser via sessionStorage ou context)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('cosmos:focusContext', JSON.stringify(focusData));
      }

      navigateTo(target);
    },
    [navigateTo]
  );

  /**
   * Volta para a tela anterior no histórico do cosmos
   */
  const navigateBack = useCallback(() => {
    if (navigationHistoryRef.current.length > 1) {
      navigationHistoryRef.current.pop();
      const previous = navigationHistoryRef.current[navigationHistoryRef.current.length - 1];
      navigateTo(previous, { replace: true });
    } else {
      navigateTo('home', { replace: true });
    }
  }, [navigateTo]);

  /**
   * Limpa contexto de foco (útil após consumir a animação)
   */
  const clearFocusContext = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cosmos:focusContext');
    }
  }, []);

  /**
   * Recupera contexto de foco da navegação anterior
   */
  const getFocusContext = useCallback(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('cosmos:focusContext');
      if (stored) {
        try {
          return JSON.parse(stored) as Record<string, unknown>;
        } catch {
          console.warn('Falha ao parsear focusContext');
        }
      }
    }
    return null;
  }, []);

  return {
    navigateTo,
    navigateWithFocus,
    navigateBack,
    clearFocusContext,
    getFocusContext,
    navigationHistory: navigationHistoryRef.current,
  };
}
