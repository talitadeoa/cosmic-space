/** Hook para gerenciar resize do canvas */

import { useEffect, useCallback } from "react";

interface ResizeCallback {
  (width: number, height: number): void;
}

/**
 * Hook que gerencia resize do canvas e janela
 * @param canvasRef - Referência do canvas
 * @param onResize - Callback chamado quando canvas é redimensionado
 */
export const useCanvasResize = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onResize: ResizeCallback
) => {
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    onResize(width, height);
  }, [canvasRef, onResize]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
};
