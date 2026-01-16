import { NextRequest, NextResponse } from 'next/server';
import { lunarComputeClient } from '@/lib/lunar-compute-client';

/**
 * Rota API adapter para microserviço Python de cálculos lunares
 * 
 * Endpoints:
 * - POST /api/compute/lunar-phase
 * - POST /api/compute/lunar-batch
 * - POST /api/compute/lunations-year
 */

export const dynamic = 'force-dynamic';

// Health check ao iniciar
let serviceHealthy = false;
(async () => {
  try {
    await lunarComputeClient.health();
    serviceHealthy = true;
    console.log('✅ Lunar compute service is healthy');
  } catch (error) {
    console.warn('⚠️ Lunar compute service unavailable:', error);
    serviceHealthy = false;
  }
})();

/**
 * POST /api/compute/lunar-phase
 * Calcula fase lunar para uma data
 */
export async function POST(request: NextRequest) {
  const path = new URL(request.url).pathname;

  try {
    // Verificar saúde do serviço
    if (!serviceHealthy) {
      try {
        await lunarComputeClient.health();
        serviceHealthy = true;
      } catch {
        return NextResponse.json(
          { error: 'Lunar compute service unavailable' },
          { status: 503 }
        );
      }
    }

    // Rota: /api/compute/lunar-phase
    if (path.endsWith('/lunar-phase')) {
      const { date, includeZodiac } = await request.json();

      if (!date) {
        return NextResponse.json(
          { error: 'Missing required field: date' },
          { status: 400 }
        );
      }

      const result = await lunarComputeClient.getLunarPhase(new Date(date), {
        includeZodiac,
      });

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
          'Content-Type': 'application/json',
        },
      });
    }

    // Rota: /api/compute/lunar-batch
    if (path.endsWith('/lunar-batch')) {
      const { dates, includeZodiac } = await request.json();

      if (!Array.isArray(dates) || dates.length === 0) {
        return NextResponse.json(
          { error: 'Missing required field: dates (array)' },
          { status: 400 }
        );
      }

      // Limitar batch a 365 datas por request
      if (dates.length > 365) {
        return NextResponse.json(
          { error: 'Batch size limited to 365 dates' },
          { status: 400 }
        );
      }

      const result = await lunarComputeClient.getLunarBatch(
        dates.map(d => new Date(d)),
        { includeZodiac }
      );

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'Content-Type': 'application/json',
        },
      });
    }

    // Rota: /api/compute/lunations-year
    if (path.endsWith('/lunations-year')) {
      const { year } = await request.json();

      if (!year || typeof year !== 'number') {
        return NextResponse.json(
          { error: 'Missing required field: year (number)' },
          { status: 400 }
        );
      }

      // Validar intervalo de anos
      const currentYear = new Date().getFullYear();
      if (Math.abs(year - currentYear) > 50) {
        return NextResponse.json(
          { error: 'Year must be within 50 years of current year' },
          { status: 400 }
        );
      }

      const result = await lunarComputeClient.getLunationsYear(year);

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
          'Content-Type': 'application/json',
        },
      });
    }

    // Rota: /api/compute/zodiac-sign
    if (path.endsWith('/zodiac-sign')) {
      const { date } = await request.json();

      if (!date) {
        return NextResponse.json(
          { error: 'Missing required field: date' },
          { status: 400 }
        );
      }

      const result = await lunarComputeClient.getZodiacSign(new Date(date));

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
          'Content-Type': 'application/json',
        },
      });
    }

    return NextResponse.json(
      { error: 'Unknown endpoint' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Erro em lunar compute route:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
