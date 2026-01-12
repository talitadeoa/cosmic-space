# ❓ FAQ Técnico: SyncEngine

Perguntas e respostas técnicas sobre a implementação e uso.

## 🎯 Perguntas Frequentes

### 1. Por que SyncEngine em vez de biblioteca de sync existente?

**P: Existe Redux, MobX, Zustand, RxJS... por que criar novo?**

R: Avaliamos:
- Redux: Overkill (actions/reducers/middleware)
- MobX: Reatividade complexa para sync simples
- Zustand: Bom para estado local, não tem retry/debounce built-in
- RxJS: Curva de aprendizado (5-10 padrões a dominar)

SyncEngine é:
- Específico para sync (sucinto)
- Sem curva de aprendizado
- Push/pull/merge explícito
- Agnóstico (qualquer T)
- Testável (puro TS)

**Tamanho:** 350 linhas vs 1000+ líneas de biblioteca

---

### 2. Como lidar com dados muito grandes?

**P: E se tiver 10.000 tarefas? Push/pull vai ficar lento?**

R: Estratégias:

```typescript
// 1. Paginar pull (já faz)
pull: async (cursor) => {
  const PAGE_SIZE = 100;
  const response = await fetch(
    `/api/todos?cursor=${cursor}&limit=${PAGE_SIZE}`
  );
  return response.json();
};

// 2. Filtrar antes de push (domínio decide)
push: async (todos) => {
  const changed = todos.filter(t => t.version === null);
  // Enviar só mudanças
  return fetch('/api/todos/sync', {
    body: JSON.stringify({ changed })
  });
};

// 3. Debounce + batching
const callbacks = {
  push: async (todos) => {
    // Agrupar por tipo de mudança
    const creates = todos.filter(t => !t.id);
    const updates = todos.filter(t => t.id && t.changed);
    // Enviar separadamente ou em batch
  }
};

// 4. Usar compression no header
push: async (todos) => {
  const compressed = gzip(JSON.stringify(todos));
  return fetch('/api/todos/sync', {
    headers: { 'Content-Encoding': 'gzip' },
    body: compressed
  });
};
```

---

### 3. Como fazer merge de arrays com muitos itens?

**P: Merge é O(n²)? Vai ficar lento?**

R: Atual está O(n):

```typescript
merge: (local, remote) => {
  const map = new Map(local.map(t => [t.id, t]));  // O(n)
  remote.forEach(t => {                            // O(m)
    map.set(t.id, t);                              // O(1)
  });
  return Array.from(map.values());                 // O(n+m)
}
// Total: O(n+m), não O(n²)
```

Se performance for problema:
```typescript
merge: (local, remote) => {
  // Usar Set para IDs
  const remoteIds = new Set(remote.map(t => t.id));
  
  // Apenas remover deleted
  const filtered = local.filter(t => !remoteIds.has(t.id));
  
  // Concatenar
  return [...filtered, ...remote];
};
```

---

### 4. Como garantir order-guarantee no push?

**P: Se enviar 3 mudanças, precisa chegar em ordem?**

R: Depende:

```typescript
// Opção 1: Enviar sequencial
push: async (todos) => {
  for (const todo of todos) {
    await fetch('/api/todos/sync', {
      body: JSON.stringify({ todo })
    });
  }
};

// Opção 2: Enviar com versionning
push: async (todos) => {
  let version = lastVersion;
  for (const todo of todos) {
    await fetch('/api/todos/sync', {
      body: JSON.stringify({
        todo,
        version: ++version,  // Incrementar
      })
    });
  }
};

// Opção 3: Confiar no servidor
push: async (todos) => {
  // Servidor aplica em order recebido
  return fetch('/api/todos/sync', {
    body: JSON.stringify({ todos })  // Array
  });
};
```

---

### 5. Como lidar com timeout no servidor?

**P: Se o servidor demorar 30s, como lidar?**

R: Implementar timeout + retry:

```typescript
const withTimeout = async (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([promise, timeout]);
};

const callbacks = {
  push: async (todos) => {
    try {
      const response = await withTimeout(
        fetch('/api/todos/sync', {...}),
        5000  // 5s timeout
      );
      return response.json();
    } catch (error) {
      if (error.message === 'Timeout') {
        // Engine vai fazer retry automático com backoff
        throw error;
      }
    }
  }
};
```

---

### 6. Como fazer sync com múltiplos backends?

**P: E se tiver dados replicados em 3 servidores?**

R: Usar callbacks para coordenar:

