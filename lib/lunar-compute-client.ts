/**
 * Client para comunicação com microserviço Python de cálculos astronômicos
 * 
 * Uso:
 * ```typescript
 * import { lunarComputeClient } from '@/lib/lunar-compute-client';
 * 
 * const phase = await lunarComputeClient.getLunarPhase(new Date(), { includeZodiac: true });
 * ```
 */

interface LunarPhaseResponse {
  date: string;
  phase: string; // 'new', 'waxing_crescent', 'first_quarter', etc
  illumination: number; // 0-1
  phase_fraction: number; // 0-1
  age_days: number;
  is_waxing: boolean;
  zodiac_sign?: string;
  zodiac_emoji?: string;
}

interface LunationData {
  lunation_date: string;
  moon_phase: string;
  illumination: number;
  age_days: number;
  zodiac_sign: string;
  zodiac_emoji: string;
}

interface LunationsYearResponse {
  year: number;
  count: number;
  lunations: LunationData[];
}

class LunarComputeClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = process.env.LUNAR_COMPUTE_URL || 'http://localhost:8000', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Verifica saúde do serviço
   */
  async health(): Promise<{ status: string; service: string; version: string }> {
    try {
      const response = await this.fetch('/health', { method: 'GET' });
      return await response.json();
    } catch (error) {
      throw new Error(`Lunar compute service health check failed: ${error}`);
    }
  }

  /**
   * Calcula fase lunar para uma data específica
   */
  async getLunarPhase(date: Date, options?: { includeZodiac?: boolean }): Promise<LunarPhaseResponse> {
    const payload = {
      date: date.toISOString(),
      include_zodiac: options?.includeZodiac ?? false,
    };

    const response = await this.fetch('/api/lunar-phase', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate lunar phase: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Calcula múltiplas fases lunares em batch
   * Otimizado para lotes grandes de datas
   */
  async getLunarBatch(dates: Date[], options?: { includeZodiac?: boolean }): Promise<LunarPhaseResponse[]> {
    const payload = {
      dates: dates.map(d => d.toISOString()),
      include_zodiac: options?.includeZodiac ?? false,
    };

    const response = await this.fetch('/api/lunar-batch', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lunar batch: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Obtém todas as lunações de um ano
   */
  async getLunationsYear(year: number): Promise<LunationsYearResponse> {
    const response = await this.fetch(`/api/lunations-year?year=${year}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lunations for year ${year}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Calcula signo zodiacal para uma data
   */
  async getZodiacSign(date: Date): Promise<{ date: string; zodiac_sign: string; zodiac_emoji: string }> {
    const response = await this.fetch(`/api/zodiac-sign?date=${encodeURIComponent(date.toISOString())}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate zodiac sign: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Requisição HTTP com timeout e retry
   */
  private async fetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers as Record<string, string>),
        },
      });

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Lunar compute request timeout after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const lunarComputeClient = new LunarComputeClient();
export type { LunarPhaseResponse, LunationData, LunationsYearResponse };
