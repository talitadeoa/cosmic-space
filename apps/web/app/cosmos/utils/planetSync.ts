'use client';

import type { PlanetUiState } from '@/types/planetState';
import {
  type SavedTodo,
  type OutboxChange,
  addOutboxChange,
  getMeta,
  listOutboxChanges,
  removeOutboxChange,
  setMeta,
  updateOutboxChangeStatus,
} from '@/client/storage';

export type SyncTodoPayload = {
  content: string;
  completed: boolean;
  depth: number;
  inputType: string;
  category?: string | null;
  dueDate?: string | null;
  islandId?: string | null;
  phase?: string | null;
  parentId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SyncTodoItem = {
  id: string;
  version: number;
  updatedAt: string;
  deletedAt: string | null;
  payload: SyncTodoPayload;
};

export type SyncStateItem = {
  version: number;
  updatedAt: string;
  payload: PlanetUiState;
};

type PushResponse = {
  applied: Array<{ id: string; version: number; updatedAt: string; clientChangeId: string }>;
  conflicts: Array<{ id: string; clientChangeId: string; server: any; client: any }>;
};

const cursorKey = (userId: string | number, type: 'planet_todo' | 'planet_state') =>
  `sync_cursor:${type}:${userId}`;

export const enqueueTodoChange = async (
  change: Omit<OutboxChange<SyncTodoPayload>, 'createdAt'>
) => {
  await addOutboxChange({
    ...change,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
};

export const enqueueStateChange = async (
  change: Omit<OutboxChange<PlanetUiState>, 'createdAt'>
) => {
  await addOutboxChange({
    ...change,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
};

export const pushTodoChanges = async (): Promise<PushResponse | null> => {
  const changes = await listOutboxChanges<SyncTodoPayload>('planet_todo', 50);
  if (!changes.length) return null;

  const response = await fetch('/api/planet-todos/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ changes }),
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar mudanças de tarefas');
  }

  const data = (await response.json()) as PushResponse;
  await Promise.all(
    data.applied.map((item) => removeOutboxChange(item.clientChangeId))
  );
  await Promise.all(
    data.conflicts.map((item) => updateOutboxChangeStatus(item.clientChangeId, 'conflict'))
  );
  return data;
};

export const pullTodoChanges = async (
  userId: string | number,
  forceFromStart = false
): Promise<{ items: SyncTodoItem[]; cursor: number | null }> => {
  const cursor = forceFromStart ? 0 : ((await getMeta<number>(cursorKey(userId, 'planet_todo'))) ?? 0);
  const response = await fetch(`/api/planet-todos/sync?cursor=${cursor}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar mudanças de tarefas');
  }
  const data = (await response.json()) as { items: SyncTodoItem[]; cursor: number | null };
  if (typeof data.cursor === 'number') {
    await setMeta(cursorKey(userId, 'planet_todo'), data.cursor);
  }
  return data;
};

export const pushStateChanges = async (): Promise<PushResponse | null> => {
  const changes = await listOutboxChanges<PlanetUiState>('planet_state', 20);
  if (!changes.length) return null;

  const response = await fetch('/api/planet-state/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ changes }),
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar mudanças de estado');
  }

  const data = (await response.json()) as PushResponse;
  await Promise.all(
    data.applied.map((item) => removeOutboxChange(item.clientChangeId))
  );
  await Promise.all(
    data.conflicts.map((item) => updateOutboxChangeStatus(item.clientChangeId, 'conflict'))
  );
  return data;
};

export const pullStateChanges = async (
  userId: string | number,
  forceFromStart = false
): Promise<{ item: SyncStateItem | null; cursor: number | null }> => {
  const cursor = forceFromStart ? 0 : ((await getMeta<number>(cursorKey(userId, 'planet_state'))) ?? 0);
  const response = await fetch(`/api/planet-state/sync?cursor=${cursor}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar mudanças de estado');
  }
  const data = (await response.json()) as { item: SyncStateItem | null; cursor: number | null };
  if (typeof data.cursor === 'number') {
    await setMeta(cursorKey(userId, 'planet_state'), data.cursor);
  }
  return data;
};

export const mapTodoToPayload = (todo: SavedTodo): SyncTodoPayload => ({
  content: todo.text,
  completed: Boolean(todo.completed),
  depth: Number.isFinite(todo.depth) ? Number(todo.depth) : 0,
  inputType: todo.inputType,
  category: todo.category ?? null,
  dueDate: todo.dueDate ?? null,
  islandId: todo.islandId ?? null,
  phase: todo.phase ?? null,
  parentId: todo.parentId ?? null,
  createdAt: todo.createdAt ?? null,
  updatedAt: todo.updatedAt ?? null,
});
