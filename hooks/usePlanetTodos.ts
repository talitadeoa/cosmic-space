'use client';

import { useEffect, useRef, useState } from 'react';
import { loadSavedTodos, saveSavedTodos, type SavedTodo } from '@/app/cosmos/utils/todoStorage';
import { useAuth } from '@/hooks/useAuth';

const SAVE_DEBOUNCE_MS = 800;

export const usePlanetTodos = () => {
  const [todos, setTodos] = useState<SavedTodo[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHydrateRef = useRef(false);

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

    return () => {
      isMounted = false;
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
