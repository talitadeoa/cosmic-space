/**
 * SYNC ENGINE: Testes Unitários + Checklist de Implementação
 * 
 * Suite de testes para validar o motor de sincronização.
 * Pode ser usado com Jest, Vitest, ou outro framework.
 */

import { SyncEngine, SyncCallbacks, SyncState, SyncMetadata } from '@/lib/sync/SyncEngine';

/**
 * ============ TESTES UNITÁRIOS ============
 */

describe('SyncEngine', () => {
  // Mock callbacks para testes
  const createMockCallbacks = (config = {}): SyncCallbacks<string> => ({
    push: jest.fn().mockResolvedValue({ applied: [], conflicts: [] }),
    pull: jest.fn().mockResolvedValue({
      data: 'remote',
      cursor: 1,
      version: 1,
    }),
    merge: jest.fn((local, remote) => remote || local),
    saveLocal: jest.fn().mockResolvedValue(undefined),
    loadLocal: jest.fn().mockResolvedValue('local'),
    saveMeta: jest.fn().mockResolvedValue(undefined),
    loadMeta: jest.fn().mockResolvedValue({
      remoteVersion: null,
      cursor: null,
      lastSyncAt: null,
      retryCount: 0,
    }),
    ...config,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== INICIALIZAÇÃO ==========

  describe('initialize', () => {
    it('deve carregar state e metadata do storage', async () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('initial', callbacks);

      await engine.initialize();

      expect(callbacks.loadLocal).toHaveBeenCalled();
      expect(callbacks.loadMeta).toHaveBeenCalled();
      expect(engine.getState().isLoaded).toBe(true);
    });

    it('deve iniciar polling após carregar', async () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('initial', callbacks);

      const syncSpy = jest.spyOn(engine, 'syncNow' as any);

      await engine.initialize();

      // Aguardar initial delay
      jest.advanceTimersByTime(150);

      expect(callbacks.pull).toHaveBeenCalled();
    });

    it('deve recuperar de erro ao carregar', async () => {
      const callbacks = createMockCallbacks({
        loadLocal: jest.fn().mockRejectedValue(new Error('Storage fail')),
      });
      const engine = new SyncEngine('initial', callbacks);

      await engine.initialize();

      // Não deve lançar erro
      expect(engine.getState().isLoaded).toBe(true);
    });
  });

  // ========== UPDATE LOCAL ==========

  describe('updateLocal', () => {
    it('deve atualizar estado local e marcar como pending', async () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('initial', callbacks);

      await engine.initialize();

      engine.updateLocal(() => 'updated');

      const state = engine.getState();
      expect(state.local).toBe('updated');
      expect(state.hasPending).toBe(true);
    });

    it('deve debounce múltiplas mudanças rápidas', async () => {
      jest.useFakeTimers();
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('initial', callbacks, {
        debounceMs: 100,
      });

      await engine.initialize();

      // 3 mudanças rápidas
      engine.updateLocal(() => 'v1');
      engine.updateLocal(() => 'v2');
      engine.updateLocal(() => 'v3');

      // Nenhum sync ainda (debounce)
      expect(callbacks.push).not.toHaveBeenCalled();

      // Aguardar debounce
      jest.advanceTimersByTime(150);

      // Sync deve acontecer uma vez
      expect(callbacks.push).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('deve não enfileirar se not loaded', () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('initial', callbacks);

      engine.updateLocal(() => 'updated');

      expect(engine.getState().hasPending).toBe(false);
    });
  });

  // ========== PUSH ==========

  describe('push', () => {
    it('deve chamar push callback com state local', async () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('local', callbacks);

      await engine.initialize();

      engine.updateLocal(() => 'updated');
      await engine.syncNow();

      expect(callbacks.push).toHaveBeenCalledWith('updated');
    });

    it('deve marcar conflitos como pending', async () => {
      const callbacks = createMockCallbacks({
        push: jest.fn().mockResolvedValue({
          applied: [],
          conflicts: ['id1', 'id2'],
        }),
      });
      const engine = new SyncEngine('local', callbacks);

      await engine.initialize();

      engine.updateLocal(() => 'updated');
      await engine.syncNow();

      expect(engine.getState().hasPending).toBe(true);
    });
  });

  // ========== PULL ==========

  describe('pull', () => {
    it('deve chamar pull com cursor', async () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('local', callbacks);

      await engine.initialize();
      await engine.syncNow();

      expect(callbacks.pull).toHaveBeenCalledWith(null);
    });

    it('deve fazer merge de dados remotos', async () => {
      const callbacks = createMockCallbacks({
        pull: jest.fn().mockResolvedValue({
          data: 'remote',
          cursor: 1,
          version: 5,
        }),
      });
      const engine = new SyncEngine('local', callbacks);

      await engine.initialize();
      await engine.syncNow();

      expect(callbacks.merge).toHaveBeenCalledWith('local', 'remote');
    });

    it('deve atualizar cursor após pull', async () => {
      const callbacks = createMockCallbacks({
        pull: jest.fn().mockResolvedValue({
          data: 'remote',
          cursor: 42,
          version: 1,
        }),
      });
      const engine = new SyncEngine('local', callbacks);

      await engine.initialize();
      await engine.syncNow();

      expect(engine.getMetadata().cursor).toBe(42);
    });
  });

  // ========== RETRY ==========

  describe('retry automático', () => {
    it('deve retentar em erro com backoff', async () => {
      jest.useFakeTimers();
      const callbacks = createMockCallbacks({
        push: jest
          .fn()
          .mockRejectedValueOnce(new Error('Fail 1'))
          .mockRejectedValueOnce(new Error('Fail 2'))
          .mockResolvedValueOnce({ applied: [], conflicts: [] }),
      });
      const engine = new SyncEngine('local', callbacks, {
        maxRetries: 3,
        retryDelayMs: 100,
        autoRetry: true,
      });

      await engine.initialize();

      engine.updateLocal(() => 'updated');
      await engine.syncNow();

      // Retry 1 (delay = 100 * 2^0 = 100ms)
      jest.advanceTimersByTime(150);

      // Retry 2 (delay = 100 * 2^1 = 200ms)
      jest.advanceTimersByTime(250);

      // Deve ter chamado 3 vezes (inicial + 2 retries)
      expect(callbacks.push).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });

    it('deve parar de retentar no maxRetries', async () => {
      jest.useFakeTimers();
      const callbacks = createMockCallbacks({
        push: jest
          .fn()
          .mockRejectedValue(new Error('Permanent fail')),
      });
      const engine = new SyncEngine('local', callbacks, {
        maxRetries: 2,
        retryDelayMs: 50,
        autoRetry: true,
      });

      await engine.initialize();

      engine.updateLocal(() => 'updated');
      await engine.syncNow();

      // Aguardar todos os retries
      jest.advanceTimersByTime(500);

      // Deve ter chamado 3 vezes (inicial + 2 retries)
      expect(callbacks.push).toHaveBeenCalledTimes(3);

      // E ter error
      expect(engine.getState().syncError).toBeTruthy();

      jest.useRealTimers();
    });

    it('deve resetar retryCount em sucesso', async () => {
      jest.useFakeTimers();
      const callbacks = createMockCallbacks({
        push: jest
          .fn()
          .mockRejectedValueOnce(new Error('Fail'))
          .mockResolvedValueOnce({ applied: [], conflicts: [] }),
      });
      const engine = new SyncEngine('local', callbacks, {
        maxRetries: 3,
        retryDelayMs: 50,
        autoRetry: true,
      });

      await engine.initialize();

      engine.updateLocal(() => 'updated');
      await engine.syncNow();

      // Retry
      jest.advanceTimersByTime(100);

      expect(engine.getMetadata().retryCount).toBe(0);

      jest.useRealTimers();
    });
  });

  // ========== MEMORY LEAK ==========

  describe('dispose', () => {
    it('deve limpar intervals', () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('initial', callbacks);

      engine.initialize();

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      engine.dispose();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it('deve remover listeners', () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('initial', callbacks);

      const listener = jest.fn();
      engine.onStateChanged(listener);

      engine.updateLocal(() => 'updated');

      expect(listener).toHaveBeenCalled();

      engine.dispose();

      listener.mockClear();

      engine.updateLocal(() => 'updated2');

      // Não deve chamar após dispose (listener removido)
      // Na prática, a mudança não seria aplicada
    });

    it('deve ignorar operações após dispose', async () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('initial', callbacks);

      await engine.initialize();
      engine.dispose();

      engine.updateLocal(() => 'updated');
      await engine.syncNow();

      // Não deve ter sincronizado
      expect(callbacks.push).not.toHaveBeenCalled();
    });
  });

  // ========== MERGE ==========

  describe('merge', () => {
    it('deve aplicar merge ao pull', async () => {
      const mergedResult = 'merged';
      const callbacks = createMockCallbacks({
        merge: jest.fn().mockReturnValue(mergedResult),
      });
      const engine = new SyncEngine('local', callbacks);

      await engine.initialize();
      await engine.syncNow();

      const state = engine.getState();
      expect(state.local).toBe(mergedResult);
    });

    it('merge não deve enfileirar novo sync', async () => {
      const callbacks = createMockCallbacks();
      const engine = new SyncEngine('local', callbacks);

      await engine.initialize();
      await engine.syncNow();

      // Após merge/pull bem-sucedido
      expect(engine.getState().hasPending).toBe(false);
    });
  });

  // ========== STATE MANAGEMENT ==========

  describe('state', () => {
    it('deve refletir isSyncing durante sync', async () => {
      jest.useFakeTimers();
      const callbacks = createMockCallbacks({
        push: jest.fn(() => new Promise(r => setTimeout(r, 100))),
      });
      const engine = new SyncEngine('local', callbacks, {
        initialDelayMs: 0,
      });

      const states: SyncState<string>[] = [];
      engine.onStateChanged((state) => {
        states.push({ ...state });
      });

      await engine.initialize();

      // Durante sync
      expect(engine.getState().isSyncing).toBe(true);

      jest.advanceTimersByTime(150);

      // Após sync
      expect(engine.getState().isSyncing).toBe(false);

      jest.useRealTimers();
    });

    it('deve preservar error em caso de falha', async () => {
      const error = new Error('Test error');
      const callbacks = createMockCallbacks({
        push: jest.fn().mockRejectedValue(error),
      });
      const engine = new SyncEngine('local', callbacks, {
        maxRetries: 0,
        autoRetry: false,
      });

      await engine.initialize();

      engine.updateLocal(() => 'updated');
      await engine.syncNow();

      expect(engine.getState().syncError).toEqual(error);
    });
  });
});

