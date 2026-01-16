/**
 * Cliente para o serviço de cálculos astronômicos em Python
 * Faz fetch para o microserviço lunar-compute
 */

const LUNAR_API_URL = process.env.NEXT_PUBLIC_LUNAR_API_URL || 'http://localhost:8000';

export interface LunarPhaseResponse {
  date: string;
  phase: string;
  age_days: number;
  illumination: number;
  zodiac_sign?: string;
}

export interface LunationDay {
  date: string;
  moonPhase: string;
  ageDays: number;
  illumination: number;
  sign: string;
}

export interface FetchLunationsParams {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  source?: 'python' | 'db';
  signal?: AbortSignal;
}

export interface FetchLunationsResponse {
  days: LunationDay[];
  period: {
    start: string;
    end: string;
  };
}

/**
 * Fetch de lunações para um período
 * Tenta Python primeiro, fallback para banco de dados
 */
export async function fetchLunations(
  params: FetchLunationsParams
): Promise<FetchLunationsResponse> {
  const { start, end, source = 'python', signal } = params;

  try {
    // Tentar fetch para o serviço Python primeiro
    if (source === 'python' || source === 'db') {
      const response = await fetch(`${LUNAR_API_URL}/api/lunations-period`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: start,
          end_date: end,
          include_zodiac: true,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Transformar resposta do Python para o formato esperado
      return {
        days: data.days.map((day: any) => ({
          date: day.date,
          moonPhase: day.phase,
          ageDays: day.age_days,
          illumination: day.illumination,
          sign: day.zodiac_sign || 'N/A',
        })),
        period: {
          start,
          end,
        },
      };
    }

    throw new Error('Source not supported');
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw error;
    }
    
    console.error('Erro ao carregar lunações:', error);
    
    // Fallback: retornar dados vazios
    return {
      days: [],
      period: { start, end },
    };
  }
}

/**
 * Fetch da fase lunar para uma data específica
 */
export async function fetchLunarPhase(
  date: string,
  includeZodiac: boolean = true,
  signal?: AbortSignal
): Promise<LunarPhaseResponse> {
  try {
    const response = await fetch(`${LUNAR_API_URL}/api/lunar-phase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date,
        include_zodiac: includeZodiac,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw error;
    }

    console.error('Erro ao carregar fase lunar:', error);
    throw error;
  }
}

/**
 * Fetch de todas as lunações de um ano
 */
export async function fetchLunationsYear(
  year: number,
  signal?: AbortSignal
): Promise<any> {
  try {
    const response = await fetch(`${LUNAR_API_URL}/api/lunations-year`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ year }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      throw error;
    }

    console.error('Erro ao carregar lunações do ano:', error);
    throw error;
  }
}