```typescript
const callbacks = {
  push: async (todos) => {
    const results = await Promise.allSettled([
      fetch('https://server1.com/sync', {...}),
      fetch('https://server2.com/sync', {...}),
      fetch('https://server3.com/sync', {...}),
    ]);

    const applied = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value.applied)
      .flat();

    return { applied, conflicts: [] };
  },

  pull: async (cursor) => {
    // Pull de todos, fazer merge
    const responses = await Promise.all([
      fetch('https://server1.com/sync?cursor=' + cursor),
      fetch('https://server2.com/sync?cursor=' + cursor),
      fetch('https://server3.com/sync?cursor=' + cursor),
    ]);

    const items = responses.flatMap(r => r.items);
    return {
      data: items,
      cursor: Math.max(...responses.map(r => r.cursor)),
      version: Math.max(...responses.map(r => r.version)),
    };
  }
};
```

---

### 7. Como fazer offline-first com IndexedDB?

**P: Quer persistir tudo em IndexedDB, não só localStorage?**

R: Customizar storage callbacks:

```typescript
const idbStore = {
  async get(key) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['store']);
      const store = tx.objectStore('store');
      const req = store.get(key);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result?.value);
    });
  },

  async set(key, value) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['store'], 'readwrite');
      const store = tx.objectStore('store');
      const req = store.put({ key, value });
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  },
};

const callbacks = {
  saveLocal: (todos) => idbStore.set('todos', todos),
  loadLocal: () => idbStore.get('todos'),
  saveMeta: (meta) => idbStore.set('todos:meta', meta),
  loadMeta: () => idbStore.get('todos:meta'),
  // ... push, pull, merge
};
```

---

### 8. Como detectar dados stale?

**P: Como saber se dados locais ficaram muito antigos?**

R: Usar metadados:

```typescript
const callbacks = {
  pull: async (cursor) => {
    const response = await fetch(`/api/todos?cursor=${cursor}`);
    const data = await response.json();
    
    return {
      data,
      cursor: data.cursor,
      version: data.version,
      // Novo! Timestamp do servidor
      serverTime: new Date(response.headers.get('Date')).getTime(),
    };
  },
};

// No componente:
const { state } = useSyncedState(...);
const metadata = state.debug().metadata;

// Verificar idade
const ageMs = Date.now() - new Date(metadata.lastSyncAt).getTime();
if (ageMs > 3600000) {  // 1 hora
  console.warn('Dados locais ficaram stale!');
}
```

---

### 9. Como fazer A/B testing de merge strategy?

**P: Quer testar 2 estratégias de merge?**

R: Factory para callbacks:

```typescript
const createCallbacks = (strategy = 'version-based') => {
  const mergeStrategies = {
    'version-based': (local, remote) => {
      // Implementação atual
    },
    'last-write-wins': (local, remote) => {
      // Remote sempre ganha
      return remote || local;
    },
    'first-write-wins': (local, remote) => {
      // Local sempre ganha
      return local;
    },
  };

  return {
    merge: mergeStrategies[strategy] || mergeStrategies['version-based'],
    // ... outros callbacks
  };
};

// Usar:
const callbacks = createCallbacks(
  localStorage.getItem('merge_strategy') || 'version-based'
);
```

---

### 10. Como fazer migration de dados?

**P: Quer mudar formato de dados e sincronizar?**

R: Fazer migrate em callbacks:

```typescript
const migrate = (old) => {
  if (typeof old.todo === 'string') {
    // Novo formato
    return {
      id: old.id,
      text: old.todo,  // Renomear
      version: old.v ?? 1,  // Normalizar
    };
  }
  return old;
};

const callbacks = {
  loadLocal: async () => {
    const stored = localStorage.getItem('todos');
    const todos = stored ? JSON.parse(stored) : [];
    return todos.map(migrate);  // Migrar ao carregar
  },

  push: async (todos) => {
    // Enviar já migrado
    return fetch('/api/todos/sync', {
      body: JSON.stringify({
        todos: todos.map(t => ({...t}))  // Já está migrado
      })
    });
  },
};
```

---

### 11. Como fazer logging detalhado?

**P: Quer ver exatamente o que tá acontecendo?**

R: Decorator para callbacks:

```typescript
const withLogging = (callbacks) => ({
  push: async (todos) => {
    console.log('[PUSH] Enviando', todos.length, 'tarefas');
    const result = await callbacks.push(todos);
    console.log('[PUSH] ✅ Resultado:', result);
    return result;
  },

  pull: async (cursor) => {
    console.log('[PULL] Buscando a partir de cursor:', cursor);
    const result = await callbacks.pull(cursor);
    console.log('[PULL] ✅ Recebido', result.data?.length, 'itens');
    return result;
  },

  merge: (local, remote) => {
    console.log('[MERGE] Local:', local.length, 'Remote:', remote?.length);
    const result = callbacks.merge(local, remote);
    console.log('[MERGE] ✅ Resultado:', result.length);
    return result;
  },

  // ... outros
});

// Usar:
const callbacks = withLogging(createTodoCallbacks());
const synced = useSyncedState('todos', [], callbacks);
```

