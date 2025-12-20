import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { getMonthlyInsight, saveMonthlyInsight } from '@/lib/forms';
import { appendToSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

const phaseMap: Record<string, string> = {
  luaNova: 'Lua Nova',
  luaCrescente: 'Lua Crescente',
  luaCheia: 'Lua Cheia',
  luaMinguante: 'Lua Minguante',
};

const resolvePhaseName = (moonPhase: string) => {
  return phaseMap[moonPhase] ?? moonPhase;
};

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const moonPhaseParam = searchParams.get('moonPhase');
    const monthNumberParam = searchParams.get('monthNumber');
    const monthNumber = Number(monthNumberParam);

    if (!moonPhaseParam || !monthNumberParam || Number.isNaN(monthNumber)) {
      return NextResponse.json(
        { error: 'moonPhase e monthNumber são obrigatórios' },
        { status: 400 }
      );
    }

    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId || tokenPayload?.id || Math.random().toString();
    const moonPhase = resolvePhaseName(moonPhaseParam);

    const item = await getMonthlyInsight(userId, moonPhase, monthNumber);

    if (!item) {
      return NextResponse.json({ item: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        item: {
          id: item.id,
          moonPhase: item.moon_phase,
          monthNumber: item.month_number,
          insight: item.insight,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao buscar insight mensal:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { moonPhase, monthNumber, insight } = body;

    if (!moonPhase || monthNumber === undefined || !insight) {
      return NextResponse.json(
        { error: 'Fase da lua, mês e insight são obrigatórios' },
        { status: 400 }
      );
    }

    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const monthName = monthNames[(monthNumber - 1) % 12] || 'Desconhecido';
    const phaseName = resolvePhaseName(moonPhase);

    // Extrair user_id do token
    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId || tokenPayload?.id || Math.random().toString();

    // 1. Salvar no Neon
    try {
      await saveMonthlyInsight(userId, phaseName, monthNumber, insight);
    } catch (neonError) {
      console.error('Erro ao salvar no Neon:', neonError);
      // Continua para salvar no Sheets mesmo se Neon falhar
    }

    // 2. Salvar no Google Sheets (manter compatibilidade)
    const data = {
      timestamp: new Date().toISOString(),
      mes: `${monthName} (Mês #${monthNumber})`,
      fase: phaseName,
      insight,
      tipo: 'insight_mensal',
    };

    const success = await appendToSheet(data);

    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar insight' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Insight mensal salvo com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao salvar insight mensal:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
