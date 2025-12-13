import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { saveQuarterlyInsight } from '@/lib/forms';
import { appendToSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { moonPhase, insight, quarterNumber } = body;

    if (!moonPhase || !insight) {
      return NextResponse.json({ error: 'Fase da lua e insight são obrigatórios' }, { status: 400 });
    }

    // Se não informar trimestre, calcular o atual
    let quarter = quarterNumber;
    if (!quarter) {
      const month = new Date().getMonth() + 1;
      quarter = Math.ceil(month / 3);
    }

    if (quarter < 1 || quarter > 4) {
      return NextResponse.json({ error: 'Trimestre deve estar entre 1 e 4' }, { status: 400 });
    }

    const phaseMap: Record<string, string> = {
      luaNova: 'Lua Nova',
      luaCrescente: 'Lua Crescente',
      luaCheia: 'Lua Cheia',
      luaMinguante: 'Lua Minguante',
    };

    const quarterMap: Record<number, string> = {
      1: '1º Trimestre (Jan-Mar)',
      2: '2º Trimestre (Abr-Jun)',
      3: '3º Trimestre (Jul-Set)',
      4: '4º Trimestre (Out-Dez)',
    };

    // Extrair user_id do token
    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId || tokenPayload?.id || Math.random().toString();

    // 1. Salvar no Neon
    try {
      await saveQuarterlyInsight(userId, moonPhase, quarter, insight);
    } catch (neonError) {
      console.error('Erro ao salvar no Neon:', neonError);
      // Continua para salvar no Sheets mesmo se Neon falhar
    }

    // 2. Salvar no Google Sheets (manter compatibilidade)
    const data = {
      timestamp: new Date().toISOString(),
      trimestre: quarterMap[quarter] || `Trimestre ${quarter}`,
      fase: phaseMap[moonPhase] || moonPhase,
      insight,
      tipo: 'insight_trimestral',
    };

    const success = await appendToSheet(data);

    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar insight' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Insight salvo com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao salvar insight trimestral:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

