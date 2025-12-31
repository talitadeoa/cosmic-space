// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, reason: 'no_token' }, { status: 401 });
    }

    if (!validateToken(token)) {
      return NextResponse.json({ authenticated: false, reason: 'invalid_token' }, { status: 401 });
    }

    const payload = getTokenPayload(token);

    if (!payload?.userId) {
      return NextResponse.json({ authenticated: false, reason: 'no_user_id' }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user: payload ?? null }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
