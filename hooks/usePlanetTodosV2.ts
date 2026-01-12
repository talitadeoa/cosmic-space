'use client';

/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    usePlanetTodosV2 - Usando SyncEngine                    ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                            ║
 * ║  Exemplo de hook fino usando o SyncEngine para sincronização de todos.     ║
 * ║  Demonstra como separar domínio de infraestrutura.                         ║
 * ║                                                                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { useMemo } from 'react';
import {
  loadSavedTodos,
  saveSavedTodos,
  type SavedTodo,
  isValidIsland,
  isValidPhase,
} from '@/app/cosmos/utils/todoStorage';
import { useAuth } from '@/hooks/useAuth';
import {
  pushTodoChanges,
  pullTodoChanges,
  type SyncTodoItem,
} from '@/app/cosmos/utils/planetSync';
import { useSyncEngine } from '@/lib/sync/useSyncEngine';
import type { SyncMetadata, PushResult, PullResult } from '@/lib/sync/SyncEngine';

// ============================================================================
// STORAGE HELPERS (Domínio)
// ============================================================================

const SYNC_META_KEY = 'planet_todos_sync_meta';

function loadMeta(): SyncMetadata {
  if (typeof window === 'undefined') {
    return { remoteVersion: null, cursor: null, lastSyncAt: null, retryCount: 0 };
  }
  try {
    const stored = localStorage.getItem(SYNC_META_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return { remoteVersion: null, cursor: null, lastSyncAt: null, retryCount: 0 };
}

function saveMeta(meta: SyncMetadata): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {
    // Ignore
  }
}

// ============================================================================
// MERGE LOGIC (Domínio - Last Write Wins by timestamp)
// ============================================================================

/**
 * Merge de todos locais com dados do servidor.
 * Estratégia: Last-Write-Wins baseado em updatedAt/version.
 */
function mergeTodos(localTodos: SavedTodo[], serverItems: SyncTodoItem[] | null): SavedTodo[] {
  if (!serverItems || serverItems.length === 0) {
    return localTodos;
  }

  const map = new Map(localTodos.map((todo) => [todo.id, todo]));

  serverItems.forEach((item) => {
    const local = map.get(item.id);
    const localVersion = local?.version ?? 0;
    
    // Servidor vence se versão maior ou igual
    if (item.version < localVersion) return;

    // Se deletado no servidor, remover local
    if (item.deletedAt) {
      map.delete(item.id);
      return;
    }

    // Aplicar dados do servidor
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
      createdAt: payload.createdAt ?? local?.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
      version: item.version,
    });
  });

  // Ordenar por data de atualização (mais recente primeiro)
  return Array.from(map.values()).sort((a, b) => {
    const aTime = Date.parse(a.updatedAt ?? a.createdAt ?? '') || 0;
    const bTime = Date.parse(b.updatedAt ?? b.createdAt ?? '') || 0;
    return bTime - aTime;
  });
}

// ============================================================================
// HOOK
// ============================================================================

export interface UsePlanetTodosReturn {
  /** Lista de todos */
  todos: SavedTodo[];
  
  /** Atualizar lista de todos */
  setTodos: (updater: SavedTodo[] | ((prev: SavedTodo[]) => SavedTodo[])) => void;
  
  /** Dados carregados do storage */
  hasLoaded: boolean;
  
  /** Sincronizando com servidor */
  isSyncing: boolean;
  
  /** Mudanças pendentes */
  hasPending: boolean;
  
  /** Erro de sync */
  syncError: Error | null;
  
  /** Forçar sync */
  syncNow: () => Promise<void>;
}

/**
 * Hook para gerenciar todos do Planeta com sincronização.
 * 
 * @example
 * ```typescript
 * const { todos, setTodos, hasLoaded, isSyncing } = usePlanetTodosV2();
 * 
 * // Adicionar todo (optimistic update)
 * setTodos(prev => [...prev, newTodo]);
 * 
 * // Atualizar todo
 * setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
 * 
 * // Deletar todo
 * setTodos(prev => prev.filter(t => t.id !== id));
 * ```
 */
export function usePlanetTodosV2(): UsePlanetTodosReturn {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Enabled apenas quando autenticado e carregado
  const syncEnabled = !loading && isAuthenticated && !!user?.userId;
  
  // Callbacks de sync memoizados
  const callbacks = useMemo(() => ({
    // PUSH: enviar mudanças para servidor
    push: async (_todos: SavedTodo[]): Promise<PushResult> => {
      try {
        const result = await pushTodoChanges();
        
        return {
          applied: result?.applied?.map((item) => ({
            id: item.id,
            version: item.version,
            updatedAt: item.updatedAt,
          })) ?? [],
          conflicts: result?.conflicts?.map((c) => c.id) ?? [],
        };
      } catch (error) {
        console.debug('Push todos falhou:', error);
        throw error;
      }
    },

    // PULL: buscar mudanças do servidor
    pull: async (_cursor: number | null): Promise<PullResult<SavedTodo[]>> => {
      if (!user?.userId) {
        return { data: null, cursor: null, version: 0 };
      }
      
      try {
        const result = await pullTodoChanges(user.userId);
        
        // Converter SyncTodoItem[] para SavedTodo[]
        const todos: SavedTodo[] = (result.items ?? []).map((item) => {
          const payload = item.payload;
          return {
            id: item.id,
            text: payload.content,
            completed: payload.inputType === 'checkbox' ? Boolean(payload.completed) : false,
            depth: Number.isFinite(payload.depth) ? Number(payload.depth) : 0,
            inputType: payload.inputType === 'text' ? 'text' : 'checkbox',
            category: payload.category ?? undefined,
            dueDate: payload.dueDate ?? undefined,
            islandId: isValidIsland(payload.islandId) ? payload.islandId : undefined,
            phase: isValidPhase(payload.phase) ? payload.phase : undefined,
            createdAt: payload.createdAt ?? new Date().toISOString(),
            updatedAt: item.updatedAt,
            deletedAt: item.deletedAt,
            version: item.version,
          };
        });
        
        return {
          data: todos.length > 0 ? todos : null,
          cursor: result.cursor ?? null,
          version: result.cursor ?? 0,
        };
      } catch (error) {
        console.debug('Pull todos falhou:', error);
        throw error;
      }
    },

    // MERGE: combinar local + servidor
    merge: (local: SavedTodo[], remote: SavedTodo[] | null): SavedTodo[] => {
      if (!remote || remote.length === 0) {
        return local;
      }
      return remote;
    },

    // STORAGE LOCAL
    loadLocal: (): SavedTodo[] => loadSavedTodos(),
    saveLocal: (todos: SavedTodo[]): void => saveSavedTodos(todos),
    
    // METADATA
    loadMeta: (): SyncMetadata => loadMeta(),
    saveMeta: (meta: SyncMetadata): void => saveMeta(meta),
  }), [user?.userId]);

  // Usar o SyncEngine
  const {
    data: todos,
    setData: setTodos,
    isLoaded,
    isSyncing,
    hasPending,
    error,
    syncNow,
  } = useSyncEngine<SavedTodo[]>(
    [], // Estado inicial vazio
    callbacks,
    {
      enabled: syncEnabled,
      deps: [user?.userId], // Reiniciar quando userId mudar
      name: 'PlanetTodos',
      debounceMs: 300,
      syncIntervalMs: 10000,
      maxRetries: 3,
      debug: process.env.NODE_ENV === 'development',
    }
  );

  return {
    todos,
    setTodos,
    hasLoaded: isLoaded,
    isSyncing,
    hasPending,
    syncError: error,
    syncNow,
  };
}
