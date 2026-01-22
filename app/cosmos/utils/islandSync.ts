'use client';

import type { IslandId, IslandNames } from '@/app/cosmos/utils/islandNames';
import type { OutboxChange } from '@/app/cosmos/utils/syncOutbox';
import {
  addOutboxChange,
  getMeta,
  listOutboxChanges,
  removeOutboxChange,
  setMeta,
  updateOutboxChangeStatus,
} from '@/app/cosmos/utils/syncOutbox';

export type SyncIslandPayload = {
  title: string | null;
};

export type SyncIslandItem = {
  id: IslandId;
  version: number;
  updatedAt: string;
  deletedAt: string | null;
  payload: SyncIslandPayload;
};

type PushResponse = {
  applied: Array<{ id: IslandId; version: number; updatedAt: string; clientChangeId: string }>;
  conflicts: Array<{ id: IslandId; clientChangeId: string; server: any; client: any }>;
};

const cursorKey = (userId: string | number) => `sync_cursor:island:${userId}`;

export const enqueueIslandChange = async (
  change: Omit<OutboxChange<SyncIslandPayload>, 'createdAt'>
) => {
  await addOutboxChange({
    ...change,
    createdAt: new Date().toISOString(),
    status: 'pending',
  });
};

export const pushIslandChanges = async (): Promise<PushResponse | null> => {
  const changes = await listOutboxChanges<SyncIslandPayload>('island', 50);
  if (!changes.length) return null;

  const response = await fetch('/api/islands/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ changes }),
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar mudanças de ilhas');
  }

  const data = (await response.json()) as PushResponse;
  await Promise.all(data.applied.map((item) => removeOutboxChange(item.clientChangeId)));
  await Promise.all(
    data.conflicts.map((item) => updateOutboxChangeStatus(item.clientChangeId, 'conflict'))
  );
  return data;
};

export const pullIslandChanges = async (
  userId: string | number,
  forceFromStart = false
): Promise<{ items: SyncIslandItem[]; cursor: number | null }> => {
  const cursor = forceFromStart ? 0 : ((await getMeta<number>(cursorKey(userId))) ?? 0);
  const response = await fetch(`/api/islands/sync?cursor=${cursor}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Falha ao buscar mudanças de ilhas');
  }
  const data = (await response.json()) as { items: SyncIslandItem[]; cursor: number | null };
  if (typeof data.cursor === 'number') {
    await setMeta(cursorKey(userId), data.cursor);
  }
  return data;
};

export const buildIslandPayload = (name: string | undefined | null): SyncIslandPayload => ({
  title: typeof name === 'string' && name.trim() ? name.trim() : null,
});

export const mapIslandNames = (names: IslandNames, islandId: IslandId): string =>
  names[islandId] ?? '';
