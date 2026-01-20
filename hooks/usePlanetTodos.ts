'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadSavedTodos, saveSavedTodos, type SavedTodo, isValidIsland, isValidPhase } from '@/app/cosmos/utils/todoStorage';
import { useAuth } from '@/hooks/useAuth';
import { getDeviceId } from '@/app/cosmos/utils/deviceId';
import {
  enqueueTodoChange,
  mapTodoToPayload,
  pullTodoChanges,
  pushTodoChanges,
  type SyncTodoItem,
} from '@/app/cosmos/utils/planetSync';
import { listOutboxChanges } from '@/app/cosmos/utils/syncOutbox';

const SYNC_INTERVAL_MS = 10000;

const createChangeId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `change-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const todoContentEqual = (a: SavedTodo, b: SavedTodo) =>
  a.text === b.text &&
  a.completed === b.completed &&
  a.depth === b.depth &&
  a.inputType === b.inputType &&
  (a.parentId ?? null) === (b.parentId ?? null) &&
  (a.category ?? null) === (b.category ?? null) &&
  (a.dueDate ?? null) === (b.dueDate ?? null) &&
  (a.islandId ?? null) === (b.islandId ?? null) &&
  (a.phase ?? null) === (b.phase ?? null);

const applyServerTodos = (localTodos: SavedTodo[], items: SyncTodoItem[]) => {
  const map = new Map(localTodos.map((todo) => [todo.id, todo]));

  items.forEach((item) => {
      const local = map.get(item.id);
      const localVersion = local?.version ?? 0;
      if (item.version < localVersion) return;

    if (item.deletedAt) {
      map.delete(item.id);
      return;
    }

    const payload = item.payload;
      map.set(item.id, {
        id: item.id,
        text: payload.content,
        completed: payload.inputType === 'checkbox' ? Boolean(payload.completed) : false,
        depth: Number.isFinite(payload.depth) ? Number(payload.depth) : 0,
        inputType: payload.inputType === 'text' ? 'text' : 'checkbox',
        category: payload.category ?? undefined,
        dueDate: payload.dueDate ?? undefined,
        islandId: isValidIsland(payload.islandId) ? payload.islandId : undefined,
        phase: isValidPhase(payload.phase) ? payload.phase : undefined,
        parentId: local?.parentId ?? null,
        createdAt: payload.createdAt ?? local?.createdAt,
        updatedAt: item.updatedAt,
        deletedAt: item.deletedAt,
        version: item.version,
      });
  });

  return Array.from(map.values()).sort((a, b) => {
    const aTime = Date.parse(a.updatedAt ?? a.createdAt ?? '') || 0;
    const bTime = Date.parse(b.updatedAt ?? b.createdAt ?? '') || 0;
    return bTime - aTime;
  });
};

export const usePlanetTodos = () => {
  const [todos, setTodosState] = useState<SavedTodo[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isAuthenticated, loading, user } = useAuth();
  const deviceId = useMemo(() => getDeviceId(), []);
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const suppressOutboxRef = useRef(false);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setTodos = useCallback(
    (next: SavedTodo[] | ((prev: SavedTodo[]) => SavedTodo[])) => {
      setTodosState((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        if (!hasLoaded || suppressOutboxRef.current) {
          return resolved;
        }

        const prevMap = new Map(prev.map((todo) => [todo.id, todo]));
        const nextMap = new Map(resolved.map((todo) => [todo.id, todo]));
        const nowIso = new Date().toISOString();

        nextMap.forEach((todo, id) => {
          const existing = prevMap.get(id);
          if (!existing) {
            pendingIdsRef.current.add(id);
            void enqueueTodoChange({
              clientChangeId: createChangeId(),
              type: 'planet_todo',
              entityId: id,
              deviceId,
              baseVersion: todo.version ?? null,
              updatedAt: todo.updatedAt ?? nowIso,
              deletedAt: null,
              payload: mapTodoToPayload(todo),
            });
            return;
          }

          if (!todoContentEqual(existing, todo)) {
            pendingIdsRef.current.add(id);
            void enqueueTodoChange({
              clientChangeId: createChangeId(),
              type: 'planet_todo',
              entityId: id,
              deviceId,
              baseVersion: existing.version ?? null,
              updatedAt: todo.updatedAt ?? nowIso,
              deletedAt: null,
              payload: mapTodoToPayload(todo),
            });
          }
        });

        prevMap.forEach((todo, id) => {
          if (nextMap.has(id)) return;
          pendingIdsRef.current.add(id);
          void enqueueTodoChange({
            clientChangeId: createChangeId(),
            type: 'planet_todo',
            entityId: id,
            deviceId,
            baseVersion: todo.version ?? null,
            updatedAt: todo.updatedAt ?? nowIso,
            deletedAt: nowIso,
            payload: mapTodoToPayload(todo),
          });
        });

        return resolved;
      });
    },
    [deviceId, hasLoaded]
  );

  useEffect(() => {
    if (loading) return;
    const localItems = loadSavedTodos();
    setTodosState(localItems);
    setHasLoaded(true);

    if (isAuthenticated) {
      void listOutboxChanges('planet_todo', 200, true).then((items) => {
        pendingIdsRef.current = new Set(items.map((item) => item.entityId));
      });
    } else {
      pendingIdsRef.current = new Set();
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (!hasLoaded) return;
    saveSavedTodos(todos);
  }, [hasLoaded, todos]);

  useEffect(() => {
    if (!hasLoaded || !isAuthenticated || !user?.userId) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const syncTodos = async () => {
      if (!isMounted) return;
      try {
        const pushResult = await pushTodoChanges();
        if (pushResult?.applied?.length) {
          suppressOutboxRef.current = true;
          setTodosState((prev) => {
            const map = new Map(prev.map((todo) => [todo.id, todo]));
            pushResult.applied.forEach((item) => {
              const existing = map.get(item.id);
              if (!existing) return;
              map.set(item.id, {
                ...existing,
                version: item.version,
                updatedAt: item.updatedAt,
              });
              pendingIdsRef.current.delete(item.id);
            });
            return Array.from(map.values());
          });
          suppressOutboxRef.current = false;
        }
      } catch (error) {
        console.debug('Falha ao enviar tarefas:', error);
      }

      try {
        const pullResult = await pullTodoChanges(user.userId);
        if (!pullResult.items?.length) return;
        suppressOutboxRef.current = true;
        setTodosState((prev) => {
          const filteredItems = pullResult.items.filter(
            (item) => !pendingIdsRef.current.has(item.id)
          );
          return applyServerTodos(prev, filteredItems);
        });
        suppressOutboxRef.current = false;
      } catch (error) {
        console.debug('Falha ao buscar tarefas:', error);
      }
    };

    const immediateTimeoutRef = setTimeout(() => {
      syncTodos();
    }, 100);

    syncIntervalRef.current = setInterval(syncTodos, SYNC_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearTimeout(immediateTimeoutRef);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [hasLoaded, isAuthenticated, user?.userId]);

  return { todos, setTodos, hasLoaded };
};
