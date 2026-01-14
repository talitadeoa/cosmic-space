/**
 * API refatorada para obter dados lunares do serviço Python
 * Endpoint otimizado para ciclo de menstruação + luna data
 * 
 * GET /api/lunar/phase?date=2025-01-14T10:30:00Z
 * GET /api/lunar/month?year=2025&month=1
 * GET /api/lunar/year?year=2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { lunarComputeClient } from '@/lib/lunar-compute-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/lunar/phase?date=ISO_DATE
 * Retorna fase lunar para uma data específica
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = request.nextUrl.pathname;
  
  try {
    // Rota: /api/lunar/phase
    if (path.endsWith('/phase')) {
      const dateStr = searchParams.get('date') || new Date().toISOString();
      const includeZodiac = searchParams.get('zodiac') !== 'false';

      const phase = await lunarComputeClient.getLunarPhase(new Date(dateStr), {
        includeZodiac,
      });

      return NextResponse.json(phase, {
        headers: {
          'Cache-Control': 'public, max-age=3600', // 1 hora
          'Content-Type': 'application/json',
        },
      });
    }

    // Rota: /api/lunar/month
    if (path.endsWith('/month')) {
      const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
      const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

      // Gerar datas do mês
      const daysInMonth = new Date(year, month, 0).getDate();
      const dates = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, month - 1, i + 1);
        date.setHours(12, 0, 0, 0);
        return date;
      });

      // Buscar fases em batch
      const phases = await lunarComputeClient.getLunarBatch(dates, {
        includeZodiac: true,
      });

      return NextResponse.json(
        {
          year,
          month,
          days: daysInMonth,
          phases,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=86400', // 24 horas
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Rota: /api/lunar/year
    if (path.endsWith('/year')) {
      const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

      const lunations = await lunarComputeClient.getLunationsYear(year);

      return NextResponse.json(lunations, {
        headers: {
          'Cache-Control': 'public, max-age=86400', // 24 horas
          'Content-Type': 'application/json',
        },
      });
    }

    return NextResponse.json(
      { error: 'Endpoint não encontrado' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Erro em rota lunar API:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
