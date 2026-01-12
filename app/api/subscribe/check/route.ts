import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const db = getDb();
    const result = (await db`
      SELECT 1
      FROM form_entries
      WHERE type = 'subscribe' AND LOWER(email) = ${normalizedEmail}
      LIMIT 1
    `) as Array<{ '?column?': number }>;

    const exists = result.length > 0;

    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Erro ao verificar subscription:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
