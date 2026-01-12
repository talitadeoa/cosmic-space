/**
 * 📱 useMediaQuery - Hook para Media Queries
 * 
 * Detecta breakpoints responsivos
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries
 * 
 * @example
 * ```ts
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Create listener
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    
    // Legacy browsers
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);

  return matches;
}

/**
 * Breakpoints do Tailwind
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

/**
 * Hooks pré-configurados para breakpoints comuns
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}
