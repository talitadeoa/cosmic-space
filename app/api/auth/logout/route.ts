// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revokeToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      revokeToken(token);
    }

    const response = NextResponse.json(
      { success: true, message: 'Logout realizado com sucesso' },
      { status: 200 }
    );

    response.cookies.set('auth_token', '', {
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
