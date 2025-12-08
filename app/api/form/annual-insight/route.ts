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
    const { insight } = body;

    if (!insight) {
      return NextResponse.json(
        { error: 'Insight é obrigatório' },
        { status: 400 }
      );
    }

    const year = new Date().getFullYear();

    const data = {
      timestamp: new Date().toISOString(),
      ano: year.toString(),
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
