'use client';

/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                       useSyncEngine - React Hook                           ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                            ║
 * ║  Hook React para integrar o SyncEngine com componentes.                    ║
 * ║  Gerencia lifecycle, re-renders otimizados e integração com auth.          ║
 * ║                                                                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SyncEngine,
  SyncCallbacks,
  SyncConfig,
  SyncState,
  createEmptyMetadata,
} from './SyncEngine';

// ============================================================================
// TYPES
// ============================================================================

export interface UseSyncEngineOptions<T> extends SyncConfig<T> {
  /**
   * Se a sincronização está habilitada (ex: usuário autenticado).
   * Quando false, o engine funciona apenas localmente.
   */
  enabled?: boolean;
  
  /**
   * Dependências que devem reiniciar o engine quando mudam.
   * Ex: userId, projectId
   */
  deps?: unknown[];
}

export interface UseSyncEngineReturn<T> {
  /** Estado local atual */
  data: T;
  
  /** Atualizar estado local (com optimistic update) */
  setData: (updater: T | ((prev: T) => T)) => void;
  
  /** Indica se os dados foram carregados do storage */
  isLoaded: boolean;
  
  /** Indica se está sincronizando agora */
  isSyncing: boolean;
  
  /** Indica se há mudanças pendentes não sincronizadas */
  hasPending: boolean;
  
  /** Erro da última sincronização */
  error: Error | null;
  
  /** Timestamp da última sincronização bem-sucedida */
  lastSyncAt: string | null;
  
  /** Forçar sincronização imediata */
  syncNow: () => Promise<void>;
  
  /** Pausar o polling */
  pause: () => void;
  
  /** Retomar o polling */
  resume: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook React para sincronização de estado local ↔ remoto.
 * 
 * @param initialState - Estado inicial (usado antes de carregar do storage)
 * @param callbacks - Funções de push/pull/merge/storage
 * @param options - Configurações do engine
 * 
 * @example
 * ```typescript
 * const { data: todos, setData, isSyncing, hasPending } = useSyncEngine(
 *   [],
 *   {
 *     push: async (todos) => pushTodoChanges(),
 *     pull: async (cursor) => pullTodoChanges(userId, cursor),
 *     merge: (local, remote) => mergeTodos(local, remote),
 *     loadLocal: () => loadSavedTodos(),
 *     saveLocal: (todos) => saveSavedTodos(todos),
 *     loadMeta: () => loadTodoMeta(),
 *     saveMeta: (meta) => saveTodoMeta(meta),
 *   },
 *   { enabled: isAuthenticated, debounceMs: 500 }
 * );
 * ```
 */
export function useSyncEngine<T>(
  initialState: T,
  callbacks: SyncCallbacks<T>,
  options: UseSyncEngineOptions<T> = {}
): UseSyncEngineReturn<T> {
  const { enabled = true, deps = [], ...config } = options;
  
  // Refs para evitar re-criação do engine
  const engineRef = useRef<SyncEngine<T> | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  
  // Estado reativo para UI
  const [state, setState] = useState<SyncState<T>>(() => ({
    local: initialState,
    remote: null,
    remoteVersion: null,
    isLoaded: false,
    isSyncing: false,
    syncError: null,
    hasPending: false,
    lastSyncAt: null,
    retryCount: 0,
  }));

  // Criar wrapper estável de callbacks
  const stableCallbacks = useMemo<SyncCallbacks<T>>(() => ({
    push: (local) => callbacksRef.current.push(local),
    pull: (cursor) => callbacksRef.current.pull(cursor),
    merge: (local, remote) => callbacksRef.current.merge(local, remote),
    saveLocal: (state) => callbacksRef.current.saveLocal(state),
    loadLocal: () => callbacksRef.current.loadLocal(),
    saveMeta: (meta) => callbacksRef.current.saveMeta(meta),
    loadMeta: () => callbacksRef.current.loadMeta(),
    onPendingChange: callbacksRef.current.onPendingChange,
    onSyncError: callbacksRef.current.onSyncError,
  }), []);

  // Inicializar/reinicializar engine
  useEffect(() => {
    // Dispose engine anterior
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    // Criar novo engine
    const engine = new SyncEngine<T>({
      ...config,
      ...stableCallbacks,
      name: config.name ?? 'useSyncEngine',
    });

    engineRef.current = engine;

    // Subscrever a mudanças de estado
    const unsubscribe = engine.subscribe((newState) => {
      setState(newState);
    });

    // Inicializar
    void engine.initialize(initialState, {
      startPolling: enabled,
      syncOnInit: enabled,
    });

    // Cleanup
    return () => {
      unsubscribe();
      engine.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  // Pausar/retomar baseado em enabled
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (enabled) {
      engine.resume();
    } else {
      engine.pause();
    }
  }, [enabled]);

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  const setData = useCallback((updater: T | ((prev: T) => T)) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (typeof updater === 'function') {
      engine.updateLocal(updater as (prev: T) => T);
    } else {
      engine.updateLocal(() => updater);
    }
  }, []);

  const syncNow = useCallback(async () => {
    const engine = engineRef.current;
    if (engine) {
      await engine.syncNow();
    }
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  return {
    data: state.local,
    setData,
    isLoaded: state.isLoaded,
    isSyncing: state.isSyncing,
    hasPending: state.hasPending,
    error: state.syncError,
    lastSyncAt: state.lastSyncAt,
    syncNow,
    pause,
    resume,
  };
}

// ============================================================================
// SELECTOR HOOK (para otimização de re-renders)
// ============================================================================

/**
 * Hook para selecionar parte do estado (evita re-renders desnecessários).
 * 
 * @example
 * ```typescript
 * const todoCount = useSyncEngineSelector(
 *   engineRef,
 *   (state) => state.local.length
 * );
 * ```
 */
export function useSyncEngineSelector<T, R>(
  engineRef: React.RefObject<SyncEngine<T> | null>,
  selector: (state: SyncState<T>) => R,
  equalityFn: (a: R, b: R) => boolean = Object.is
): R | null {
  const engine = engineRef.current;
  const [selected, setSelected] = useState<R | null>(() =>
    engine ? selector(engine.getState()) : null
  );

  useEffect(() => {
    if (!engine) return;

    let prev = selector(engine.getState());
    setSelected(prev);

    const unsubscribe = engine.subscribe((state) => {
      const next = selector(state);
      if (!equalityFn(prev, next)) {
        prev = next;
        setSelected(next);
      }
    });

    return unsubscribe;
  }, [engine, selector, equalityFn]);

  return selected;
}
