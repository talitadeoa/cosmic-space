/** Funções utilitárias para renderização em canvas */

/**
 * Desenha uma esfera sombreada com efeito de luz e textura
 * @param ctx - Contexto do canvas 2D
 * @param x - Posição X
 * @param y - Posição Y
 * @param radius - Raio da esfera
 * @param baseColor - Cor base hexadecimal
 * @param spinAngle - Ângulo de rotação para calcular luz
 */
export const drawShadedSphere = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  baseColor: string,
  spinAngle: number
) => {
  const lightRadius = radius * 0.3;
  const lx = Math.cos(spinAngle) * radius * 0.5;
  const ly = Math.sin(spinAngle) * radius * 0.5;

  const gradient = ctx.createRadialGradient(lx, ly, lightRadius * 0.2, 0, 0, radius);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.3, baseColor);
  gradient.addColorStop(0.8, shadeColor(baseColor, -30));
  gradient.addColorStop(1, "rgba(0,0,0,0.9)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Textura leve
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalAlpha = 0.15;
  ctx.lineWidth = radius * 0.15;
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.3, radius * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

/**
 * Escurece uma cor hexadecimal por uma porcentagem
 * @param hex - Cor em formato hexadecimal (ex: "#ff0000")
 * @param percent - Porcentagem para escurecer (negativo) ou iluminar (positivo)
 * @returns Cor em formato RGB
 */
export const shadeColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.min(255, Math.max(0, r + (255 * percent) / 100));
  g = Math.min(255, Math.max(0, g + (255 * percent) / 100));
  b = Math.min(255, Math.max(0, b + (255 * percent) / 100));

  return `rgb(${r},${g},${b})`;
};

/**
 * Desenha um círculo de órbita
 * @param ctx - Contexto do canvas 2D
 * @param centerX - Centro X
 * @param centerY - Centro Y
 * @param radius - Raio da órbita
 * @param color - Cor da órbita
 * @param lineWidth - Largura da linha
 * @param globalAlpha - Opacidade (0-1)
 */
export const drawOrbit = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  color: string,
  lineWidth: number = 1,
  globalAlpha: number = 1
) => {
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.globalAlpha = globalAlpha;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

/**
 * Desenha um arco de órbita com destaque
 * @param ctx - Contexto do canvas 2D
 * @param centerX - Centro X
 * @param centerY - Centro Y
 * @param radius - Raio
 * @param startAngle - Ângulo inicial
 * @param endAngle - Ângulo final
 * @param color - Cor
 * @param lineWidth - Largura da linha
 * @param shadowColor - Cor da sombra para efeito
 */
export const drawOrbtiArc = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  lineWidth: number = 2,
  shadowColor?: string
) => {
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  if (shadowColor) {
    ctx.shadowBlur = 12;
    ctx.shadowColor = shadowColor;
  }
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();
};

/**
 * Desenha um rótulo de texto
 * @param ctx - Contexto do canvas 2D
 * @param text - Texto a desenhar
 * @param x - Posição X
 * @param y - Posição Y
 * @param align - Alinhamento horizontal
 * @param baseline - Alinhamento vertical
 * @param alpha - Opacidade
 * @param fontSize - Tamanho da fonte
 */
export const drawLabel = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: CanvasTextAlign = "center",
  baseline: CanvasTextBaseline = "bottom",
  alpha: number = 1,
  fontSize: number = 14
) => {
  ctx.save();
  ctx.fillStyle = `rgba(229, 231, 235, ${alpha})`;
  ctx.font = `${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
  ctx.restore();
};

/**
 * Desenha linhas de grid (horizontal e vertical)
 * @param ctx - Contexto do canvas 2D
 * @param width - Largura do canvas
 * @param height - Altura do canvas
 * @param centerX - Centro X
 * @param centerY - Centro Y
 * @param color - Cor das linhas
 * @param lineWidth - Largura das linhas
 */
export const drawGridLines = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  color: string,
  lineWidth: number = 1
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();

  ctx.restore();
};

/**
 * Desenha estrelas de fundo
 * @param ctx - Contexto do canvas 2D
 * @param stars - Array de estrelas com x, y, r, alpha
 * @param color - Cor das estrelas
 */
export const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Array<{ x: number; y: number; r: number; alpha: number }>,
  color: string = "white"
) => {
  ctx.save();
  ctx.fillStyle = color;

  for (const s of stars) {
    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
};

/**
 * Desenha um Sol com gradiente radial
 * @param ctx - Contexto do canvas 2D
 * @param centerX - Centro X
 * @param centerY - Centro Y
 * @param radius - Raio
 * @param colors - Objeto com cores (glowInner, glowMid, glowOuter, core)
 */
export const drawSun = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  colors: {
    glowInner: string;
    glowMid: string;
    glowOuter: string;
    core: string;
  }
) => {
  ctx.save();

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius * 4
  );
  gradient.addColorStop(0, colors.glowInner);
  gradient.addColorStop(0.2, colors.glowMid);
  gradient.addColorStop(1, colors.glowOuter);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 25;
  ctx.shadowColor = "#e0f2fe";
  ctx.fillStyle = colors.core;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

/**
 * Desenha uma fase da Lua (nova, quarto crescente, cheia, quarto minguante)
 * @param ctx - Contexto do canvas 2D
 * @param x - Posição X
 * @param y - Posição Y
 * @param radius - Raio
 * @param phase - Tipo de fase ("new" | "firstQuarter" | "full" | "lastQuarter")
 * @param colors - Objeto com cores (dark, light)
 */
export const drawMoonPhase = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  phase: "new" | "firstQuarter" | "full" | "lastQuarter",
  colors: { dark: string; light: string }
) => {
  ctx.save();
  ctx.translate(x, y);

  // Base escura
  ctx.fillStyle = colors.dark;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  if (phase === "new") {
    ctx.restore();
    return;
  }

  // Disco iluminado
  ctx.fillStyle = colors.light;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  if (phase === "full") {
    ctx.restore();
    return;
  }

  // Comendo metade do disco para quarto crescente/minguante
  ctx.fillStyle = colors.dark;
  const offset = phase === "firstQuarter" ? -radius * 0.6 : radius * 0.6;
  ctx.beginPath();
  ctx.arc(offset, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
