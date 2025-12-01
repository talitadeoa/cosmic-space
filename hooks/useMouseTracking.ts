/** Hook para rastreamento de mouse em canvas */

import { useEffect, useCallback } from "react";

interface MouseCallbacks {
  onMove?: (x: number, y: number) => void;
  onLeave?: () => void;
}

/**
 * Hook que rastreia movimento e saída do mouse no canvas
 * @param canvasRef - Referência do canvas
 * @param callbacks - Callbacks para move e leave
 */
export const useMouseTracking = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  callbacks: MouseCallbacks
) => {
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      callbacks.onMove?.(x, y);
    },
    [canvasRef, callbacks]
  );

  const handleMouseLeave = useCallback(() => {
    callbacks.onLeave?.();
  }, [callbacks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [canvasRef, handleMouseMove, handleMouseLeave]);
};