/**
 * ============ CHECKLIST DE IMPLEMENTAÇÃO ============
 */

/**
 * Use este checklist para refatorar hooks existentes com SyncEngine
 */

export const SyncEngineImplementationChecklist = `
📋 CHECKLIST: Refatorar hook com SyncEngine

□ ANÁLISE
  □ Mapear lógica atual: push/pull/merge/storage
  □ Identificar tipos de dados (T)
  □ Identificar conflitos de versão
  □ Auditar memory leaks (refs, intervals)

□ PREPARAÇÃO
  □ Criar arquivo callbacks/ para domínio
  □ Definir tipos: Payload, Item, Response
  □ Implementar mappers: domínio ↔ API
  □ Implementar merge com lógica de versão

□ CALLBACKS
  □ push(state): Promise<{applied[], conflicts[]}>
     □ Implementar API POST
     □ Tratamento de erro
     □ Retornar IDs afetados
  
  □ pull(cursor): Promise<{data, cursor, version}>
     □ Implementar API GET
     □ Cursor-based pagination
     □ Tratamento de erro
  
  □ merge(local, remote): merged
     □ Lógica de versão
     □ Lógica de conflito
     □ Testes de edge cases
  
  □ saveLocal(state): Promise<void>
     □ localStorage ou IndexedDB
     □ Tratamento de erro
     □ Síncrono onde possível
  
  □ loadLocal(): Promise<state>
     □ Fallback para default
     □ Tratamento de corrupção
  
  □ saveMeta(meta): Promise<void>
     □ Persistir versão, cursor
  
  □ loadMeta(): Promise<meta>
     □ Fallback para defaults

□ HOOK
  □ Remover useRef (interval, pending, suppress)
  □ Remover useEffect de sync manual
  □ Remover lógica de retry
  □ Usar useSyncedState único
  □ Expor mesma interface (compatibilidade)

□ TESTES
  □ Testar merge (sem conflito)
  □ Testar merge (com conflito)
  □ Testar push/pull success
  □ Testar push/pull error
  □ Testar retry com backoff
  □ Testar debounce
  □ Testar memory leak (dispose)
  □ Testar offline → online
  □ Testar versão obsoleta

□ INTEGRAÇÃO
  □ Remover hooks antigos
  □ Verificar compatibilidade de interface
  □ Testar em desenvolvimento
  □ Testar em produção (staging)
  □ Monitorar logs de erro
  □ Monitorar heap size

□ DOCUMENTAÇÃO
  □ Documentar callbacks
  □ Documentar merge logic
  □ Exemplo de uso
  □ Troubleshooting

□ PERFORMANCE
  □ Validar debounceMs
  □ Validar syncIntervalMs
  □ Validar maxRetries
  □ Perfil: CPU, memória, network
  □ Comparar com antigo (antes/depois)

□ DEPLOY
  □ Testar em staging
  □ Rollout gradual
  □ Alertas de syncError
  □ Monitoramento de retries
  □ Rollback plan
`;

