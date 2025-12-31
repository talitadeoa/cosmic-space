import { NextRequest, NextResponse } from 'next/server';
import { getTokenPayload, validateToken } from '@/lib/auth';
import { listIslands, saveIsland } from '@/lib/forms';
import { ISLAND_IDS, isValidIslandId, type IslandId } from '@/lib/islands';

export const dynamic = 'force-dynamic';

const normalizeName = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

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

    const rows = await listIslands(userId);
    const names: Partial<Record<IslandId, string>> = {};

    rows.forEach((row) => {
      if (!isValidIslandId(row.island_key)) return;
      const title = normalizeName(row.title);
      if (title) {
        names[row.island_key] = title;
      }
    });

    return NextResponse.json({ names }, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar ilhas:', error);
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
    const names = body?.names;
    if (!names || typeof names !== 'object') {
      return NextResponse.json({ error: 'Dados invalidos para ilhas' }, { status: 400 });
    }

    const entries = Object.entries(names) as Array<[string, unknown]>;
    const updates = entries.filter(([key]) => isValidIslandId(key));

    await Promise.all(
      updates.map(([islandKey, value]) =>
        saveIsland(userId, islandKey, {
          titulo: normalizeName(value) || undefined,
        })
      )
    );

    const nextNames: Partial<Record<IslandId, string>> = {};
    ISLAND_IDS.forEach((islandId) => {
      const incoming = normalizeName((names as Record<string, unknown>)[islandId]);
      if (incoming) {
        nextNames[islandId] = incoming;
      }
    });

    return NextResponse.json({ names: nextNames }, { status: 200 });
  } catch (error) {
    console.error('Erro ao salvar ilhas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
