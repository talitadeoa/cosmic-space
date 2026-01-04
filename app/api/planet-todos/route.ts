import { NextRequest, NextResponse } from 'next/server';
import { getTokenPayload, validateToken } from '@/lib/auth';
import { listPlanetTodos, replacePlanetTodos } from '@/lib/planetTodos';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const tokenPayload = await getTokenPayload(token);
    const userId = tokenPayload?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Usuario nao identificado' }, { status: 401 });
    }

    const items = await listPlanetTodos(userId);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar tarefas do Planeta:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const tokenPayload = await getTokenPayload(token);
    const userId = tokenPayload?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Usuario nao identificado' }, { status: 401 });
    }

    const body = await request.json();
    const items = body?.items;
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Lista de tarefas invalida' }, { status: 400 });
    }

    await replacePlanetTodos(userId, items);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao salvar tarefas do Planeta:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
