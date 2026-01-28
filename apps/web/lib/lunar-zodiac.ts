/**
 * 🌙 Cálculo do Signo Astrológico da Lua
 * 
 * Calcula em qual signo zodiacal a Lua está posicionada
 * baseado na sua longitude eclíptica.
 * 
 * A Lua percorre todos os 12 signos em aproximadamente 28 dias,
 * permanecendo cerca de 2.3 dias em cada signo.
 */

export type ZodiacSign =
  | 'Áries'
  | 'Touro'
  | 'Gêmeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

export type ZodiacEmoji =
  | '♈'
  | '♉'
  | '♊'
  | '♋'
  | '♌'
  | '♍'
  | '♎'
  | '♏'
  | '♐'
  | '♑'
  | '♒'
  | '♓';

/**
 * Dados dos signos zodiacais com suas faixas de longitude eclíptica
 * Longitude varia de 0° (início de Áries) a 360°
 */
export const ZODIAC_DATA: Array<{
  sign: ZodiacSign;
  emoji: ZodiacEmoji;
  startLongitude: number;
  endLongitude: number;
}> = [
  { sign: 'Áries', emoji: '♈', startLongitude: 0, endLongitude: 30 },
  { sign: 'Touro', emoji: '♉', startLongitude: 30, endLongitude: 60 },
  { sign: 'Gêmeos', emoji: '♊', startLongitude: 60, endLongitude: 90 },
  { sign: 'Câncer', emoji: '♋', startLongitude: 90, endLongitude: 120 },
  { sign: 'Leão', emoji: '♌', startLongitude: 120, endLongitude: 150 },
  { sign: 'Virgem', emoji: '♍', startLongitude: 150, endLongitude: 180 },
  { sign: 'Libra', emoji: '♎', startLongitude: 180, endLongitude: 210 },
  { sign: 'Escorpião', emoji: '♏', startLongitude: 210, endLongitude: 240 },
  { sign: 'Sagitário', emoji: '♐', startLongitude: 240, endLongitude: 270 },
  { sign: 'Capricórnio', emoji: '♑', startLongitude: 270, endLongitude: 300 },
  { sign: 'Aquário', emoji: '♒', startLongitude: 300, endLongitude: 330 },
  { sign: 'Peixes', emoji: '♓', startLongitude: 330, endLongitude: 360 },
];

/**
 * Converte longitude eclíptica para signo zodiacal
 * @param longitude - Longitude eclíptica em graus (0-360)
 * @returns Signo zodiacal e emoji correspondente
 */
export function getLunarZodiacSign(longitude: number): {
  sign: ZodiacSign;
  emoji: ZodiacEmoji;
} {
  // Normalizar longitude para 0-360
  const normalizedLongitude = ((longitude % 360) + 360) % 360;

  const zodiac = ZODIAC_DATA.find(
    (z) => normalizedLongitude >= z.startLongitude && normalizedLongitude < z.endLongitude
  );

  // Se por algum motivo não encontrar, retorna Áries como padrão
  return zodiac || { sign: 'Áries', emoji: '♈' };
}

/**
 * Calcula a longitude eclíptica aproximada da Lua para uma data
 * Baseado em cálculos astronômicos simplificados
 * 
 * Nota: Para precisão maior, use a API USNO que fornece dados oficiais
 * 
 * @param date - Data para calcular
 * @returns Longitude eclíptica em graus (0-360)
 */
export function calculateMoonEclipticLongitude(date: Date): number {
  // Referência: 01/01/2000 às 12:00 UTC
  const epoch = new Date('2000-01-01T12:00:00Z');
  const daysSinceEpoch = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);

  // A Lua completa uma órbita em aproximadamente 27.32 dias (mês sideral)
  const SIDEREAL_MONTH = 27.321661;

  // Longitude média da Lua no epoch (ajustado)
  const L0 = 218.316;

  // Taxa de movimento médio da Lua (graus por dia)
  const meanMotion = 360 / SIDEREAL_MONTH;

  // Longitude eclíptica aproximada
  const longitude = (L0 + meanMotion * daysSinceEpoch) % 360;

  return longitude;
}

/**
 * Calcula o signo astrológico da Lua para uma data específica
 * @param date - Data para calcular
 * @returns Signo e emoji da Lua
 */
export function getMoonZodiacSign(date: Date): {
  sign: ZodiacSign;
  emoji: ZodiacEmoji;
} {
  const longitude = calculateMoonEclipticLongitude(date);
  return getLunarZodiacSign(longitude);
}

/**
 * Calcula quantos dias a Lua permanecerá no signo atual
 * A Lua fica aproximadamente 2.3 dias em cada signo
 * @param date - Data atual
 * @returns Dias aproximados restantes no signo atual
 */
export function daysInCurrentSign(date: Date): number {
  const longitude = calculateMoonEclipticLongitude(date);
  const normalizedLongitude = ((longitude % 360) + 360) % 360;

  // Encontrar qual segmento de 30° estamos
  const currentSegment = Math.floor(normalizedLongitude / 30);
  const nextSignLongitude = (currentSegment + 1) * 30;

  // Quantos graus faltam para o próximo signo
  const degreesRemaining = nextSignLongitude - normalizedLongitude;

  // Taxa de movimento da Lua: ~13.2 graus por dia
  const MOON_DAILY_MOTION = 360 / 27.321661;

  return degreesRemaining / MOON_DAILY_MOTION;
}

/**
 * Retorna informações completas sobre a posição zodiacal da Lua
 */
export function getLunarZodiacInfo(date: Date): {
  sign: ZodiacSign;
  emoji: ZodiacEmoji;
  longitude: number;
  daysRemaining: number;
} {
  const longitude = calculateMoonEclipticLongitude(date);
  const { sign, emoji } = getLunarZodiacSign(longitude);
  const daysRemaining = daysInCurrentSign(date);

  return {
    sign,
    emoji,
    longitude,
    daysRemaining: Math.round(daysRemaining * 10) / 10, // arredonda para 1 casa decimal
  };
}
