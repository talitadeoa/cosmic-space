'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Dados de aceleração do dispositivo
 */
export interface AccelerationData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * Dados de orientação do dispositivo
 */
export interface OrientationData {
  alpha: number; // Rotação em torno do eixo Z (0-360)
  beta: number;  // Rotação em torno do eixo X (-180 a 180)
  gamma: number; // Rotação em torno do eixo Y (-90 a 90)
  timestamp: number;
}

/**
 * Evento de shake detectado
 */
export interface ShakeEvent {
  acceleration: AccelerationData;
  timestamp: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MotionPlugin = any;

interface MotionOptions {
  /** Habilita detecção de shake */
  enableShake?: boolean;
  /** Limiar de aceleração para shake (padrão: 15) */
  shakeThreshold?: number;
  /** Intervalo entre eventos de shake em ms (padrão: 500) */
  shakeDebounce?: number;
  /** Callback para shake detectado */
  onShake?: (event: ShakeEvent) => void;
  /** Callback para mudança de orientação */
  onOrientationChange?: (data: OrientationData) => void;
  /** Callback para aceleração */
  onAcceleration?: (data: AccelerationData) => void;
}

/**
 * Hook para detecção de movimento nativo via Capacitor Motion
 * Detecta shake, orientação e aceleração do dispositivo
 * 
 * @example
 * const { orientation, isShaking } = useMotion({
 *   onShake: () => {
 *     console.log('Dispositivo sacudido!');
 *     // Ação especial como "desfazer" ou easter egg
 *   }
 * });
 * 
 * // Usar orientação para parallax
 * const parallaxX = orientation.gamma / 90;
 */
export function useMotion(options: MotionOptions = {}) {
  const {
    enableShake = true,
    shakeThreshold = 15,
    shakeDebounce = 500,
    onShake,
    onOrientationChange,
    onAcceleration,
  } = options;

  const [orientation, setOrientation] = useState<OrientationData>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    timestamp: 0,
  });

  const [acceleration, setAcceleration] = useState<AccelerationData>({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });

  const [isShaking, setIsShaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const lastShakeRef = useRef<number>(0);
  const listenersRef = useRef<Array<{ remove: () => void }>>([]);
  const motionRef = useRef<MotionPlugin | null>(null);

  /**
   * Inicializa o plugin Motion
   */
  useEffect(() => {
    let isMounted = true;

    const initMotion = async () => {
      if (typeof window === 'undefined') return;

      try {
        const { Motion } = await import('@capacitor/motion');
        motionRef.current = Motion;
        
        if (isMounted) {
          setIsSupported(true);
        }

        // Listener de aceleração
        const accelListener = await Motion.addListener('accel', (event: unknown) => {
          if (!isMounted) return;

          const accelEvent = event as { acceleration: { x: number; y: number; z: number } };
          const data: AccelerationData = {
            x: accelEvent.acceleration.x,
            y: accelEvent.acceleration.y,
            z: accelEvent.acceleration.z,
            timestamp: Date.now(),
          };

          setAcceleration(data);
          onAcceleration?.(data);

          // Detecta shake
          if (enableShake) {
            const totalAccel = Math.sqrt(
              data.x * data.x + 
              data.y * data.y + 
              data.z * data.z
            );

            if (totalAccel > shakeThreshold) {
              const now = Date.now();
              if (now - lastShakeRef.current > shakeDebounce) {
                lastShakeRef.current = now;
                setIsShaking(true);
                
                const shakeEvent: ShakeEvent = {
                  acceleration: data,
                  timestamp: now,
                };
                
                onShake?.(shakeEvent);

                // Reset shake state após 300ms
                setTimeout(() => {
                  if (isMounted) setIsShaking(false);
                }, 300);
              }
            }
          }
        });

        listenersRef.current.push(accelListener);

        // Listener de orientação
        const orientListener = await Motion.addListener('orientation', (event: unknown) => {
          if (!isMounted) return;

          const orientEvent = event as { alpha: number; beta: number; gamma: number };
          const data: OrientationData = {
            alpha: orientEvent.alpha,
            beta: orientEvent.beta,
            gamma: orientEvent.gamma,
            timestamp: Date.now(),
          };

          setOrientation(data);
          onOrientationChange?.(data);
        });

        listenersRef.current.push(orientListener);

      } catch {
        console.debug('[Motion] Plugin não disponível (ambiente web)');
      }
    };

    initMotion();

    return () => {
      isMounted = false;
      
      // Remove todos os listeners
      for (const listener of listenersRef.current) {
        listener.remove();
      }
      listenersRef.current = [];
    };
  }, [enableShake, shakeThreshold, shakeDebounce, onShake, onOrientationChange, onAcceleration]);

  /**
   * Calcula valores de parallax baseado na orientação
   * Retorna valores normalizados entre -1 e 1
   */
  const getParallax = useCallback(() => {
    return {
      x: Math.max(-1, Math.min(1, orientation.gamma / 45)),
      y: Math.max(-1, Math.min(1, (orientation.beta - 45) / 45)),
    };
  }, [orientation]);

  /**
   * Verifica se o dispositivo está em modo paisagem
   */
  const isLandscape = useCallback(() => {
    return Math.abs(orientation.gamma) > 45;
  }, [orientation]);

  /**
   * Verifica se o dispositivo está de cabeça para baixo
   */
  const isUpsideDown = useCallback(() => {
    return orientation.beta < -90 || orientation.beta > 90;
  }, [orientation]);

  return {
    // Estados
    orientation,
    acceleration,
    isShaking,
    isSupported,
    
    // Helpers
    getParallax,
    isLandscape,
    isUpsideDown,
  };
}
