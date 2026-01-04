import { NextRequest, NextResponse } from 'next/server';
import { getTokenPayload, validateToken } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logger } from '@/lib/logger';
import { normalizePlanetState } from '@/lib/planetState';

export const dynamic = 'force-dynamic';

type SyncStateChange = {
  clientChangeId: string;
  deviceId?: string | null;
  baseVersion?: number | null;
  updatedAt?: string | null;
  payload?: unknown;
};

const parseTimestamp = (value?: string | null) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
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

    const changes = (await db`
      SELECT id
      FROM sync_changes
      WHERE user_id = ${userId}
        AND entity_type = 'planet_state'
        AND id > ${cursor}
      ORDER BY id ASC
      LIMIT 1
    `) as { id: number }[];

    if (!changes.length) {
      return NextResponse.json({ item: null, cursor }, { status: 200 });
    }

    const row = (await db`
      SELECT payload, updated_at, version
      FROM planet_state
      WHERE user_id = ${userId}
      LIMIT 1
    `) as any[];

    if (!row.length) {
      const nextCursor = changes[changes.length - 1]?.id ?? cursor;
      return NextResponse.json({ item: null, cursor: nextCursor }, { status: 200 });
    }

    const item = {
      version: Number(row[0].version),
      updatedAt: row[0].updated_at instanceof Date ? row[0].updated_at.toISOString() : row[0].updated_at,
      payload: normalizePlanetState(row[0].payload ?? null),
    };
    const nextCursor = changes[changes.length - 1]?.id ?? cursor;
    return NextResponse.json({ item, cursor: nextCursor }, { status: 200 });
  } catch (error) {
    logger.error('Erro ao buscar sync de estado do Planeta', error);
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
    const changes = Array.isArray(body?.changes) ? (body.changes as SyncStateChange[]) : [];
    if (!changes.length) {
      return NextResponse.json({ applied: [], conflicts: [] }, { status: 200 });
    }

    const db = getDb();
    const applied: Array<{ id: string; version: number; updatedAt: string; clientChangeId: string }> = [];
    const conflicts: Array<{ id: string; clientChangeId: string; server: any; client: any }> = [];

    for (const change of changes) {
      const clientChangeId = change.clientChangeId;
      if (!clientChangeId) continue;

      const existingChange = (await db`
        SELECT id
        FROM sync_changes
        WHERE user_id = ${userId}
          AND device_id = ${change.deviceId ?? 'unknown'}
          AND change_id = ${clientChangeId}
        LIMIT 1
      `) as any[];

      if (existingChange.length) {
        const row = (await db`
          SELECT updated_at, version
          FROM planet_state
          WHERE user_id = ${userId}
          LIMIT 1
        `) as any[];
        if (row.length) {
          applied.push({
            id: 'planet_state',
            version: Number(row[0].version),
            updatedAt: row[0].updated_at instanceof Date ? row[0].updated_at.toISOString() : row[0].updated_at,
            clientChangeId,
          });
        }
        continue;
      }

      const existingRows = (await db`
        SELECT payload, updated_at, version
        FROM planet_state
        WHERE user_id = ${userId}
        LIMIT 1
      `) as any[];
      const existing = existingRows[0];
      const baseVersion = typeof change.baseVersion === 'number' ? change.baseVersion : null;

      if (existing && baseVersion && baseVersion !== Number(existing.version)) {
        conflicts.push({
          id: 'planet_state',
          clientChangeId,
          server: existing,
          client: change,
        });
        continue;
      }

      if (!baseVersion && existing) {
        const incomingUpdated = parseTimestamp(change.updatedAt);
        const existingUpdated = existing.updated_at instanceof Date
          ? existing.updated_at
          : parseTimestamp(existing.updated_at);
        if (incomingUpdated && existingUpdated && incomingUpdated < existingUpdated) {
          conflicts.push({
            id: 'planet_state',
            clientChangeId,
            server: existing,
            client: change,
          });
          continue;
        }
      }

      const normalized = normalizePlanetState(change.payload ?? null);
      const now = new Date();
      const nextVersion = existing ? Number(existing.version) + 1 : 1;

      await db`
        INSERT INTO planet_state (
          user_id,
          device_id,
          payload,
          updated_at,
          version
        )
        VALUES (
          ${userId},
          ${change.deviceId ?? null},
          ${normalized},
          ${now},
          ${nextVersion}
        )
        ON CONFLICT (user_id) DO UPDATE SET
          device_id = EXCLUDED.device_id,
          payload = EXCLUDED.payload,
          updated_at = EXCLUDED.updated_at,
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
          'planet_state',
          'planet_state',
          ${clientChangeId},
          ${baseVersion}
        )
        ON CONFLICT DO NOTHING
      `;

      applied.push({
        id: 'planet_state',
        version: nextVersion,
        updatedAt: now.toISOString(),
        clientChangeId,
      });
    }

    return NextResponse.json({ applied, conflicts }, { status: 200 });
  } catch (error) {
    logger.error('Erro ao salvar sync de estado do Planeta', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
