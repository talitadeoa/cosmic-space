/** Hook para gerenciar animação contínua em canvas */

import { useEffect, useRef } from "react";

interface AnimationCallbacks {
  update?: () => void;
  draw: () => void;
}

/**
 * Hook que gerencia o loop de animação usando requestAnimationFrame
 * @param canvasRef - Referência do canvas
 * @param callbacks - Funções de update e draw
 */
export const useCanvasAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  callbacks: AnimationCallbacks
) => {
  const animationIdRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      callbacks.update?.();
      callbacks.draw();
      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [callbacks]);
};
