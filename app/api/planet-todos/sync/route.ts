import { NextRequest, NextResponse } from 'next/server';
import { getTokenPayload, validateToken } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

type SyncTodoPayload = {
  content?: string | null;
  completed?: boolean | null;
  depth?: number | null;
  inputType?: string | null;
  category?: string | null;
  dueDate?: string | null;
  islandId?: string | null;
  phase?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type SyncTodoChange = {
  clientChangeId: string;
  entityId: string;
  deviceId?: string | null;
  baseVersion?: number | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  payload?: SyncTodoPayload;
};

const parseTimestamp = (value?: string | null) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

const normalizeInputType = (value?: string | null) =>
  value === 'text' || value === 'checkbox' ? value : 'checkbox';

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
      SELECT id, entity_id
      FROM sync_changes
      WHERE user_id = ${userId}
        AND entity_type = 'planet_todo'
        AND id > ${cursor}
      ORDER BY id ASC
      LIMIT 200
    `) as { id: number; entity_id: string }[];

    if (!changes.length) {
      return NextResponse.json({ items: [], cursor }, { status: 200 });
    }

    const todoIds = Array.from(new Set(changes.map((change) => change.entity_id)));
    const rows = (await db`
      SELECT
        todo_id,
        content,
        completed,
        depth,
        input_type,
        category,
        due_date,
        island_id,
        phase,
        created_at,
        updated_at,
        deleted_at,
        version
      FROM planet_todos
      WHERE user_id = ${userId}
        AND todo_id = ANY(${todoIds})
    `) as any[];

    const items = rows.map((row) => ({
      id: row.todo_id,
      version: Number(row.version),
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
      deletedAt: row.deleted_at ? (row.deleted_at instanceof Date ? row.deleted_at.toISOString() : row.deleted_at) : null,
      payload: {
        content: row.content,
        completed: row.completed,
        depth: row.depth,
        inputType: row.input_type,
        category: row.category ?? null,
        dueDate:
          row.due_date instanceof Date
            ? row.due_date.toISOString().slice(0, 10)
            : typeof row.due_date === 'string'
              ? row.due_date.slice(0, 10)
              : null,
        islandId: row.island_id ?? null,
        phase: row.phase ?? null,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
      },
    }));

    const nextCursor = changes[changes.length - 1]?.id ?? cursor;
    return NextResponse.json({ items, cursor: nextCursor }, { status: 200 });
  } catch (error) {
    logger.error('Erro ao buscar sync de tarefas do Planeta', error);
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
    const changes = Array.isArray(body?.changes) ? (body.changes as SyncTodoChange[]) : [];
    if (!changes.length) {
      return NextResponse.json({ applied: [], conflicts: [] }, { status: 200 });
    }

    const db = getDb();
    const applied: Array<{ id: string; version: number; updatedAt: string; clientChangeId: string }> = [];
    const conflicts: Array<{ id: string; clientChangeId: string; server: any; client: any }> = [];

    for (const change of changes) {
      const clientChangeId = change.clientChangeId;
      if (!clientChangeId || !change.entityId) {
        continue;
      }

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
          SELECT todo_id, updated_at, version
          FROM planet_todos
          WHERE user_id = ${userId}
            AND todo_id = ${change.entityId}
          LIMIT 1
        `) as any[];
        if (row.length) {
          applied.push({
            id: row[0].todo_id,
            version: Number(row[0].version),
            updatedAt: row[0].updated_at instanceof Date ? row[0].updated_at.toISOString() : row[0].updated_at,
            clientChangeId,
          });
        }
        continue;
      }

      const existingRows = (await db`
        SELECT
          todo_id,
          content,
          completed,
          depth,
          input_type,
          category,
          due_date,
          island_id,
          phase,
          created_at,
          updated_at,
          deleted_at,
          version
        FROM planet_todos
        WHERE user_id = ${userId}
          AND todo_id = ${change.entityId}
        LIMIT 1
      `) as any[];

      const existing = existingRows[0];
      const baseVersion = typeof change.baseVersion === 'number' ? change.baseVersion : null;
      if (existing && baseVersion && baseVersion !== Number(existing.version)) {
        conflicts.push({
          id: change.entityId,
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
            id: change.entityId,
            clientChangeId,
            server: existing,
            client: change,
          });
          continue;
        }
      }

      const payload = change.payload ?? {};
      const now = new Date();
      const nextVersion = existing ? Number(existing.version) + 1 : 1;
      const deletedAt = change.deletedAt ? now : null;
      const createdAt = existing
        ? existing.created_at
        : parseTimestamp(payload.createdAt) ?? now;
      const inputType = payload.inputType ?? existing?.input_type ?? 'checkbox';
      const completed =
        inputType === 'checkbox' ? Boolean(payload.completed ?? existing?.completed ?? false) : false;

      if (!payload.content && !existing && !deletedAt) {
        continue;
      }

      const depth = Number.isFinite(payload.depth)
        ? Number(payload.depth)
        : Number.isFinite(existing?.depth)
          ? Number(existing.depth)
          : 0;

      await db`
        INSERT INTO planet_todos (
          user_id,
          todo_id,
          device_id,
          content,
          completed,
          depth,
          input_type,
          category,
          due_date,
          island_id,
          phase,
          created_at,
          updated_at,
          deleted_at,
          version
        )
        VALUES (
          ${userId},
          ${change.entityId},
          ${change.deviceId ?? null},
          ${payload.content ?? existing?.content ?? ''},
          ${completed},
          ${depth},
          ${normalizeInputType(inputType)},
          ${payload.category ?? existing?.category ?? null},
          ${payload.dueDate ?? existing?.due_date ?? null},
          ${payload.islandId ?? existing?.island_id ?? null},
          ${payload.phase ?? existing?.phase ?? null},
          ${createdAt},
          ${now},
          ${deletedAt},
          ${nextVersion}
        )
        ON CONFLICT (user_id, todo_id) DO UPDATE SET
          device_id = EXCLUDED.device_id,
          content = EXCLUDED.content,
          completed = EXCLUDED.completed,
          depth = EXCLUDED.depth,
          input_type = EXCLUDED.input_type,
          category = EXCLUDED.category,
          due_date = EXCLUDED.due_date,
          island_id = EXCLUDED.island_id,
          phase = EXCLUDED.phase,
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
          'planet_todo',
          ${change.entityId},
          ${clientChangeId},
          ${baseVersion}
        )
        ON CONFLICT DO NOTHING
      `;

      applied.push({
        id: change.entityId,
        version: nextVersion,
        updatedAt: now.toISOString(),
        clientChangeId,
      });
    }

    return NextResponse.json({ applied, conflicts }, { status: 200 });
  } catch (error) {
    logger.error('Erro ao salvar sync de tarefas do Planeta', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
