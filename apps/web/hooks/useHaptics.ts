'use client';

import { useCallback, useRef } from 'react';

/**
 * Tipos de feedback háptico disponíveis
 */
export type HapticStyle = 
  | 'light'      // Toque leve (tap, seleção)
  | 'medium'     // Toque médio (confirmação)
  | 'heavy'      // Toque pesado (ação importante)
  | 'rigid'      // Rígido (erro, limite)
  | 'soft'       // Suave (transição)
  | 'success'    // Sucesso ✓
  | 'warning'    // Aviso ⚠
  | 'error';     // Erro ✗

/**
 * Padrões de vibração para diferentes ações
 */
export type HapticPattern = 
  | 'selection'    // Seleção de item
  | 'navigation'   // Mudança de tela
  | 'longPress'    // Long press confirmado
  | 'swipe'        // Swipe detectado
  | 'pinch'        // Zoom in/out
  | 'notification' // Nova notificação
  | 'lunar'        // Ação lunar especial ✨
  | 'cosmic';      // Ação cósmica especial 🌌

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HapticsPlugin = any;

/**
 * Hook para feedback háptico nativo via Capacitor
 * Fornece vibração tátil em dispositivos móveis
 * 
 * @example
 * const { triggerHaptic, hapticPattern } = useHaptics();
 * 
 * // Feedback simples
 * triggerHaptic('light');
 * 
 * // Padrão específico
 * hapticPattern('lunar');
 */
export function useHaptics() {
  const hapticsRef = useRef<HapticsPlugin | null>(null);
  const isInitialized = useRef(false);

  /**
   * Inicializa o plugin Haptics de forma lazy
   */
  const getHaptics = useCallback(async (): Promise<HapticsPlugin | null> => {
    if (hapticsRef.current) return hapticsRef.current;
    
    if (typeof window === 'undefined') return null;
    
    try {
      const { Haptics } = await import('@capacitor/haptics');
      hapticsRef.current = Haptics;
      isInitialized.current = true;
      return Haptics;
    } catch {
      // Fallback silencioso para browsers sem suporte
      console.debug('[Haptics] Plugin não disponível (ambiente web)');
      return null;
    }
  }, []);

  /**
   * Dispara feedback háptico simples
   */
  const triggerHaptic = useCallback(async (style: HapticStyle = 'light') => {
    const haptics = await getHaptics();
    if (!haptics) return;

    try {
      switch (style) {
        case 'success':
          await haptics.notification({ type: 'success' });
          break;
        case 'warning':
          await haptics.notification({ type: 'warning' });
          break;
        case 'error':
          await haptics.notification({ type: 'error' });
          break;
        case 'light':
        case 'medium':
        case 'heavy':
        case 'rigid':
        case 'soft':
          await haptics.impact({ style: style.toUpperCase() });
          break;
        default:
          await haptics.impact({ style: 'LIGHT' });
      }
    } catch (error) {
      console.debug('[Haptics] Erro ao disparar feedback:', error);
    }
  }, [getHaptics]);

  /**
   * Dispara padrão háptico específico para uma ação
   */
  const hapticPattern = useCallback(async (pattern: HapticPattern) => {
    const haptics = await getHaptics();
    if (!haptics) return;

    try {
      switch (pattern) {
        case 'selection':
          await haptics.selectionChanged();
          break;
          
        case 'navigation':
          await haptics.impact({ style: 'MEDIUM' });
          break;
          
        case 'longPress':
          await haptics.impact({ style: 'HEAVY' });
          break;
          
        case 'swipe':
          await haptics.impact({ style: 'LIGHT' });
          break;
          
        case 'pinch':
          await haptics.impact({ style: 'SOFT' });
          break;
          
        case 'notification':
          await haptics.notification({ type: 'success' });
          break;
          
        case 'lunar':
          // Padrão especial para ações lunares 🌙
          await haptics.impact({ style: 'SOFT' });
          setTimeout(async () => {
            await haptics.impact({ style: 'LIGHT' });
          }, 100);
          break;
          
        case 'cosmic':
          // Padrão especial cósmico 🌌
          await haptics.impact({ style: 'LIGHT' });
          setTimeout(async () => {
            await haptics.impact({ style: 'MEDIUM' });
          }, 80);
          setTimeout(async () => {
            await haptics.impact({ style: 'HEAVY' });
          }, 160);
          break;
      }
    } catch (error) {
      console.debug('[Haptics] Erro no padrão:', error);
    }
  }, [getHaptics]);

  /**
   * Inicia feedback de seleção contínua (para drag)
   */
  const startSelection = useCallback(async () => {
    const haptics = await getHaptics();
    if (!haptics) return;
    
    try {
      await haptics.selectionStart();
    } catch (error) {
      console.debug('[Haptics] Erro ao iniciar seleção:', error);
    }
  }, [getHaptics]);

  /**
   * Sinaliza mudança durante seleção contínua
   */
  const changeSelection = useCallback(async () => {
    const haptics = await getHaptics();
    if (!haptics) return;
    
    try {
      await haptics.selectionChanged();
    } catch (error) {
      console.debug('[Haptics] Erro ao mudar seleção:', error);
    }
  }, [getHaptics]);

  /**
   * Finaliza feedback de seleção contínua
   */
  const endSelection = useCallback(async () => {
    const haptics = await getHaptics();
    if (!haptics) return;
    
    try {
      await haptics.selectionEnd();
    } catch (error) {
      console.debug('[Haptics] Erro ao finalizar seleção:', error);
    }
  }, [getHaptics]);

  /**
   * Vibração customizada (duração em ms)
   */
  const vibrate = useCallback(async (duration = 100) => {
    const haptics = await getHaptics();
    if (!haptics) return;
    
    try {
      await haptics.vibrate({ duration });
    } catch (error) {
      console.debug('[Haptics] Erro ao vibrar:', error);
    }
  }, [getHaptics]);

  return {
    triggerHaptic,
    hapticPattern,
    startSelection,
    changeSelection,
    endSelection,
    vibrate,
    isSupported: isInitialized.current,
  };
}