---

### 12. Como fazer health check?

**P: Como saber se sync está funcionando?**

R: Monitorar estado:

```typescript
function useHealthCheck() {
  const { state, debug } = useSyncedState(...);

  const health = {
    isHealthy: !state.syncError && state.isLoaded,
    lastSync: debug().metadata.lastSyncAt,
    pending: state.hasPending,
    error: state.syncError?.message,
  };

  // Enviar para analytics
  if (!health.isHealthy) {
    sendToSentry({
      message: 'Sync unhealthy',
      extra: health,
    });
  }

  return health;
}
```

---

### 13. Qual é o overhead de memory?

**P: Quanto de memória o SyncEngine usa?**

R: Minimal:

```
SyncEngine instance: ~2KB (références)
State<T>: sizeof(T) + ~500B overhead
Metadata: ~100B
Callbacks: funções (references)
Listeners: 1 função por listener

Exemplo com 100 tarefas:
- 100 * 200B (todo) = 20KB
- Engine overhead: 2KB
- Metadados: 0.1KB
- Total: ~22KB

vs 100 * 1MB (image): 100MB
→ SyncEngine é negligenciável
```

---

### 14. Como fazer backup before sync?

**P: Quer backup antes de sincronizar?**

R: Snapshot em callbacks:

```typescript
const callbacks = {
  push: async (todos) => {
    // Fazer backup
    const backup = {
      todos,
      timestamp: Date.now(),
      backup_id: crypto.randomUUID(),
    };
    await idb.backups.put(backup);

    // Tentar push
    try {
      const result = await fetch('/api/todos/sync', {
        body: JSON.stringify({ todos })
      });
      
      if (!result.ok) {
        // Restaurar se falhar
        localStorage.setItem(
          'last_failed_backup',
          JSON.stringify(backup)
        );
        throw new Error('Push failed, backup created');
      }

      return result.json();
    } catch (error) {
      throw error;  // Engine vai fazer retry
    }
  },
};
```

---

### 15. Como fazer rate limiting?

**P: Quer evitar muitas requisições em pouco tempo?**

R: Implementar circuit breaker:

```typescript
class CircuitBreaker {
  constructor(threshold = 3) {
    this.failures = 0;
    this.threshold = threshold;
    this.isOpen = false;
  }

  async call(fn) {
    if (this.isOpen) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.failures = 0;  // Reset
      return result;
    } catch (error) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.isOpen = true;
        setTimeout(() => {
          this.isOpen = false;
          this.failures = 0;
        }, 10000);  // 10s de espera
      }
      throw error;
    }
  }
}

const breaker = new CircuitBreaker();

const callbacks = {
  push: async (todos) => {
    return breaker.call(() =>
      fetch('/api/todos/sync', {
        body: JSON.stringify({ todos })
      })
    );
  },
};
```

---

## 🧪 Testes Úteis

### Teste: Retry com falha permanente

```typescript
it('deve parar de retentar em falha permanente', async () => {
  const callbacks = createMockCallbacks({
    push: jest.fn().mockRejectedValue(new Error('Server error')),
  });

  const engine = new SyncEngine('initial', callbacks, {
    maxRetries: 2,
    retryDelayMs: 50,
    autoRetry: true,
  });

  await engine.initialize();
  engine.updateLocal(() => 'updated');
  await engine.syncNow();

  jest.advanceTimersByTime(500);

  // Deve ter parado de retentar
  expect(engine.getState().syncError).toBeTruthy();
  expect(callbacks.push).toHaveBeenCalledTimes(3);  // inicial + 2 retries
});
```

### Teste: Debounce agrupa mudanças

```typescript
it('deve agrupar 100 mudanças rápidas em 1 push', async () => {
  const callbacks = createMockCallbacks();
  const engine = new SyncEngine([], callbacks, {
    debounceMs: 100,
  });

  await engine.initialize();

  // 100 mudanças rápidas
  for (let i = 0; i < 100; i++) {
    engine.updateLocal(() => [`item-${i}`]);
  }

  jest.advanceTimersByTime(200);

  // Só 1 push!
  expect(callbacks.push).toHaveBeenCalledTimes(1);
});
```

---

## 📋 Checklist de Debugging

- [ ] Verificar se `hasPending` está true
- [ ] Verificar se `syncError` tem mensagem
- [ ] Ver `isSyncing` durante operação
- [ ] Conferir storage local (localStorage)
- [ ] Conferir metadata (cursor, version)
- [ ] Testar push/pull separadamente
- [ ] Verificar merge logic
- [ ] Checar network (DevTools)
- [ ] Validar formato de dados
- [ ] Confirmar que dispose() foi chamado

---

**Última atualização:** 7 de janeiro de 2026
