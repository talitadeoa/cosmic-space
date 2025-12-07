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
    const { checklist } = body;

    if (!checklist) {
      return NextResponse.json({ error: 'Checklist ausente' }, { status: 400 });
    }

    const success = await appendToSheet({ timestamp: new Date().toISOString(), checklist });

    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar checklist' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao salvar checklist:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
