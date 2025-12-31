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

const defaultIslandName = (islandId: IslandId): string => {
  const suffix = islandId.replace('ilha', '');
  return `Ilha ${suffix}`;
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
    const idSet = new Set<IslandId>();

    rows.forEach((row) => {
      if (!isValidIslandId(row.island_key)) return;
      idSet.add(row.island_key);
      const title = normalizeName(row.title);
      if (title) {
        names[row.island_key] = title;
      }
    });

    if (!idSet.has('ilha1')) {
      idSet.add('ilha1');
    }

    const ids = ISLAND_IDS.filter((id) => idSet.has(id));

    return NextResponse.json({ ids, names }, { status: 200 });
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
    const ids = body?.ids;
    const idsList = Array.isArray(ids) ? (ids as IslandId[]) : [];
    const sanitizedIds = idsList.filter((id) => isValidIslandId(id));
    const idsFromNames = names && typeof names === 'object' ? Object.keys(names) : [];
    const nameIds = idsFromNames.filter((id) => isValidIslandId(id)) as IslandId[];
    const activeIdsRaw = sanitizedIds.length > 0 ? sanitizedIds : nameIds;
    const activeIds = Array.from(new Set(activeIdsRaw));
    const orderedIds = ISLAND_IDS.filter((id) => activeIds.includes(id));

    if (orderedIds.length === 0) {
      return NextResponse.json({ error: 'Dados invalidos para ilhas' }, { status: 400 });
    }

    const nextNames: Partial<Record<IslandId, string>> = {};

    await Promise.all(
      orderedIds.map((islandKey) => {
        const title = normalizeName((names as Record<string, unknown> | undefined)?.[islandKey]);
        const resolvedName = title ?? defaultIslandName(islandKey);
        nextNames[islandKey] = resolvedName;
        return saveIsland(userId, islandKey, {
          titulo: resolvedName,
        });
      })
    );

    return NextResponse.json({ ids: orderedIds, names: nextNames }, { status: 200 });
  } catch (error) {
    console.error('Erro ao salvar ilhas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
