/**
 * Cálculos de fase lunar precisos e contínuos
 * Otimizado para renderização em tempo real (60fps)
 */

import type { MoonData, LunarPhaseCalculation } from '../types';

/**
 * Constantes astronômicas
 */
const LUNAR_MONTH = 29.53058867; // Período sinódico médio em dias
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime(); // Referência conhecida

/**
 * Cache de cálculos lunares para performance
 */
class MoonDataCache {
  private cache = new Map<string, MoonData>();
  private maxSize = 1000;
  private precision = 5; // minutos

  /**
   * Gera chave de cache arredondada para precisão
   */
  private getCacheKey(timestamp: number): string {
    const rounded = Math.floor(timestamp / (this.precision * 60 * 1000));
    return rounded.toString();
  }

  /**
   * Obtém dado do cache
   */
  get(timestamp: number): MoonData | null {
    const key = this.getCacheKey(timestamp);
    return this.cache.get(key) || null;
  }

  /**
   * Armazena dado no cache
   */
  set(timestamp: number, data: MoonData): void {
    const key = this.getCacheKey(timestamp);
    
    // Limpar cache se muito grande
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, data);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Instância global do cache
const cache = new MoonDataCache();

/**
 * Calcula a fase lunar para uma data específica
 * Baseado em algoritmo astronômico simplificado mas preciso
 */
export function calculateLunarPhase(date: Date): LunarPhaseCalculation {
  const timestamp = date.getTime();
  
  // Dias desde a lua nova de referência
  const daysSinceReference = (timestamp - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  
  // Posição no ciclo lunar atual
  const lunarAge = daysSinceReference % LUNAR_MONTH;
  
  // Fração de fase (0.0 - 1.0)
  const phaseFraction = lunarAge / LUNAR_MONTH;
  
  // Ângulo de fase (0° - 360°)
  const phaseAngle = phaseFraction * 360;
  
  // Iluminação (0.0 - 1.0)
  // Fórmula: (1 - cos(angle)) / 2
  const illumination = (1 - Math.cos((phaseFraction * 2 * Math.PI))) / 2;
  
  // Determinar nome da fase
  const phaseName = getPhaseName(phaseFraction);
  
  // Fase numérica (0-7)
  const phase = Math.floor(phaseFraction * 8);
  
  return {
    phase,
    illumination,
    angle: phaseAngle,
    name: phaseName
  };
}

/**
 * Nome da fase baseado na fração
 */
function getPhaseName(phaseFraction: number): string {
  const fraction = phaseFraction;
  
  if (fraction < 0.033) return 'Nova';
  if (fraction < 0.216) return 'Crescente';
  if (fraction < 0.283) return 'Quarto Crescente';
  if (fraction < 0.466) return 'Gibosa Crescente';
  if (fraction < 0.533) return 'Cheia';
  if (fraction < 0.716) return 'Gibosa Minguante';
  if (fraction < 0.783) return 'Quarto Minguante';
  if (fraction < 0.966) return 'Minguante';
  return 'Nova';
}

/**
 * Determina se a Lua está crescente ou minguante
 */
function isWaxing(phaseFraction: number): boolean {
  return phaseFraction < 0.5;
}

/**
 * Calcula o ângulo do terminator (linha dia/noite)
 * Retorna ângulo em graus (0-360)
 */
function calculateTerminatorAngle(phaseFraction: number, isWaxing: boolean): number {
  if (isWaxing) {
    // Crescente: terminator move da direita para esquerda
    return 90 - (phaseFraction * 180);
  } else {
    // Minguante: terminator move da esquerda para direita
    return 270 - ((phaseFraction - 0.5) * 180);
  }
}

/**
 * Função principal: obtém todos os dados lunares para um instante
 * 
 * @param dateTime - Data/hora para cálculo
 * @param location - Localização geográfica (opcional, para cálculos avançados)
 * @param timezone - Fuso horário (opcional)
 * @returns Objeto completo com todos os dados lunares
 */
export function getMoonData(
  dateTime: Date,
  _location?: { latitude: number; longitude: number },
  _timezone?: string
): MoonData {
  const timestamp = dateTime.getTime();
  
  // Tentar obter do cache
  const cached = cache.get(timestamp);
  if (cached) {
    return cached;
  }
  
  // Calcular fase lunar
  const phaseCalc = calculateLunarPhase(dateTime);
  
  // Dias desde lua nova de referência
  const daysSinceReference = (timestamp - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceReference % LUNAR_MONTH;
  const phaseFraction = lunarAge / LUNAR_MONTH;
  const waxing = isWaxing(phaseFraction);
  
  // Calcular ângulo do terminator
  const terminatorAngle = calculateTerminatorAngle(phaseFraction, waxing);
  
  // Dias desde última lua nova
  const daysSinceNew = lunarAge;
  
  // Construir objeto de dados
  const moonData: MoonData = {
    illumination: phaseCalc.illumination,
    phaseFraction,
    isWaxing: waxing,
    phaseName: phaseCalc.name,
    terminatorAngle,
    date: new Date(dateTime),
    daysSinceNew,
    lunarAge
  };
  
  // Armazenar no cache
  cache.set(timestamp, moonData);
  
  return moonData;
}

/**
 * Obtém dados lunares para múltiplas datas de uma vez
 * Útil para pré-carregar timeline
 */
export function getMoonDataBatch(dates: Date[]): MoonData[] {
  return dates.map(date => getMoonData(date));
}

/**
 * Calcula a próxima ocorrência de uma fase específica
 */
export function getNextPhase(
  currentDate: Date,
  targetPhaseName: string
): Date {
  const phaseTargets: Record<string, number> = {
    'Nova': 0,
    'Crescente': 0.125,
    'Quarto Crescente': 0.25,
    'Gibosa Crescente': 0.375,
    'Cheia': 0.5,
    'Gibosa Minguante': 0.625,
    'Quarto Minguante': 0.75,
    'Minguante': 0.875
  };
  
  const targetFraction = phaseTargets[targetPhaseName] || 0;
  const current = calculateLunarPhase(currentDate);
  const currentFraction = current.angle / 360;
  
  let daysToAdd: number;
  if (targetFraction >= currentFraction) {
    daysToAdd = (targetFraction - currentFraction) * LUNAR_MONTH;
  } else {
    daysToAdd = (1 - currentFraction + targetFraction) * LUNAR_MONTH;
  }
  
  return new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
}

/**
 * Interpola suavemente entre dois estados lunares
 * Usado para animações fluidas
 */
export function interpolateMoonData(
  from: MoonData,
  to: MoonData,
  progress: number
): MoonData {
  const t = Math.max(0, Math.min(1, progress));
  
  return {
    illumination: from.illumination + (to.illumination - from.illumination) * t,
    phaseFraction: from.phaseFraction + (to.phaseFraction - from.phaseFraction) * t,
    isWaxing: t < 0.5 ? from.isWaxing : to.isWaxing,
    phaseName: t < 0.5 ? from.phaseName : to.phaseName,
    terminatorAngle: from.terminatorAngle + (to.terminatorAngle - from.terminatorAngle) * t,
    date: new Date(from.date.getTime() + (to.date.getTime() - from.date.getTime()) * t),
    daysSinceNew: from.daysSinceNew + (to.daysSinceNew - from.daysSinceNew) * t,
    lunarAge: from.lunarAge + (to.lunarAge - from.lunarAge) * t
  };
}

/**
 * Limpa cache de cálculos (útil para testes ou reset)
 */
export function clearMoonDataCache(): void {
  cache.clear();
}

/**
 * Converte fração de iluminação para descrição textual
 */
export function getIlluminationDescription(illumination: number): string {
  const percentage = Math.round(illumination * 100);
  
  if (percentage < 5) return 'Praticamente invisível';
  if (percentage < 25) return 'Crescente fino';
  if (percentage < 45) return 'Crescente largo';
  if (percentage < 55) return 'Quase metade iluminada';
  if (percentage < 75) return 'Mais da metade iluminada';
  if (percentage < 95) return 'Quase cheia';
  return 'Totalmente iluminada';
}

/**
 * Retorna emoji representando a fase
 */
export function getPhaseEmoji(phaseName: string): string {
  const emojis: Record<string, string> = {
    'Nova': '🌑',
    'Crescente': '🌒',
    'Quarto Crescente': '🌓',
    'Gibosa Crescente': '🌔',
    'Cheia': '🌕',
    'Gibosa Minguante': '🌖',
    'Quarto Minguante': '🌗',
    'Minguante': '🌘'
  };
  
  return emojis[phaseName] || '🌑';
}
