import 'server-only';
import { getDb } from './db';
import { logger } from './logger';
import { validators } from './validators';
import type { TodoInputType } from '@/types/inputs';
import type { MoonPhase } from '@/types/moon';
import type { IslandId } from '@/lib/islands';

export interface PlanetTodoRecord {
  id: string;
  text: string;
  completed: boolean;
  depth: number;
  inputType: TodoInputType;
  category?: string | null;
  dueDate?: string | null;
  islandId?: IslandId | null;
  phase?: MoonPhase | null;
  parentId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const normalizeDate = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return null;
};

const normalizeTimestamp = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return null;
};

const normalizeTodo = (input: Partial<PlanetTodoRecord>, fallbackId: string): PlanetTodoRecord => {
  const id = typeof input.id === 'string' && input.id.trim() ? input.id : fallbackId;
  const text = typeof input.text === 'string' ? input.text.trim() : '';
  const inputType = validators.todoInputType(input.inputType) ? input.inputType : 'checkbox';
  const completed = inputType === 'checkbox' ? Boolean(input.completed) : false;
  const depth = Number.isFinite(input.depth) ? Number(input.depth) : 0;
  const category = typeof input.category === 'string' && input.category.trim() ? input.category : null;
  const dueDate = normalizeDate(input.dueDate);
  const islandId = validators.islandId(input.islandId) ? input.islandId : null;
  const phase = validators.moonPhase(input.phase) ? input.phase : null;
  const parentId = typeof input.parentId === 'string' && input.parentId.trim() ? input.parentId : null;
  const createdAt = normalizeTimestamp(input.createdAt);
  const updatedAt = normalizeTimestamp(input.updatedAt ?? input.createdAt);

  return {
    id,
    text,
    completed,
    depth,
    inputType,
    category,
    dueDate,
    islandId,
    phase,
    parentId,
    createdAt,
    updatedAt,
  };
};

export async function listPlanetTodos(userId: string | number): Promise<PlanetTodoRecord[]> {
  try {
    const db = getDb();
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
        parent_id,
        created_at,
        updated_at
      FROM planet_todos
      WHERE user_id = ${userId}
        AND deleted_at IS NULL
      ORDER BY updated_at DESC
    `) as any[];

    return rows.map((row, idx) =>
      normalizeTodo(
        {
          id: row.todo_id,
          text: row.content,
          completed: row.completed,
          depth: row.depth,
          inputType: row.input_type,
          category: row.category,
          dueDate: row.due_date,
          islandId: row.island_id,
          phase: row.phase,
          parentId: row.parent_id,
          createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
          updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
        },
        `todo-${idx}`
      )
    );
  } catch (error) {
    logger.error('Erro ao listar tarefas do Planeta', error);
    throw error;
  }
}

const parseTimestampMs = (value: string | null | undefined) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export async function mergePlanetTodos(
  userId: string | number,
  items: PlanetTodoRecord[]
): Promise<PlanetTodoRecord[]> {
  try {
    const db = getDb();

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
        parent_id,
        created_at,
        updated_at
      FROM planet_todos
      WHERE user_id = ${userId}
        AND deleted_at IS NULL
    `) as any[];

    const existingMap = new Map<string, PlanetTodoRecord>();
    existingRows.forEach((row, idx) => {
      const record = normalizeTodo(
        {
          id: row.todo_id,
          text: row.content,
          completed: row.completed,
          depth: row.depth,
          inputType: row.input_type,
          category: row.category,
          dueDate: row.due_date,
          islandId: row.island_id,
          phase: row.phase,
          parentId: row.parent_id,
          createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
          updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
        },
        `todo-${idx}`
      );
      existingMap.set(record.id, record);
    });

    for (const [index, item] of items.entries()) {
      const normalized = normalizeTodo(item, `todo-${index}`);
      if (!normalized.text) continue;

      const incomingTimestamp = parseTimestampMs(normalized.updatedAt ?? normalized.createdAt);
      const existing = existingMap.get(normalized.id);
      const existingTimestamp = parseTimestampMs(existing?.updatedAt ?? existing?.createdAt ?? null);

      if (existing && incomingTimestamp < existingTimestamp) {
        continue;
      }

      const createdAt = normalized.createdAt
        ? new Date(normalized.createdAt)
        : normalized.updatedAt
          ? new Date(normalized.updatedAt)
          : new Date();
      const updatedAt = normalized.updatedAt
        ? new Date(normalized.updatedAt)
        : normalized.createdAt
          ? new Date(normalized.createdAt)
          : new Date();

      await db`
        INSERT INTO planet_todos (
          user_id,
          todo_id,
          content,
          completed,
          depth,
          input_type,
          category,
          due_date,
          island_id,
          phase,
          parent_id,
          created_at,
          updated_at
        )
        VALUES (
          ${userId},
          ${normalized.id},
          ${normalized.text},
          ${normalized.completed},
          ${normalized.depth},
          ${normalized.inputType},
          ${normalized.category ?? null},
          ${normalized.dueDate ?? null},
          ${normalized.islandId ?? null},
          ${normalized.phase ?? null},
          ${normalized.parentId ?? null},
          ${createdAt},
          ${updatedAt}
        )
        ON CONFLICT (user_id, todo_id) DO UPDATE SET
          content = EXCLUDED.content,
          completed = EXCLUDED.completed,
          depth = EXCLUDED.depth,
          input_type = EXCLUDED.input_type,
          category = EXCLUDED.category,
          due_date = EXCLUDED.due_date,
          island_id = EXCLUDED.island_id,
          phase = EXCLUDED.phase,
          parent_id = EXCLUDED.parent_id,
          updated_at = EXCLUDED.updated_at
      `;
    }

    return await listPlanetTodos(userId);
  } catch (error) {
    logger.error('Erro ao salvar tarefas do Planeta', error);
    throw error;
  }
}
