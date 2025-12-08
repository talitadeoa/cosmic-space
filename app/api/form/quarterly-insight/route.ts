import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';
import { appendToSheet } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { moonPhase, insight } = body;

    if (!moonPhase || !insight) {
      return NextResponse.json({ error: 'Fase da lua e insight são obrigatórios' }, { status: 400 });
    }

    const phaseMap: Record<string, string> = {
      luaNova: 'Lua Nova (Jan-Mar)',
      luaCrescente: 'Lua Crescente (Abr-Jun)',
      luaCheia: 'Lua Cheia (Jul-Set)',
      luaMinguante: 'Lua Minguante (Out-Dez)',
    };

    const data = {
      timestamp: new Date().toISOString(),
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
