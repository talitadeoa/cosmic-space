/**
 * Dados fallback para fases lunares em caso de falha da API USNO
 * Estes são valores aproximados e devem ser usados apenas como último recurso
 */

export const FALLBACK_LUNAR_PHASES = [
  { day: 1, phase: 'Waning Crescent', illumination: 8 },
  { day: 2, phase: 'Waning Crescent', illumination: 3 },
  { day: 3, phase: 'New Moon', illumination: 0 },
  { day: 4, phase: 'Waxing Crescent', illumination: 3 },
  { day: 5, phase: 'Waxing Crescent', illumination: 8 },
  { day: 6, phase: 'Waxing Crescent', illumination: 15 },
  { day: 7, phase: 'Waxing Crescent', illumination: 23 },
  { day: 8, phase: 'Waxing Crescent', illumination: 32 },
  { day: 9, phase: 'Waxing Crescent', illumination: 41 },
  { day: 10, phase: 'Waxing Gibbous', illumination: 50 },
  { day: 11, phase: 'Waxing Gibbous', illumination: 59 },
  { day: 12, phase: 'Waxing Gibbous', illumination: 67 },
  { day: 13, phase: 'Waxing Gibbous', illumination: 75 },
  { day: 14, phase: 'Waxing Gibbous', illumination: 83 },
  { day: 15, phase: 'Waxing Gibbous', illumination: 90 },
  { day: 16, phase: 'First Quarter', illumination: 97 },
  { day: 17, phase: 'Full Moon', illumination: 100 },
  { day: 18, phase: 'Waning Gibbous', illumination: 97 },
  { day: 19, phase: 'Waning Gibbous', illumination: 90 },
  { day: 20, phase: 'Waning Gibbous', illumination: 83 },
  { day: 21, phase: 'Waning Gibbous', illumination: 75 },
  { day: 22, phase: 'Waning Gibbous', illumination: 67 },
  { day: 23, phase: 'Waning Gibbous', illumination: 59 },
  { day: 24, phase: 'Waning Gibbous', illumination: 50 },
  { day: 25, phase: 'Last Quarter', illumination: 41 },
  { day: 26, phase: 'Waning Crescent', illumination: 32 },
  { day: 27, phase: 'Waning Crescent', illumination: 23 },
  { day: 28, phase: 'Waning Crescent', illumination: 15 },
  { day: 29, phase: 'Waning Crescent', illumination: 8 },
  { day: 30, phase: 'Waning Crescent', illumination: 3 },
];
