/**
 * Cliente para dados de fases lunares
 * 
 * Fontes (em ordem de prioridade):
 * 1. U.S. Naval Observatory API: https://aa.usno.navy.mil/api/moon/phases/year
 * 2. Fallback: Dados aproximados pre-calculados
 * 
 * Nota: Requisições são feitas através de /api/moons/phases (proxy no servidor)
 * para evitar problemas de CORS.
 * 
 * Cache: Requisições são automaticamente cacheadas para evitar duplicação
 */

import { FALLBACK_LUNAR_PHASES } from './fallback-lunar-phases';
import {
  getCachedPhases,
  setCachedPhases,
  getPendingRequest,
  setPendingRequest,
  getPendingRequestKey,
} from './lunar-cache';
import { getMoonZodiacSign, type ZodiacSign } from './lunar-zodiac';

// API local que faz proxy para USNO ou calcula localmente
const MOON_PHASES_API = '/api/moons/phases';

export interface LunarPhase {
  date: string; // YYYY-MM-DD
  day: number;
  phase: string; // "New Moon", "Waxing Crescent", "First Quarter", etc
  illumination: number; // 0-100 (sempre percentual)
  time?: string; // HH:MM UTC se for evento especial
  // Signo zodiacal da Lua (calculado)
  zodiac_sign?: ZodiacSign;
  zodiac_emoji?: string;
  // Campos calculados (compatibilidade)
  age_days?: number; // Idade da lua em dias desde a última lua nova
  is_waxing?: boolean; // Se está crescente ou minguante
  // Metadados
  source?: 'usno' | 'fallback' | 'calculated'; // Fonte dos dados
}

export interface MoonPhaseData {
  date: string;
  month: number;
  day: number;
  phase: string;
  illumination: number;
  time?: string;
}

export interface MoonPhaseResponse {
  properties: {
    data: MoonPhaseData[];
  };
}

/**
 * Calcula idade lunar aproximada baseada na fase
 */
function calculateLunarAge(phase: string, illumination: number): number {
  const phaseAgeMap: Record<string, number> = {
    'New Moon': 0,
    'Waxing Crescent': 3.7,
    'First Quarter': 7.4,
    'Waxing Gibbous': 11.1,
    'Full Moon': 14.76,
    'Waning Gibbous': 18.4,
    'Last Quarter': 22.1,
    'Waning Crescent': 25.8,
  };
  
  // Se temos o mapeamento exato, usar
  if (phaseAgeMap[phase] !== undefined) {
    return phaseAgeMap[phase];
  }
  
  // Caso contrário, estimar baseado na iluminação
  if (illumination <= 5) return 0; // Lua Nova
  if (illumination >= 95) return 14.76; // Lua Cheia
  
  // Interpolação linear
  return (illumination / 100) * 29.53;
}

/**
 * Determina se a lua está crescente baseada na fase
 */
