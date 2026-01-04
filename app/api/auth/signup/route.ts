// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createAuthToken } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, birthDate, gender } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
    }

    if (!firstName) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    if (!lastName) {
      return NextResponse.json({ error: 'Sobrenome é obrigatório' }, { status: 400 });
    }

    if (!birthDate) {
      return NextResponse.json({ error: 'Data de nascimento é obrigatória' }, { status: 400 });
    }

    const parsedBirthDate = new Date(birthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json({ error: 'Data de nascimento inválida' }, { status: 400 });
    }

    const allowedGenders = new Set(['feminino', 'masculino', 'outro', 'prefiro_nao_informar']);

    if (!gender || !allowedGenders.has(gender)) {
      return NextResponse.json({ error: 'Sexo inválido' }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const db = getDb();
    const existing = (await db`SELECT id FROM users WHERE email = ${email}`) as Array<{
      id: string;
    }>;

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const userRows = (await db`
      INSERT INTO users (email, provider, last_login, first_name, last_name, birth_date, gender)
      VALUES (${email}, 'password', NOW(), ${firstName}, ${lastName}, ${birthDate}, ${gender})
      RETURNING id
    `) as Array<{ id: string }>;
    const userId = userRows?.[0]?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não foi possível criar o usuário' }, { status: 500 });
    }

    const token = await createAuthToken({ provider: 'password', email, userId });
    const response = NextResponse.json(
      { success: true, token, message: 'Cadastro realizado com sucesso' },
      { status: 201 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Erro no signup:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
