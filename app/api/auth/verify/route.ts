// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token || !validateToken(token)) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