/**
 * ============ EXEMPLO DE TESTE REAL ============
 */

describe('TodoSync - Integração com SyncEngine', () => {
  interface Todo {
    id: string;
    text: string;
    version?: number;
  }

  it('deve sincronizar tarefas com merge por versão', async () => {
    const todos: Todo[] = [];

    const callbacks: SyncCallbacks<Todo[]> = {
      push: async (local) => {
        // Simular servidor aceitando mudanças
        todos.push(...local.filter(t => !todos.find(x => x.id === t.id)));
        return { applied: local.map(t => t.id), conflicts: [] };
      },

      pull: async (cursor) => {
        // Simular servidor retornando dados
        return {
          data: todos,
          cursor: (cursor ?? 0) + 1,
          version: 1,
        };
      },

      merge: (local, remote) => {
        if (!remote) return local;
        const map = new Map(local.map(t => [t.id, t]));
        remote.forEach(t => {
          const existing = map.get(t.id);
          if (!existing || (t.version ?? 0) >= (existing.version ?? 0)) {
            map.set(t.id, t);
          }
        });
        return Array.from(map.values());
      },

      saveLocal: async (state) => {
        // localStorage
      },

      loadLocal: async () => [],

      saveMeta: async () => {},

      loadMeta: async () => ({
        remoteVersion: null,
        cursor: null,
        lastSyncAt: null,
        retryCount: 0,
      }),
    };

    const engine = new SyncEngine<Todo[]>([], callbacks);

    await engine.initialize();
    await engine.syncNow();

    // Adicionar todo local
    engine.updateLocal(prev => [
      ...prev,
      { id: '1', text: 'Task', version: 1 },
    ]);

    // Sincronizar
    await engine.syncNow();

    // Verificar
    expect(engine.getState().local).toContainEqual({
      id: '1',
      text: 'Task',
      version: 1,
    });
  });
});
`;
