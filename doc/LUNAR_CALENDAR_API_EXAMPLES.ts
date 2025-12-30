/**
 * Exemplo de Payload de API para Dados Lunares
 *
 * Contém exemplos de:
 * 1. Resposta para um mês completo
 * 2. Resposta com erro
 * 3. Resposta com dados extensos
 * 4. Query da API
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 1: Resposta Completa para um Mês
 * ═══════════════════════════════════════════════════════════════
 *
 * GET /api/lunar-data?month=12&year=2025
 *
 * Status: 200 OK
 */
const monthlyLunarDataExample = {
  month: 12,
  year: 2025,
  monthName: 'Dezembro',
  totalDays: 31,
  byDate: {
    '2025-12-01': {
      phase: 'waning_gibbous',
      illumination: 87.3,
      phaseName: 'Gibosa Minguante',
      daysInPhase: 2,
      nextPhaseDate: '2025-12-04',
      lunationNumber: 1226,
    },
    '2025-12-04': {
      phase: 'last_quarter',
      illumination: 50.2,
      phaseName: 'Quarto Minguante',
      daysInPhase: 1,
      nextPhaseDate: '2025-12-11',
      lunationNumber: 1226,
    },
    '2025-12-05': {
      phase: 'waning_crescent',
      illumination: 42.8,
      phaseName: 'Minguante',
      daysInPhase: 3,
      nextPhaseDate: '2025-12-14',
      lunationNumber: 1226,
    },
    '2025-12-11': {
      phase: 'waning_crescent',
      illumination: 15.6,
      phaseName: 'Minguante',
      daysInPhase: 3,
      nextPhaseDate: '2025-12-14',
      lunationNumber: 1226,
    },
    '2025-12-14': {
      phase: 'new',
      illumination: 0.1,
      phaseName: 'Lua Nova',
      daysInPhase: 2,
      nextPhaseDate: '2025-12-22',
      lunationNumber: 1227,
      isEclipse: false,
    },
    '2025-12-22': {
      phase: 'waxing_crescent',
      illumination: 35.7,
      phaseName: 'Crescente',
      daysInPhase: 5,
      nextPhaseDate: '2025-12-29',
      lunationNumber: 1227,
    },
    '2025-12-29': {
      phase: 'first_quarter',
      illumination: 50.0,
      phaseName: 'Quarto Crescente',
      daysInPhase: 1,
      nextPhaseDate: '2026-01-04',
      lunationNumber: 1227,
    },
    // ... outros dias do mês (completo para todos os 31 dias)
  },
  metadata: {
    timezone: 'America/Sao_Paulo',
    calculatedAt: '2025-12-28T12:30:00Z',
    algorithm: 'VSOP87', // algoritmo de cálculo astronômico
    accuracy: '±1 minute',
  },
};

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 2: Resposta com Erro
 * ═══════════════════════════════════════════════════════════════
 *
 * GET /api/lunar-data?month=13&year=2025  (mês inválido)
 *
 * Status: 400 Bad Request
 */
const errorResponse = {
  error: 'Invalid month',
  message: 'Month must be between 0 and 11',
  code: 'INVALID_PARAMS',
  timestamp: '2025-12-28T12:30:00Z',
};

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 3: Resposta Mínima (simplificada)
 * ═══════════════════════════════════════════════════════════════
 *
 * Quando apenas os dados essenciais são necessários
 */
const minimalResponse = {
  month: 12,
  year: 2025,
  byDate: {
    '2025-12-28': {
      phase: 'full',
      illumination: 99.8,
      phaseName: 'Lua Cheia',
    },
    // ... outros dias
  },
};

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 4: Resposta com Dados Estendidos
 * ═══════════════════════════════════════════════════════════════
 *
 * GET /api/lunar-data?month=12&year=2025&extended=true
 *
 * Inclui informações astronômicas adicionais
 */
const extendedResponse = {
  month: 12,
  year: 2025,
  byDate: {
    '2025-12-14': {
      phase: 'new',
      illumination: 0.1,
      phaseName: 'Lua Nova',
      daysInPhase: 2,
      nextPhaseDate: '2025-12-22',
      lunationNumber: 1227,

      // Dados estendidos
      geocentricLongitude: 262.45, // graus
      distance: 406350, // km (apogeu/perigeu)
      rightAscension: '17h 30m 45s',
      declination: '-3° 15\' 30"',
      age: 0.2, // dias na fase

      // Visibilidade
      riseTime: '06:45',
      setTime: '18:30',
      transitTime: '12:37',

      // Evento lunar especial
      isEclipse: false,
      eclipseType: null,
      magnitude: null,

      // Próximos eventos
      nextNewMoon: '2026-01-14',
      nextFullMoon: '2025-12-29',
      nextApogee: '2025-12-20',
      nextPerigee: '2025-12-05',
    },
    // ... outros dias
  },
  metadata: {
    timezone: 'America/Sao_Paulo',
    observer: {
      latitude: -23.5505, // São Paulo
      longitude: -46.6333,
      altitude: 760, // metros
    },
    calculatedAt: '2025-12-28T12:30:00Z',
    algorithm: 'VSOP87',
    accuracy: '±1 minute',
  },
};

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 5: Endpoints Alternativos
 * ═══════════════════════════════════════════════════════════════
 */

