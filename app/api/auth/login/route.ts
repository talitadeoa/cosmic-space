// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createAuthToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    const db = getDb();
    const userRows = await db`
      INSERT INTO users (email, provider, last_login)
      VALUES (${email}, 'password', NOW())
      ON CONFLICT (email) DO UPDATE
      SET last_login = NOW()
      RETURNING id
    ` as Array<{ id: string }>;
    const userId = userRows?.[0]?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Não foi possível identificar o usuário' },
        { status: 500 }
      );
    }

    const token = createAuthToken({ provider: 'password', email, userId });

    const response = NextResponse.json(
      { success: true, token, message: 'Autenticação bem-sucedida' },
      { status: 200 }
    );

    // Armazenar token no cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
