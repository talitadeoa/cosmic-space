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

  // Carregamento inicial e sincronização periódica
  useEffect(() => {
    if (loading) return;
    let isMounted = true;

    const loadTodos = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/planet-todos', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            const serverItems = Array.isArray(data?.items) ? (data.items as SavedTodo[]) : [];
            if (serverItems.length === 0) {
              const localItems = loadSavedTodos();
              if (localItems.length > 0) {
                if (isMounted) {
                  setTodos(localItems);
                }
                await fetch('/api/planet-todos', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ items: localItems }),
                });
              } else {
                if (isMounted) {
                  setTodos([]);
                }
              }
            } else {
              if (isMounted) {
                setTodos(serverItems);
              }
            }
          } else {
            if (isMounted) {
              setTodos(loadSavedTodos());
            }
          }
        } catch (error) {
          console.warn('Falha ao carregar tarefas do servidor:', error);
          if (isMounted) {
            setTodos(loadSavedTodos());
          }
        }
      } else {
        if (isMounted) {
          setTodos(loadSavedTodos());
        }
      }

      if (isMounted) {
        setHasLoaded(true);
      }
    };

    loadTodos();

    // ✅ NOVO: Sincronização periódica (polling)
    syncIntervalRef.current = setInterval(async () => {
      if (isMounted && isAuthenticated && hasLoaded) {
        try {
          const response = await fetch('/api/planet-todos', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            const serverItems = Array.isArray(data?.items) ? (data.items as SavedTodo[]) : [];
            
            // Atualiza se o servidor tem dados diferentes
            setTodos(serverItems);
          }
        } catch (error) {
          // Silenciosamente ignora erros de sincronização
          console.debug('Falha ao sincronizar tarefas:', error);
        }
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isAuthenticated, loading]);

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