function isWaxingPhase(phase: string): boolean {
  const waxingPhases = ['Waxing Crescent', 'First Quarter', 'Waxing Gibbous'];
  const waningPhases = ['Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  
  if (waxingPhases.includes(phase)) return true;
  if (waningPhases.includes(phase)) return false;
  
  // Para New Moon e Full Moon, olhar o nome
  return phase === 'New Moon' || phase.includes('Waxing');
}

/**
 * Transforma resposta da USNO API para formato interno
 */
function transformUSNOResponse(
  data: MoonPhaseResponse,
  year: number,
  month?: number
): LunarPhase[] {
  return data.properties.data.map((day: MoonPhaseData) => {
    // Construir data completa para cálculo do signo
    const dateStr = `${year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
    const dateObj = new Date(dateStr);
    
    // Calcular signo zodiacal da Lua
    const zodiac = getMoonZodiacSign(dateObj);
    
    // Garantir que illumination está sempre em 0-100
    let illuminationPercent = day.illumination ?? 0;
    if (illuminationPercent > 0 && illuminationPercent <= 1) {
      // Se está em formato 0-1, converter para 0-100
      illuminationPercent = illuminationPercent * 100;
    }
    
    const roundedIllumination = Math.round(illuminationPercent);
    
    return {
      date: dateStr,
      day: day.day,
      phase: day.phase,
      illumination: roundedIllumination,
      time: day.time,
      zodiac_sign: zodiac.sign,
      zodiac_emoji: zodiac.emoji,
      age_days: calculateLunarAge(day.phase, roundedIllumination),
      is_waxing: isWaxingPhase(day.phase),
      source: 'usno',
    };
  });
}

/**
 * Gera dados fallback para um período
 */
function generateFallbackPhases(year: number, month?: number): LunarPhase[] {
  if (!month) {
    // Se não especificou mês, usar dados para janeiro (aproximação)
    month = 1;
  }

  return FALLBACK_LUNAR_PHASES.map(phase => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(phase.day).padStart(2, '0')}`;
    const dateObj = new Date(dateStr);
    const zodiac = getMoonZodiacSign(dateObj);
    
    return {
      date: dateStr,
      day: phase.day,
      phase: phase.phase,
      illumination: phase.illumination,
      zodiac_sign: zodiac.sign,
      zodiac_emoji: zodiac.emoji,
      age_days: calculateLunarAge(phase.phase, phase.illumination),
      is_waxing: isWaxingPhase(phase.phase),
      source: 'fallback',
    };
  });
}

/**
 * Busca dados de fases lunares para um período
 * Com cache automático e deduplicação de requisições
 * Tenta: USNO API → Fallback
 */
export async function getMoonPhases(year: number, month?: number): Promise<LunarPhase[]> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[getMoonPhases] Iniciando busca para ${year}/${month || 'ano todo'}`);
  }
  
  try {
    // 1. Verificar cache
    const cached = getCachedPhases(year, month);
    if (cached) {
      console.log(`[Cache] Fases lunares para ${year}/${month || 'todos meses'}`);
      return cached;
    }

    // 2. Verificar se já há requisição pendente (deduplicação)
    const requestKey = getPendingRequestKey(year, month);
    const pendingRequest = getPendingRequest(requestKey);
    if (pendingRequest) {
      console.log(`[Dedup] Aguardando requisição pendente para ${year}/${month || 'todos'}`);
      const result = await pendingRequest;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Dedup] Resultado recebido:`, result);
      }
      return result;
    }

    // 3. Fazer a requisição
    const params = new URLSearchParams();
    params.append('year', String(year));
    if (month) {
      params.append('month', String(month).padStart(2, '0'));
    }

    const url = `${MOON_PHASES_API}?${params.toString()}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getMoonPhases] Fazendo requisição para: ${url}`);
    }
    
    const requestPromise = (async () => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[getMoonPhases] Resposta recebida: ${response.status}`);
        }

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[getMoonPhases] Dados recebidos:`, data);
        }
        
        // Validar estrutura da resposta
        if (!data?.properties?.data || !Array.isArray(data.properties.data)) {
          console.error('[getMoonPhases] Estrutura inválida:', data);
          throw new Error('Invalid response structure');
        }
        
        // Transformar resposta da USNO
        const phases = transformUSNOResponse(data, year, month);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[getMoonPhases] Fases transformadas:`, phases);
        }
        
        if (phases && phases.length > 0) {
          console.log(`[USNO] ${phases.length} fases para ${year}/${month || 'todos'}`);
          setCachedPhases(year, phases, month);
          return phases;
        }
        
        throw new Error('Empty response');
      } catch (error) {
        console.warn(
          `[API] Falha ao buscar USNO: ${error instanceof Error ? error.message : String(error)}`
        );
        
        // Fallback
        console.log(`[Fallback] Usando dados aproximados para ${year}/${month || 'todos'}`);
        const fallbackPhases = generateFallbackPhases(year, month);
        setCachedPhases(year, fallbackPhases, month);
        return fallbackPhases;
      }
    })();

    // Armazenar como requisição pendente
    setPendingRequest(requestKey, requestPromise);

    return await requestPromise;
  } catch (error) {
    console.error('[getMoonPhases] Erro crítico:', error);
    
    // Último fallback - garantir que sempre retorna um array
    const fallbackPhases = generateFallbackPhases(year, month);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getMoonPhases] Usando fallback final:`, fallbackPhases);
    }
    setCachedPhases(year, fallbackPhases, month);
    return fallbackPhases;
  }
}

/**
 * Busca fase lunar para uma data específica
 */
/**
 * Interpola dados lunares para um dia específico baseado nos eventos principais
 */
