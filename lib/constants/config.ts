/** Configurações e constantes para componentes de canvas */

import type { CanvasConfig, OrbitConfig, SpeedConfig, PhaseType } from "@/types/canvas";
import { PHASES_COLORS } from "./colors";

export const SOLAR_ORBIT_CONFIG = {
  earthOrbitRadius: 220,
  moonOrbitRadius: 70,
  starCount: 200,
  orbit: {
    lineWidthBase: 1.2,
    lineWidthTrail: 1.8,
  },
  speed: {
    earthAngularSpeed: 0.002,
    moonAngularSpeed: 0.02,
  },
} as const;

export const ZOOM_CONFIG = {
  sunRadius: 20,
  daysPerSecond: 0.01,
  cameraEasing: 0.08,
} as const;

export const PHASES_CONFIG = {
  earthOrbitRadius: 220,
  moonOrbitRadius: 70,
  starCount: 200,
  orbit: {
    lineWidthBase: 0.8,
    lineWidthHighlight: 2,
  },
  speed: {
    earthSegment: 0.01,
    moonAngular: 0.02,
  },
  staticMoons: {
    angles: [
      0,
      Math.PI / 2,
      Math.PI,
      (3 * Math.PI) / 2,
    ],
    phases: ["new", "firstQuarter", "full", "lastQuarter"] as PhaseType[],
    radius: 9,
  },
} as const;

export const SUN_RADIUS = 20;
