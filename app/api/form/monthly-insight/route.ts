import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { saveMonthlyInsight } from '@/lib/forms';
import { appendToSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

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

    const phaseMap: Record<string, string> = {
      luaNova: 'Lua Nova',
      luaCrescente: 'Lua Crescente',
      luaCheia: 'Lua Cheia',
      luaMinguante: 'Lua Minguante',
    };

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
    const phaseName = phaseMap[moonPhase] || moonPhase;

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

