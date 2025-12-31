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
  createdAt?: string | null;
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
  const createdAt = typeof input.createdAt === 'string' ? input.createdAt : null;

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
    createdAt,
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
        created_at
      FROM planet_todos
      WHERE user_id = ${userId}
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
          createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
        },
        `todo-${idx}`
      )
    );
  } catch (error) {
    logger.error('Erro ao listar tarefas do Planeta', error);
    throw error;
  }
}

export async function replacePlanetTodos(
  userId: string | number,
  items: PlanetTodoRecord[]
): Promise<void> {
  try {
    const db = getDb();

    await db`DELETE FROM planet_todos WHERE user_id = ${userId}`;

    for (const [index, item] of items.entries()) {
      const normalized = normalizeTodo(item, `todo-${index}`);
      if (!normalized.text) continue;

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
          phase
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
          ${normalized.phase ?? null}
        )
      `;
    }
  } catch (error) {
    logger.error('Erro ao salvar tarefas do Planeta', error);
    throw error;
  }
}