function interpolateMoonPhase(
  phases: LunarPhase[],
  targetDay: number,
  year: number,
  month: number
): LunarPhase {
  // Ordenar fases por dia
  const sortedPhases = [...phases].sort((a, b) => a.day - b.day);
  
  // Encontrar as duas fases mais próximas (antes e depois)
  let beforePhase: LunarPhase | null = null;
  let afterPhase: LunarPhase | null = null;
  
  for (let i = 0; i < sortedPhases.length; i++) {
    if (sortedPhases[i].day <= targetDay) {
      beforePhase = sortedPhases[i];
    }
    if (sortedPhases[i].day > targetDay && !afterPhase) {
      afterPhase = sortedPhases[i];
      break;
    }
  }
  
  // Se não encontrou antes, pegar do mês anterior (simplificado: usar última fase)
  if (!beforePhase) {
    beforePhase = sortedPhases[sortedPhases.length - 1];
  }
  
  // Se não encontrou depois, pegar do próximo mês (simplificado: usar primeira fase)
  if (!afterPhase) {
    afterPhase = sortedPhases[0];
  }
  
  // Se a fase exata existe, retornar
  const exactPhase = sortedPhases.find(p => p.day === targetDay);
  if (exactPhase) {
    return exactPhase;
  }
  
  // Interpolar entre as duas fases
  const totalDays = Math.abs(afterPhase.day - beforePhase.day) || 1;
  const daysPassed = targetDay - beforePhase.day;
  const ratio = Math.max(0, Math.min(1, daysPassed / totalDays));
  
  // Interpolar iluminação
  const illumination = beforePhase.illumination + 
    (afterPhase.illumination - beforePhase.illumination) * ratio;
  
  // Interpolar idade lunar
  const age_days = beforePhase.age_days! + 
    (afterPhase.age_days! - beforePhase.age_days!) * ratio;
  
  // Determinar fase baseada na iluminação interpolada
  let phase: string;
  let is_waxing: boolean;
  
  if (illumination < 5) {
    phase = 'New Moon';
    is_waxing = true;
  } else if (illumination < 45) {
    is_waxing = beforePhase.is_waxing ?? true;
    phase = is_waxing ? 'Waxing Crescent' : 'Waning Crescent';
  } else if (illumination < 55) {
    is_waxing = beforePhase.is_waxing ?? true;
    phase = is_waxing ? 'First Quarter' : 'Last Quarter';
  } else if (illumination < 95) {
    is_waxing = beforePhase.is_waxing ?? true;
    phase = is_waxing ? 'Waxing Gibbous' : 'Waning Gibbous';
  } else {
    phase = 'Full Moon';
    is_waxing = false;
  }
  
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
  const dateObj = new Date(dateStr);
  const zodiac = getMoonZodiacSign(dateObj);
  
  return {
    date: dateStr,
    day: targetDay,
    phase,
    illumination: Math.round(illumination),
    zodiac_sign: zodiac.sign,
    zodiac_emoji: zodiac.emoji,
    age_days,
    is_waxing,
    source: 'calculated',
  };
}

export async function getMoonPhaseForDate(date: Date): Promise<LunarPhase | null> {
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const targetDay = date.getDate();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getMoonPhaseForDate] Buscando para: ${date.toISOString()} (${year}-${month}-${targetDay})`);
    }

    const phases = await getMoonPhases(year, month);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getMoonPhaseForDate] Recebido ${phases?.length || 0} fases:`, phases?.map(p => `${p.day}:${p.phase}`));
    }
    
    if (!phases || phases.length === 0) {
      console.warn('[getMoonPhaseForDate] Nenhuma fase retornada!');
      return null;
    }
    
    // Procurar a fase exata
    const exact = phases.find(p => p.day === targetDay);
    
    if (exact) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[getMoonPhaseForDate] ✓ Fase exata encontrada para dia ${targetDay}:`, exact.phase);
      }
      return exact;
    }

    // Interpolar fase para o dia solicitado
    const interpolated = interpolateMoonPhase(phases, targetDay, year, month);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[getMoonPhaseForDate] 📊 Fase interpolada para dia ${targetDay}:`, {
        phase: interpolated.phase,
        illumination: interpolated.illumination,
        isWaxing: interpolated.is_waxing,
        ageDays: interpolated.age_days,
      });
    }

    return interpolated;
  } catch (error) {
    console.error('[Error] Ao buscar fase para data:', error);
    return null;
  }
}

/**
 * Busca fases lunares para múltiplas datas
 * Com fallback para dados aproximados em caso de erro
 */
export async function getMoonPhasesForDates(dates: Date[]): Promise<Map<string, LunarPhase>> {
  const result = new Map<string, LunarPhase>();

  // Agrupar datas por ano/mês para minimizar requisições
  const groupedByYearMonth = new Map<string, Date[]>();

  dates.forEach(date => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!groupedByYearMonth.has(key)) {
      groupedByYearMonth.set(key, []);
    }
    groupedByYearMonth.get(key)!.push(date);
  });

  // Buscar fases para cada mês
  for (const [yearMonth, monthDates] of groupedByYearMonth) {
    try {
      const [year, month] = yearMonth.split('-');
      const phases = await getMoonPhases(Number(year), Number(month));

      monthDates.forEach(date => {
        const targetDay = date.getDate();
        const dateKey = date.toISOString().split('T')[0];
        
        // Procurar fase exata
        const exact = phases.find(p => p.day === targetDay);
        if (exact) {
          result.set(dateKey, exact);
          return;
        }
        
        // Ou mais próxima
        const closest = phases.reduce((prev, curr) =>
          Math.abs(curr.day - targetDay) < Math.abs(prev.day - targetDay) ? curr : prev
        );
        
        if (closest) {
          result.set(dateKey, closest);
        }
      });
    } catch (error) {
      console.warn(`[Error] Ao buscar ${yearMonth}:`, error);
    }
  }

  return result;
}
