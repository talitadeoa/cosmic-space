/**
 * Cliente para U.S. Naval Observatory API
 * Fonte oficial de dados astronômicos dos EUA
 * 
 * API Docs: https://api.usno.navy.mil/
 */

const USNO_API_URL = 'https://api.usno.navy.mil';

export interface LunarPhase {
  date: string; // YYYY-MM-DD
  day: number;
  phase: string; // "New Moon", "Waxing Crescent", "First Quarter", etc
  illumination: number; // 0-100
  time?: string; // HH:MM UTC se for evento especial
  // Fallbacks para compatibilidade com código antigo
  age_days?: number; // Para compatibilidade
  is_waxing?: boolean; // Para compatibilidade
  zodiac_sign?: string; // USNO não fornece
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
 * Documentação: https://api.usno.navy.mil/moon/phases
 */
export async function getMoonPhases(year: number, month?: number): Promise<LunarPhase[]> {
  try {
    const params = new URLSearchParams();
    params.append('year', String(year));
    if (month) {
      params.append('month', String(month).padStart(2, '0'));
    }

    const url = `${USNO_API_URL}/moon/phases?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`USNO API error: ${response.status}`);
    }

    const data: MoonPhaseResponse = await response.json();
    
    // Transformar resposta da USNO
    return data.properties.data.map((day: MoonPhaseData) => ({
      date: `${String(day.month).padStart(2, '0')}/${String(day.day).padStart(2, '0')}/${year}`,
      day: day.day,
      phase: day.phase,
      illumination: day.illumination || 0,
      time: day.time,
    }));
  } catch (error) {
    console.error('Erro ao buscar fases lunares da USNO:', error);
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
    
    // Procurar a fase mais próxima
    const targetDay = date.getDate();
    const closest = phases.reduce((prev, curr) => 
      Math.abs(curr.day - targetDay) < Math.abs(prev.day - targetDay) ? curr : prev
    );

    return closest;
  } catch (error) {
    console.error('Erro ao buscar fase lunar para data:', error);
    return null;
  }
}

/**
 * Busca fases lunares para múltiplas datas
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
  try {
    for (const [yearMonth, monthDates] of groupedByYearMonth) {
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
    }
  } catch (error) {
    console.error('Erro ao buscar fases lunares para múltiplas datas:', error);
  }

  return result;
}
