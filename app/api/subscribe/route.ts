import { NextRequest, NextResponse } from 'next/server';
import { saveFormEntry } from '@/lib/forms';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validação básica
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    await saveFormEntry({
      type: 'subscribe',
      email: normalizedEmail,
      source: 'landing',
      payload: {
        captured_at: new Date().toISOString(),
      },
    });

    return NextResponse.json(
      { success: true, message: 'Email registrado com sucesso!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao processar subscription:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
