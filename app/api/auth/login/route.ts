// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createAuthToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
    }

    const db = getDb();
    
    // Buscar usuário por email
    const userRows = (await db`
      SELECT id, password_hash FROM users WHERE email = ${email}
    `) as Array<{ id: string; password_hash: string | null }>;

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    const user = userRows[0];

    // Se não tem password_hash, usuário foi criado com outro provider
    if (!user.password_hash) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    // Validar senha contra o hash
    const passwordIsValid = await validatePassword(password, user.password_hash);
    if (!passwordIsValid) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    // Atualizar last_login
    await db`
      UPDATE users SET last_login = NOW() WHERE id = ${user.id}
    `;

    const token = await createAuthToken({ provider: 'password', email, userId: user.id });

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
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
