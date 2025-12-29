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
    const yearParam = searchParams.get('year');
    const monthNumberParam = searchParams.get('monthNumber');
    const year = Number(yearParam);
    const monthNumber = Number(monthNumberParam);

    if (
      !moonPhaseParam ||
      !yearParam ||
      !monthNumberParam ||
      Number.isNaN(year) ||
      Number.isNaN(monthNumber)
    ) {
      return NextResponse.json(
        { error: 'moonPhase, year e monthNumber são obrigatórios' },
        { status: 400 }
      );
    }

    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    const item = await getMonthlyInsight(userId, moonPhaseParam, year, monthNumber);

    if (!item) {
      return NextResponse.json({ item: null }, { status: 200 });
    }

    return NextResponse.json(
      {
        item: {
          id: item.id,
          moonPhase: item.moon_phase,
          year: item.year,
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
    const { moonPhase, year, monthNumber, insight } = body;

    if (!moonPhase || year === undefined || monthNumber === undefined || !insight) {
      return NextResponse.json(
        { error: 'Fase da lua, ano, mês e insight são obrigatórios' },
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
    const userId = tokenPayload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    // 1. Salvar no Neon (usando camelCase como chave, português para leitura)
    try {
      await saveMonthlyInsight(userId, moonPhase, year, monthNumber, insight);
    } catch (neonError) {
      console.error('Erro ao salvar no Neon:', neonError);
      // Continua para salvar no Sheets mesmo se Neon falhar
    }

    // 2. Salvar no Google Sheets (manter compatibilidade)
    const data = {
      timestamp: new Date().toISOString(),
      ano: year,
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
