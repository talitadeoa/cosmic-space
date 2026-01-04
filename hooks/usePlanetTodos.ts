'use client';

import { useEffect, useRef, useState } from 'react';
import { loadSavedTodos, saveSavedTodos, type SavedTodo } from '@/app/cosmos/utils/todoStorage';
import { useAuth } from '@/hooks/useAuth';

const SAVE_DEBOUNCE_MS = 800;
const SYNC_INTERVAL_MS = 10000; // Sincroniza a cada 10 segundos

export const usePlanetTodos = () => {
  const [todos, setTodos] = useState<SavedTodo[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didHydrateRef = useRef(false);

  const getTodoTimestamp = (todo: SavedTodo) => {
    const value = todo.updatedAt ?? todo.createdAt;
    const parsed = value ? Date.parse(value) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const mergeTodos = (localTodos: SavedTodo[], serverTodos: SavedTodo[]) => {
    const merged = new Map<string, SavedTodo>();
    serverTodos.forEach((todo) => merged.set(todo.id, todo));

    localTodos.forEach((todo) => {
      const existing = merged.get(todo.id);
      if (!existing) {
        merged.set(todo.id, todo);
        return;
      }
      if (getTodoTimestamp(todo) >= getTodoTimestamp(existing)) {
        merged.set(todo.id, todo);
      }
    });

    return Array.from(merged.values()).sort(
      (a, b) => getTodoTimestamp(b) - getTodoTimestamp(a)
    );
  };

  // Carregamento inicial e sincronização periódica
  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const loadTodos = async () => {
      const localItems = loadSavedTodos();

      if (isAuthenticated) {
        try {
          const response = await fetch('/api/planet-todos', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            const serverItems = Array.isArray(data?.items) ? (data.items as SavedTodo[]) : [];
            const mergedItems = mergeTodos(localItems, serverItems);
            if (mergedItems.length > 0) {
              try {
                const syncResponse = await fetch('/api/planet-todos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ items: mergedItems }),
                });
                if (syncResponse.ok) {
                  const syncData = await syncResponse.json();
                  const syncedItems = Array.isArray(syncData?.items)
                    ? (syncData.items as SavedTodo[])
                    : mergedItems;
                  if (isMounted) {
                    setTodos(syncedItems);
                  }
                } else if (isMounted) {
                  setTodos(mergedItems);
                }
              } catch (error) {
                console.warn('Falha ao sincronizar merge inicial:', error);
                if (isMounted) {
                  setTodos(mergedItems);
                }
              }
            } else if (isMounted) {
              setTodos(serverItems);
            }
          } else {
            if (isMounted) {
              setTodos(localItems);
            }
          }
        } catch (error) {
          console.warn('Falha ao carregar tarefas do servidor:', error);
          if (isMounted) {
            setTodos(localItems);
          }
        }
      } else {
        if (isMounted) {
          setTodos(localItems);
        }
      }

      if (isMounted) {
        setHasLoaded(true);
      }
    };

    loadTodos();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, loading]);

  // ✅ NOVO: Sincronização periódica (polling) em efeito separado
  useEffect(() => {
    if (!hasLoaded || !isAuthenticated) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    let isMounted = true;

    // Função para sincronizar tarefas
    const syncTodos = async () => {
      if (!isMounted || !isAuthenticated) return;
      try {
        const response = await fetch('/api/planet-todos', { credentials: 'include' });
        if (response.ok && isMounted) {
          const data = await response.json();
          const serverItems = Array.isArray(data?.items) ? (data.items as SavedTodo[]) : [];
          setTodos((prev) => mergeTodos(prev, serverItems));
        }
      } catch (error) {
        console.debug('Falha ao sincronizar tarefas:', error);
      }
    };

    // Executar imediatamente na primeira vez (com pequeno delay para garantir que o token está pronto)
    const immediateTimeoutRef = setTimeout(() => {
      syncTodos();
    }, 100);

    // Depois, configurar polling periódico
    syncIntervalRef.current = setInterval(() => {
      syncTodos();
    }, SYNC_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearTimeout(immediateTimeoutRef);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [hasLoaded, isAuthenticated]);

  useEffect(() => {
    if (!hasLoaded) return;
    if (!didHydrateRef.current) {
      didHydrateRef.current = true;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (!isAuthenticated) {
      saveSavedTodos(todos);
      return;
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch('/api/planet-todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ items: todos }),
        });
      } catch (error) {
        console.warn('Falha ao salvar tarefas do servidor:', error);
        saveSavedTodos(todos);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasLoaded, todos, isAuthenticated]);

  return { todos, setTodos, hasLoaded };
};
