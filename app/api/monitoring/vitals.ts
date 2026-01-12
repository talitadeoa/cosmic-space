/**
 * API Route para receber e processar métricas de Web Vitals
 * @route POST /api/monitoring/vitals
 */

import { NextRequest, NextResponse } from 'next/server';

interface VitalRecord {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  timestamp: string;
  page: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: VitalRecord = await request.json();

    // Validar dados
    if (!data.name || typeof data.value !== 'number') {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Construir registro
    const vitalRecord = {
      ...data,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date(data.timestamp),
      recordedAt: new Date(),
    };

    // TODO: Salvar em banco de dados
    // await db.vitals.create(vitalRecord);

    // Log
    console.log('📊 Web Vital Recorded:', {
      name: data.name,
      value: data.value,
      rating: data.rating,
      page: data.page,
      timestamp: data.timestamp,
    });

    // Alertar se métrica está ruim
    if (data.rating === 'poor') {
      console.warn(`⚠️ POOR Rating para ${data.name}: ${data.value.toFixed(2)}ms`);
      // TODO: Notificar via Slack/Email
    }

    return NextResponse.json({
      success: true,
      data: vitalRecord,
    });
  } catch (error) {
    console.error('Erro ao processar Web Vital:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET - retorna estatísticas das vitals
export async function GET() {
  try {
    // TODO: Buscar dados do banco
    // const vitals = await db.vitals.findMany();
    // const stats = calculateStats(vitals);

    return NextResponse.json({
      stats: {
        message: 'Implemente a busca de estatísticas',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
