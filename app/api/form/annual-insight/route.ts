import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { saveAnnualInsight } from '@/lib/forms';
import { appendToSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { insight, year } = body;

    if (!insight) {
      return NextResponse.json({ error: 'Insight é obrigatório' }, { status: 400 });
    }

    const selectedYear = year ?? new Date().getFullYear();

    // Extrair user_id do token
    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 });
    }

    // 1. Salvar no Neon
    try {
      await saveAnnualInsight(userId, insight, selectedYear);
    } catch (neonError) {
      console.error('Erro ao salvar no Neon:', neonError);
      // Continua para salvar no Sheets mesmo se Neon falhar
    }

    // 2. Salvar no Google Sheets (manter compatibilidade)
    const data = {
      timestamp: new Date().toISOString(),
      ano: selectedYear.toString(),
      insight,
      tipo: 'insight_anual',
    };

    const success = await appendToSheet(data);

    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar insight' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Insight anual salvo com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao salvar insight anual:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
