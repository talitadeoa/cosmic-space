import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_LUNAR_PHASES } from '@/lib/fallback-lunar-phases';

export const dynamic = 'force-dynamic';

const USNO_API_URL = 'https://aa.usno.navy.mil';
const TIMEOUT_MS = 8000;

/**
 * GET /api/moons/phases?year=2024&month=01
 * 
 * Proxy inteligente para fases lunares:
 * 1. Tenta buscar de USNO com timeout
 * 2. Se falhar, retorna dados fallback
 * 3. Sempre retorna no formato USNO esperado
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Validar parâmetros
    if (!year) {
      return NextResponse.json(
        { error: 'Missing required parameter: year' },
        { status: 400 }
      );
    }

    // Tentar buscar de USNO
    try {
      const response = await fetchFromUSNO(year, month);
      
      // Cache por 24 horas (dados lunares mudam pouco)
      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
          'X-Data-Source': 'usno',
        },
      });
    } catch (error) {
      console.warn(`[USNO] Falha: ${error instanceof Error ? error.message : String(error)}`);
      
      // Fallback para dados aproximados
      const fallbackResponse = getFallbackResponse(year, month);
      
      return NextResponse.json(fallbackResponse, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Data-Source': 'fallback',
          'X-Status': 'USNO unavailable, using fallback data',
        },
      });
    }
  } catch (error) {
    console.error('[API] Erro crítico:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Busca dados da USNO com timeout e retry inteligente
 */
async function fetchFromUSNO(
  yearStr: string,
  monthStr: string | null
): Promise<Record<string, unknown>> {
  // A API USNO retorna o ano inteiro, depois filtramos por mês se necessário
  const usnoUrl = `${USNO_API_URL}/api/moon/phases/year?year=${yearStr}`;
  console.log(`[USNO] Buscando: ${usnoUrl}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn('[USNO] Timeout após ' + TIMEOUT_MS + 'ms');
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(usnoUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'flua-lunar-phases/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
    }

    const data = await response.json();

    // Validar estrutura (novo formato da API)
    if (!data?.phasedata || !Array.isArray(data.phasedata)) {
      throw new Error('Invalid response structure from USNO');
    }

    // Filtrar por mês se especificado
    let phasedata = data.phasedata;
    if (monthStr) {
      const monthNum = parseInt(monthStr);
      phasedata = phasedata.filter((p: any) => p.month === monthNum);
    }

    // Transformar para formato compatível (properties.data)
    const transformedData = {
      apiversion: data.apiversion,
      properties: {
        data: phasedata.map((p: any) => ({
          date: `${String(p.month).padStart(2, '0')}/${String(p.day).padStart(2, '0')}/${p.year}`,
          month: p.month,
          day: p.day,
          phase: p.phase,
          illumination: calculateIllumination(p.phase), // USNO não retorna mais, calcular
          time: p.time,
          year: p.year,
        })),
      },
    };

    console.log(`[USNO] ✓ ${transformedData.properties.data.length} fases retornadas`);
    return transformedData;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

/**
 * Calcula iluminação aproximada baseada na fase
 * (A nova API USNO não retorna illumination)
 */
function calculateIllumination(phase: string): number {
  const phaseMap: Record<string, number> = {
    'New Moon': 0,
    'Waxing Crescent': 25,
    'First Quarter': 50,
    'Waxing Gibbous': 75,
    'Full Moon': 100,
    'Waning Gibbous': 75,
    'Last Quarter': 50,
    'Waning Crescent': 25,
  };
  return phaseMap[phase] ?? 50;
}

/**
 * Retorna dados fallback formatados como resposta USNO
 */
function getFallbackResponse(yearStr: string | null, monthStr: string | null): Record<string, unknown> {
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
  const month = monthStr ? parseInt(monthStr) : 1; // Default janeiro se não especificado

  console.log(`[Fallback] Retornando dados aproximados para ${month}/${year}`);

  // Formatar dados fallback no mesmo formato que USNO espera
  const data = {
    properties: {
      data: FALLBACK_LUNAR_PHASES.map((phase, index) => ({
        date: `${String(month).padStart(2, '0')}/${String(phase.day).padStart(2, '0')}/${year}`,
        month: month,
        day: phase.day,
        phase: phase.phase,
        illumination: phase.illumination, // Manter em 0-100
        time: undefined,
      })),
    },
  };

  return data;
}
