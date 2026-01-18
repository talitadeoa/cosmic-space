/**
 * Cliente para U.S. Naval Observatory API
 * Fonte oficial de dados astronômicos dos EUA
 * 
 * API Docs: https://api.usno.navy.mil/
 * 
 * Nota: Requisições são feitas através de /api/moons/phases (proxy no servidor)
 * para evitar problemas de CORS que podem bloquear requisições do navegador.
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

// API local que faz proxy para USNO
const USNO_API_PROXY = '/api/moons/phases';

export interface LunarPhase {
  date: string; // YYYY-MM-DD
  day: number;
  phase: string; // "New Moon", "Waxing Crescent", "First Quarter", etc
  illumination: number; // 0-100
  time?: string; // HH:MM UTC se for evento especial
  // Fallbacks para compatibilidade com código antigo
  age_days?: number; // Para compatibilidade
  is_waxing?: boolean; // Para compatibilidade
  // Signo zodiacal da Lua (calculado)
  zodiac_sign?: ZodiacSign;
  zodiac_emoji?: string;
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
 * Busca dados de fases lunares para um período
 * Com cache automático e deduplicação de requisições
 * Documentação: https://api.usno.navy.mil/moon/phases
 */
export async function getMoonPhases(year: number, month?: number): Promise<LunarPhase[]> {
  try {
    // 1. Verificar cache
    const cached = getCachedPhases(year, month);
    if (cached) {
      return cached;
    }

    // 2. Verificar se já há requisição pendente (deduplicação)
    const requestKey = getPendingRequestKey(year, month);
    const pendingRequest = getPendingRequest(requestKey);
    if (pendingRequest) {
      console.log(`[Dedup] Aguardando requisição pendente para ${year}/${month || 'todos'}`);
      return pendingRequest;
    }

    // 3. Fazer a requisição
    const params = new URLSearchParams();
    params.append('year', String(year));
    if (month) {
      params.append('month', String(month).padStart(2, '0'));
    }

    const url = `${USNO_API_PROXY}?${params.toString()}`;
    
    const requestPromise = (async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data: MoonPhaseResponse = await response.json();
      
      // Validar estrutura da resposta
      if (!data?.properties?.data || !Array.isArray(data.properties.data)) {
        throw new Error('Invalid response structure from USNO API');
      }
      
      // Transformar resposta da USNO e calcular signo zodiacal
      const phases = data.properties.data.map((day: MoonPhaseData) => {
        // Construir data completa para cálculo do signo
        const dateStr = `${year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
        const dateObj = new Date(dateStr);
        
        // Calcular signo zodiacal da Lua
        const zodiac = getMoonZodiacSign(dateObj);
        
        return {
          date: `${String(day.month).padStart(2, '0')}/${String(day.day).padStart(2, '0')}/${year}`,
          day: day.day,
          phase: day.phase,
          illumination: day.illumination || 0,
          time: day.time,
          zodiac_sign: zodiac.sign,
          zodiac_emoji: zodiac.emoji,
        };
      });

      // 4. Armazenar em cache
      setCachedPhases(year, phases, month);
      return phases;
    })();

    // Armazenar como requisição pendente
    setPendingRequest(requestKey, requestPromise);

    return await requestPromise;
  } catch (error) {
    console.error('Erro ao buscar fases lunares:', error);
    throw error;
  }
}

/**
 * Busca fase lunar para uma data específica
 */
export async function getMoonPhaseForDate(date: Date): Promise<LunarPhase | null> {
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const phases = await getMoonPhases(year, month);
    
    if (!phases || phases.length === 0) {
      return null;
    }
    
    // Procurar a fase mais próxima
    const targetDay = date.getDate();
    const closest = phases.reduce((prev, curr) => 
      Math.abs(curr.day - targetDay) < Math.abs(prev.day - targetDay) ? curr : prev
    );

    return closest || null;
  } catch (error) {
    console.error('Erro ao buscar fase lunar para data:', error);
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
  let hasError = false;
  for (const [yearMonth, monthDates] of groupedByYearMonth) {
    try {
      const [year, month] = yearMonth.split('-');
      const phases = await getMoonPhases(Number(year), Number(month));

      monthDates.forEach(date => {
        const targetDay = date.getDate();
        const closest = phases.find(p => p.day === targetDay);

        if (closest) {
          const dateKey = date.toISOString().split('T')[0];
          result.set(dateKey, closest);
        }
      });
    } catch (error) {
      console.warn(`Erro ao buscar fases lunares para ${yearMonth}, usando fallback:`, error);
      hasError = true;
      
      // Usar dados fallback aproximados
      const [year, month] = yearMonth.split('-');
      monthDates.forEach(date => {
        const targetDay = date.getDate();
        const fallbackPhase = FALLBACK_LUNAR_PHASES.find(p => p.day === targetDay);

        if (fallbackPhase) {
          const dateKey = date.toISOString().split('T')[0];
          result.set(dateKey, {
            date: dateKey,
            day: fallbackPhase.day,
            phase: fallbackPhase.phase,
            illumination: fallbackPhase.illumination,
          });
        }
      });
    }
  }

  if (hasError && result.size > 0) {
    console.warn('Usando dados fallback para algumas datas. A API pode estar indisponível.');
  }

  return result;
}