// GET /api/lunar-data/today
const todayResponse = {
  date: '2025-12-28',
  phase: 'full',
  illumination: 99.8,
  phaseName: 'Lua Cheia',
  riseTime: '18:45',
  setTime: '06:30', // dia seguinte
};

// GET /api/lunar-data/phases?year=2025
const yearlyPhasesResponse = {
  year: 2025,
  phases: [
    {
      lunationNumber: 1219,
      newMoon: '2025-01-13',
      firstQuarter: '2025-01-21',
      fullMoon: '2025-01-29',
      lastQuarter: '2025-02-06',
    },
    {
      lunationNumber: 1220,
      newMoon: '2025-02-12',
      firstQuarter: '2025-02-20',
      fullMoon: '2025-02-28',
      lastQuarter: '2025-03-08',
    },
    // ... outros meses
  ],
};

// GET /api/lunar-data/range?startDate=2025-12-01&endDate=2025-12-31
const rangeResponse = {
  startDate: '2025-12-01',
  endDate: '2025-12-31',
  daysCount: 31,
  byDate: {
    // ... dados para cada dia
  },
};

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 6: Implementação de Endpoint Node.js/Next.js
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Arquivo: /app/api/lunar-data/route.ts
 */
/*
import { NextRequest, NextResponse } from 'next/server';
import { getLunarDataFromDatabase } from '@/lib/db/lunar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const extended = searchParams.get('extended') === 'true';

  // Validação
  if (!month || !year) {
    return NextResponse.json(
      { error: 'Missing month or year' },
      { status: 400 }
    );
  }

  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  if (monthNum < 0 || monthNum > 11) {
    return NextResponse.json(
      { error: 'Invalid month (0-11)' },
      { status: 400 }
    );
  }

  try {
    // Buscar dados do banco
    const lunarData = await getLunarDataFromDatabase(yearNum, monthNum);

    if (!lunarData) {
      // Se não tiver, calcular usando biblioteca astronômica
      const calculated = await calculateLunarPhases(yearNum, monthNum);
      
      // Opcionalmente: salvar no banco para cache
      await cacheLunarData(calculated);
      
      return NextResponse.json(calculated);
    }

    // Transformar para formato esperado
    const formatted = formatLunarData(lunarData, extended);

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, max-age=86400', // 24h
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching lunar data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 7: SQL Query para Banco Neon/PostgreSQL
 * ═══════════════════════════════════════════════════════════════
 */

/*
SELECT
  date,
  phase,
  illumination,
  phase_name,
  days_in_phase,
  next_phase_date,
  lunation_number,
  is_eclipse,
  eclipse_type,
  geocentric_longitude,
  distance_km
FROM lunar_phases
WHERE
  EXTRACT(YEAR FROM date) = $1
  AND EXTRACT(MONTH FROM date) = $2
ORDER BY date ASC;

-- Ou com view aggregada:
SELECT
  date,
  phase,
  ROUND(illumination::numeric, 1) as illumination,
  phase_name,
  days_in_phase,
  next_phase_date
FROM v_lunar_phases_detailed
WHERE
  year = $1
  AND month = $2
ORDER BY date;
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 8: Teste de API (usando Fetch)
 * ═══════════════════════════════════════════════════════════════
 */

/*
// Testar no navegador (console)
fetch('/api/lunar-data?month=11&year=2025')
  .then(res => res.json())
  .then(data => {
    console.warn('Dados de dezembro/2025:', data);
    console.warn('Fase em 28/12:', data.byDate['2025-12-28']);
  });

// Com async/await
async function fetchLunarData(month, year) {
  const response = await fetch(
    `/api/lunar-data?month=${month}&year=${year}`
  );
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

// Usar no componente
const data = await fetchLunarData(11, 2025);
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 9: TypeScript Interfaces para API
 * ═══════════════════════════════════════════════════════════════
 */

interface LunarDataPoint {
  phase: string;
  illumination: number;
  phaseName: string;
  daysInPhase?: number;
  nextPhaseDate?: string;
  lunationNumber?: number;
  isEclipse?: boolean;
  eclipseType?: string | null;
  magnitude?: number | null;
}

interface LunarDataResponse {
  month: number;
  year: number;
  monthName?: string;
  totalDays?: number;
  byDate: Record<string, LunarDataPoint>;
  metadata?: {
    timezone: string;
    calculatedAt: string;
    algorithm: string;
    accuracy: string;
  };
}

interface LunarDataError {
  error: string;
  message: string;
  code: string;
  timestamp: string;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * EXEMPLO 10: Tratamento de Erro no Cliente
 * ═══════════════════════════════════════════════════════════════
 */

/*
async function fetchLunarDataWithErrorHandling(month: number, year: number) {
  try {
    const response = await fetch(
      `/api/lunar-data?month=${month}&year=${year}`
    );

    if (!response.ok) {
      const error: LunarDataError = await response.json();
      throw new Error(error.message || 'Failed to fetch lunar data');
    }

    const data: LunarDataResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados lunares:', error);
    
    // Fallback: dados simulados
    console.warn('Using mock data as fallback');
    return generateMockLunarData(year, month);
  }
}
*/

/**
 * Export para documentação
 */
export {
  monthlyLunarDataExample,
  errorResponse,
  minimalResponse,
  extendedResponse,
  todayResponse,
  yearlyPhasesResponse,
  rangeResponse,
};
