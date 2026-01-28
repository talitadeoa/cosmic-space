import { NextRequest, NextResponse } from 'next/server';
import { getTokenPayload, validateToken } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ISLAND_IDS, isValidIslandId, type IslandId } from '@/lib/islands';

export const dynamic = 'force-dynamic';

type SyncIslandChange = {
  clientChangeId: string;
  entityId: IslandId;
  deviceId?: string | null;
  baseVersion?: number | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  payload?: {
    title?: string | null;
  };
};

const parseTimestamp = (value?: string | null) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

const normalizeTitle = (value?: string | null) => {
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
    if (!token || !(await validateToken(token))) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const tokenPayload = await getTokenPayload(token);
    const userId = tokenPayload?.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Usuario nao identificado' }, { status: 401 });
    }

    const cursorParam = request.nextUrl.searchParams.get('cursor');
    const cursor = Number.isFinite(Number(cursorParam)) ? Number(cursorParam) : 0;
    const db = getDb();

    // Sempre retorna todas as ilhas do usuário que foram modificadas após o cursor
    // Cursor é baseado na versão para sincronização simples
    const rows = (await db`
      SELECT
        island_key,
        title,
        updated_at,
        deleted_at,
        version
      FROM islands
      WHERE user_id = ${userId}
        AND version > ${cursor}
      ORDER BY version ASC
    `) as any[];

    const items = rows
      .filter((row) => isValidIslandId(row.island_key))
      .map((row) => {
        const version = row.version ? Number(row.version) : 1;
        return {
          id: row.island_key as IslandId,
          version,
          updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
          deletedAt: row.deleted_at
            ? row.deleted_at instanceof Date
              ? row.deleted_at.toISOString()
              : row.deleted_at
            : null,
          payload: {
            title: row.title ?? defaultIslandName(row.island_key),
          },
        };
      });

    const nextCursor = items.length > 0 ? Math.max(...items.map(i => i.version)) : cursor;
    return NextResponse.json({ items, cursor: nextCursor }, { status: 200 });
  } catch (error) {
    logger.error('Erro ao buscar sync de ilhas', error);
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
    const changes = Array.isArray(body?.changes) ? (body.changes as SyncIslandChange[]) : [];
    if (!changes.length) {
      return NextResponse.json({ applied: [], conflicts: [] }, { status: 200 });
    }

    const db = getDb();
    const applied: Array<{ id: IslandId; version: number; updatedAt: string; clientChangeId: string }> = [];
    const conflicts: Array<{ id: IslandId; clientChangeId: string; server: any; client: any }> = [];

    for (const change of changes) {
      if (!change.clientChangeId || !isValidIslandId(change.entityId)) {
        continue;
      }

      const existingChange = (await db`
        SELECT id
        FROM sync_changes
        WHERE user_id = ${userId}
          AND device_id = ${change.deviceId ?? 'unknown'}
          AND change_id = ${change.clientChangeId}
        LIMIT 1
      `) as any[];

      if (existingChange.length) {
        const row = (await db`
          SELECT updated_at, version
          FROM islands
          WHERE user_id = ${userId}
            AND island_key = ${change.entityId}
          LIMIT 1
        `) as any[];
        if (row.length) {
          applied.push({
            id: change.entityId,
            version: Number(row[0].version),
            updatedAt: row[0].updated_at instanceof Date ? row[0].updated_at.toISOString() : row[0].updated_at,
            clientChangeId: change.clientChangeId,
          });
        }
        continue;
      }

      const existingRows = (await db`
        SELECT
          island_key,
          title,
          updated_at,
          deleted_at,
          version
        FROM islands
        WHERE user_id = ${userId}
          AND island_key = ${change.entityId}
        LIMIT 1
      `) as any[];

      const existing = existingRows[0];
      const baseVersion = typeof change.baseVersion === 'number' ? change.baseVersion : null;
      const existingVersion = existing ? Number(existing.version) : null;

      // Conflict apenas se existir no servidor com version válida e baseVersion não bate
      if (existing && existingVersion && existingVersion > 0 && baseVersion !== null && baseVersion !== existingVersion) {
        conflicts.push({
          id: change.entityId,
          clientChangeId: change.clientChangeId,
          server: existing,
          client: change,
        });
        continue;
      }

      // Se não tem baseVersion mas existe com version válida, comparar timestamps
      if (!baseVersion && existingVersion && existingVersion > 0) {
        const incomingUpdated = parseTimestamp(change.updatedAt);
        const existingUpdated = existing.updated_at instanceof Date
          ? existing.updated_at
          : parseTimestamp(existing.updated_at);
        if (incomingUpdated && existingUpdated && incomingUpdated < existingUpdated) {
          conflicts.push({
            id: change.entityId,
            clientChangeId: change.clientChangeId,
            server: existing,
            client: change,
          });
          continue;
        }
      }

      const title = normalizeTitle(change.payload?.title) ?? defaultIslandName(change.entityId);
      const now = new Date();
      const nextVersion = existingVersion && existingVersion > 0 ? existingVersion + 1 : 1;
      const deletedAt = change.deletedAt ? now : null;

      await db`
        INSERT INTO islands (
          user_id,
          island_key,
          title,
          device_id,
          updated_at,
          deleted_at,
          version
        )
        VALUES (
          ${userId},
          ${change.entityId},
          ${title},
          ${change.deviceId ?? null},
          ${now},
          ${deletedAt},
          ${nextVersion}
        )
        ON CONFLICT (user_id, island_key) DO UPDATE SET
          title = EXCLUDED.title,
          device_id = EXCLUDED.device_id,
          updated_at = EXCLUDED.updated_at,
          deleted_at = EXCLUDED.deleted_at,
          version = ${nextVersion}
      `;

      await db`
        INSERT INTO sync_changes (
          user_id,
          device_id,
          entity_type,
          entity_id,
          change_id,
          base_version
        )
        VALUES (
          ${userId},
          ${change.deviceId ?? 'unknown'},
          'island',
          ${change.entityId},
          ${change.clientChangeId},
          ${baseVersion}
        )
        ON CONFLICT DO NOTHING
      `;

      applied.push({
        id: change.entityId,
        version: nextVersion,
        updatedAt: now.toISOString(),
        clientChangeId: change.clientChangeId,
      });
    }

    if (!applied.length) {
      const requiredIsland = ISLAND_IDS[0];
      if (requiredIsland) {
        await db`
          INSERT INTO islands (user_id, island_key, title)
          VALUES (${userId}, ${requiredIsland}, ${defaultIslandName(requiredIsland)})
          ON CONFLICT (user_id, island_key) DO NOTHING
        `;
      }
    }

    return NextResponse.json({ applied, conflicts }, { status: 200 });
  } catch (error) {
    logger.error('Erro ao salvar sync de ilhas', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
