import { NextRequest, NextResponse } from 'next/server';
import { getTokenPayload, validateToken } from '@/lib/auth';
import { getPlanetState, savePlanetState, normalizePlanetState } from '@/lib/planetState';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Usuario nao identificado' }, { status: 401 });
    }

    const state = await getPlanetState(userId);
    return NextResponse.json({ state }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar estado do Planeta:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Usuario nao identificado' }, { status: 401 });
    }

    const body = await request.json();
    const state = normalizePlanetState(body?.state ?? null);

    const saved = await savePlanetState(userId, state);
    return NextResponse.json({ state: saved }, { status: 200 });
  } catch (error) {
    console.error('Erro ao salvar estado do Planeta:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
