/** Tipos compartilhados para componentes de canvas */

export interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

export interface Moon {
  orbitRadius: number;
  size: number;
  periodDays: number;
  angleOffset: number;
  worldX?: number;
  worldY?: number;
  screenX?: number;
  screenY?: number;
  planet?: Planet;
}

export interface Planet {
  name: string;
  radius: number;
  size: number;
  periodDays: number;
  angleOffset: number;
  color: string;
  spinAngle: number;
  moons: Moon[];
  worldX?: number;
  worldY?: number;
  screenX?: number;
  screenY?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface EarthPosition extends Position {
  angle: number;
}

export type PhaseType = "new" | "firstQuarter" | "full" | "lastQuarter";
export type CellType = "A1" | "A2" | "B1" | "B2" | null;

export interface FocusedTarget {
  type: "sun" | "planet" | "moon";
  target: Planet | Moon | null;
}

export interface CanvasConfig {
  earthOrbitRadius: number;
  moonOrbitRadius: number;
  starCount: number;
}

export interface OrbitConfig {
  lineWidthBase: number;
  lineWidthHighlight: number;
}

export interface SpeedConfig {
  earthSegment?: number;
  moonAngular?: number;
}

export interface ColorScheme {
  orbitBase: string;
  orbitHighlight: string;
  stars: string;
  sunGlowInner: string;
  sunGlowMid: string;
  sunGlowOuter: string;
  sunCore: string;
  earth?: string;
  moon?: string;
  label?: string;
  grid?: string;
  moonDark?: string;
  moonLight?: string;
}
