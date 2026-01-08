# 🔄 Guia Completo: Motor de Sincronização Reutilizável

> Extrair lógica repetida em `usePlanetTodos` e `usePlanetState` em um motor agnóstico e reutilizável.

## ✅ Status de Implementação

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| [lib/sync/SyncEngine.ts](../lib/sync/SyncEngine.ts) | ✅ Implementado | Motor principal de sincronização |
| [lib/sync/useSyncEngine.ts](../lib/sync/useSyncEngine.ts) | ✅ Implementado | Hook React de integração |
| [hooks/usePlanetTodosV2.ts](../hooks/usePlanetTodosV2.ts) | ✅ Implementado | Exemplo de uso com PlanetTodos |
| hooks/usePlanetStateV2.ts | ⏳ Pendente | Migrar usePlanetState |
| hooks/useGalaxySunsSyncV2.ts | ⏳ Pendente | Migrar useGalaxySunsSync |

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [API do SyncEngine](#api-do-syncengine)
3. [Fluxo de Sincronização Passo a Passo](#fluxo-de-sincronização-passo-a-passo)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Riscos Comuns e Como Evitar](#riscos-comuns-e-como-evitar)
6. [Refatoração de Hooks Existentes](#refatoração-de-hooks-existentes)

---

## 🎯 Visão Geral

### O Problema

Os hooks atuais (`usePlanetTodos`, `usePlanetState`, `useGalaxySunsSync`) repetem:

```
PROBLEMA: Duplicação de Código
└─ Sincronização de estado local ↔ remoto
   ├─ Carregar do storage
   ├─ Polling periódico (10s)
   ├─ Enfileirar mudanças no outbox
   ├─ Push (enviar mudanças)
   └─ Pull (buscar mudanças)
   
Cada hook reimplementa essa lógica com variações pequenas!
```

### A Solução

**SyncEngine**: Motor abstrato que orquestra:

```
┌─────────────────────────────────────────┐
│         SyncEngine<T>                   │
│ (agnóstico de domínio)                  │
├─────────────────────────────────────────┤
│ ✓ Gerenciar timing (polling, debounce) │
│ ✓ Coordenar push/pull                   │
│ ✓ Retry automático com backoff         │
│ ✓ Rastrear estado e metadados          │
│ ✓ Separar infraestrutura de domínio    │
└─────────────────────────────────────────┘
         ▲                    ▼
    Callbacks        Callbacks customizados
   (interface)      (implementação de domínio)
```

---

## 📚 API do SyncEngine

### Inicializar

```typescript
const engine = new SyncEngine(
  initialState,        // T
  callbacks,          // SyncCallbacks<T>
  config              // SyncConfig (opcional)
);

await engine.initialize();  // Carregar + iniciar polling
```

### Atualizar Estado

```typescript
// 1. Atualizar local e enfileirar sincronização
engine.updateLocal((prev) => ({
  ...prev,
  newField: 'value'
}));

// 2. Forçar sincronização imediata
await engine.syncNow();

// 3. Atualizar sem enfileirar (após pull bem-sucedido)
engine.updateLocalSuppressed((prev) => ({
  ...prev,
  remote: newData
}));
```

### Observar Mudanças

```typescript
const unsubscribe = engine.onStateChanged((state) => {
  console.log('Novo estado:', state);
  // {
  //   local: T,              // Estado atual
  //   remote: T | null,      // Último remote bem-sucedido
  //   remoteVersion: number, // Versão do servidor
  //   isLoaded: boolean,     // Carregado do storage
  //   isSyncing: boolean,    // Sincronizando agora
  //   syncError: Error | null,
  //   hasPending: boolean    // Tem mudanças não sincronizadas
  // }
});

// Quando não precisar mais:
unsubscribe();
```

### Limpar Recursos

```typescript
engine.dispose();
```

---

## 🔄 Fluxo de Sincronização Passo a Passo

### Fase 1: Inicialização

```
initialize()
│
├─ loadLocal() → carregar estado do localStorage
├─ loadMeta()  → carregar version/cursor/lastSyncAt
├─ emitStateChange() → {isLoaded: true, ...}
└─ startPolling() → iniciar timer
   │
   └─ setTimeout(initialDelayMs) → primeiro sync
      └─ setInterval(syncIntervalMs) → polling periódico
```

**Timeline:**
```
t=0ms     initialize() chamado
t=100ms   primeiro sync dispara (initialDelayMs)
t=10100ms próximo sync (syncIntervalMs = 10s)
t=20100ms próximo sync
...
```

### Fase 2: Atualização Local (com debounce)

```
usuário digita → updateLocal() chamado
│
├─ estado local atualizado
├─ hasPending = true
├─ emitStateChange()
└─ debounceSync()
   │
   ├─ clearTimeout (anterior)
   └─ setTimeout(debounceMs) → aguardar antes de sync
      │
      ├─ 300ms após última mudança
      └─ debounceMs expirou → syncNow()
```

**Timeline:**
```
t=0ms    user digita "A"       → updateLocal
t=1ms    user digita "B"       → updateLocal (clear timeout anterior)
t=2ms    user digita "C"       → updateLocal (clear timeout anterior)
t=302ms  nenhuma entrada → debounce expira → executeSyncCycle()
```

### Fase 3: Ciclo de Sincronização (PUSH → PULL)

```
executeSyncCycle()
│
├─ isSyncing = true
├─ emitStateChange({isSyncing: true})
│
├─ SE hasPending:
│  │
│  ├─ executePush()
│  │  ├─ push(localState)
│  │  │  └─ POST /api/todos/sync { changes }
│  │  ├─ resposta: {applied: [], conflicts: []}
│  │  └─ atualizar hasPending = conflicts.length > 0
│  │
│  └─ SE conflicts:
│     └─ enfileirar retry
│
├─ executePull()
│  ├─ pull(cursor)
│  │  └─ GET /api/todos/sync?cursor=123
│  ├─ resposta: {data, cursor, version}
│  ├─ merge(local, remote)
│  └─ updateLocalSuppressed(merged)
│
├─ SUCESSO:
│  ├─ retryCount = 0
│  ├─ syncError = null
│  ├─ lastSyncAt = now()
│  ├─ saveMeta()
│  └─ isSyncing = false
│
└─ ERRO:
   ├─ syncError = error
   ├─ SE autoRetry && retryCount < maxRetries:
   │  ├─ retryCount++
   │  └─ scheduleRetry(backoffMs)
   │     └─ setTimeout(backoffMs) → executeSyncCycle()
   │        backoff = retryDelayMs * 2^(retryCount-1)
   │        ex: 1s, 2s, 4s, 8s...
   └─ isSyncing = false
```

**Timeline com sucesso:**
```
t=0ms    executeSyncCycle() começa
t=50ms   push() completo
t=100ms  pull() completo
t=101ms  merge() completo
t=102ms  saveMeta() completo
t=103ms  isSyncing = false, emitStateChange()
```

**Timeline com erro e retry:**
```
t=0ms    executeSyncCycle() começa
t=50ms   push() falha (timeout)
         syncError = Error
         retryCount = 1
         scheduleRetry(1000ms)
t=1050ms executeSyncCycle() novamente (backoff=1s)
t=1100ms pull() falha
         syncError = Error
         retryCount = 2
         scheduleRetry(2000ms)
t=3100ms executeSyncCycle() novamente (backoff=2s)
t=3200ms sucesso!
         retryCount = 0
```

### Fase 4: Merge (Resolução de Conflito)

Responsabilidade do **domínio** (não do engine):

```typescript
merge(local: T[], remote: T[] | null): T[] {
  if (!remote) return local;

  const map = new Map(local.map(item => [item.id, item]));

  // Aplicar remoto baseado em versão
  remote.forEach(item => {
    const existing = map.get(item.id);
    if (!existing || item.version >= existing.version) {
      map.set(item.id, item);  // remote wins
    }
  });

  return Array.from(map.values());
}
```

**Cenários:**

```
Cenário 1: Sem conflito
Local:  [{id: 1, v: 2}, {id: 2, v: 1}]
Remote: [{id: 1, v: 2}, {id: 2, v: 2}, {id: 3, v: 1}]
Result: [{id: 1, v: 2}, {id: 2, v: 2}, {id: 3, v: 1}]
           ✓ Remote win (v2>v1)      ✓ Add novo

Cenário 2: Conflito (local mais recente)
Local:  [{id: 1, v: 3}]
Remote: [{id: 1, v: 2}]
Result: [{id: 1, v: 3}]
           ✓ Local keep (v3>v2)
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Sincronizar Tarefas

```typescript
// lib/sync/todoSync.ts
import { useSyncedState, createTodoSyncCallbacks } from '@/hooks/useSyncedState';

export function useTodoSync(userId: string) {
  const callbacks = createTodoSyncCallbacks(userId, `todos:${userId}`);

  return useSyncedState<TodoItem[]>(
    `todos:${userId}`,
    [],
    callbacks,
    {
      syncIntervalMs: 10000,
      debounceMs: 300,
      maxRetries: 3,
    }
  );
}
```

**Uso:**
```typescript
function TodoList() {
  const { state, setState, isSyncing, hasPending, error } = useTodoSync(userId);

  return (
    <div>
      {state.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => {
            setState(prev => {
              // Atualizar state local (enfileira sync)
              // Push será chamado em 300ms (debounce)
              // Pull será chamado logo após
            });
          }}
        />
      ))}

      {isSyncing && <p>Sincronizando...</p>}
      {hasPending && <p>Mudanças não sincronizadas</p>}
      {error && <p>Erro: {error.message}</p>}
    </div>
  );
}
```

### Exemplo 2: Sincronizar Estado UI

```typescript
// lib/sync/uiStateSync.ts
export function useUIStateSync(userId: string) {
  const callbacks: SyncCallbacks<PlanetUiState> = {
    push: async (state) => {
      const response = await fetch('/api/planet-state/sync', {
        method: 'POST',
        body: JSON.stringify({ state }),
      });
      const data = await response.json();
      return { applied: ['planet_state'], conflicts: [] };
    },

    pull: async (cursor) => {
      const response = await fetch(`/api/planet-state/sync?cursor=${cursor || 0}`);
      const data = await response.json();
      return {
        data: data.item?.payload ?? null,
        cursor: data.cursor,
        version: data.item?.version ?? 0,
      };
    },

    merge: (local, remote) => {
      // UI state: remote normalmente ganha
      // (servidor é fonte da verdade para UI)
      return remote ?? local;
    },

    saveLocal: async (state) => {
      localStorage.setItem('planet_state', JSON.stringify(state));
    },

    loadLocal: async () => {
      const stored = localStorage.getItem('planet_state');
      return stored ? JSON.parse(stored) : defaultState;
    },

    saveMeta: async (meta) => {
      localStorage.setItem('planet_state:meta', JSON.stringify(meta));
    },

    loadMeta: async () => {
      const stored = localStorage.getItem('planet_state:meta');
      return stored
        ? JSON.parse(stored)
        : { remoteVersion: null, cursor: null, lastSyncAt: null, retryCount: 0 };
    },
  };

  return useSyncedState('planet_state', defaultState, callbacks);
}
```

---

## ⚠️ Riscos Comuns e Como Evitar

### 1. Ciclos Infinitos de Sincronização

**RISCO:** Local atualiza → Push → Pull volta igual → atualiza local novamente

```
❌ PROBLEMA:
updateLocal() → setState
           ↓
         push() envia mudanças
           ↓
         pull() retorna mesma mudança
           ↓
         updateLocal() novamente  ← CICLO!
```

**✅ SOLUÇÃO:** Usar `suppressOutbox` / `updateLocalSuppressed`

```typescript
// Engine interno:
private async executePull() {
  const result = await this.callbacks.pull(...);
  
  // NÃO enfileirar novamente
  this.updateLocalSuppressed(() => merged);
  //  ↑ Não marca hasPending = true
}

// No hook de domínio:
const [suppressOutbox, setSuppressOutbox] = useState(false);

const setTodos = (next) => {
  if (suppressOutbox) {
    setTodosState(next);  // Não enfileirar
  } else {
    // Enfileirar via outbox
    enqueueTodoChange(...);
  }
};

// Antes de aplicar mudanças do servidor:
setSuppressOutbox(true);
setTodos(merged);
setSuppressOutbox(false);
```

### 2. Race Condition: Push e Pull Simultâneos

**RISCO:** Push modifica estado enquanto Pull está sendo processado

```
❌ PROBLEMA:
executeSyncCycle()
├─ push() dispara
│  └─ durante processamento...
├─ pull() dispara (não aguarda push)
│  └─ merge() usa estado local incompleto
└─ Push finaliza DEPOIS do merge
   └─ Mudanças do push perdidas!
```

**✅ SOLUÇÃO:** Engine já coordena isso!

```typescript
private async executeSyncCycle() {
  // 1. PUSH PRIMEIRO (aguarda completar)
  if (this.state.hasPending) {
    await this.executePush();  // Aguarda
  }

  // 2. PULL DEPOIS (com hasPending atualizado)
  await this.executePull();    // Aguarda

  // Nunca ocorrem simultaneamente
}
```

### 3. Perda de Mudanças Offline

**RISCO:** Usuário atualiza offline, mas app reinicia antes de sincronizar

```
❌ PROBLEMA:
Offline:
├─ updateLocal()
├─ estado no estado (React)
└─ Reload (F5)
   └─ Estado perdido! Outbox nunca sincronizou
```

**✅ SOLUÇÃO:** Persistir estado local ANTES de sincronizar

```typescript
// Engine:
public updateLocal(updater: (prev: T) => T) {
  const updated = updater(this.state.local);
  this.state.local = updated;
  this.state.hasPending = true;

  // CRÍTICO: persistir imediatamente
  await this.callbacks.saveLocal(updated);  // ← Sincronizado!
  
  this.emitStateChange();
  this.debounceSync();  // Sync vem depois
}
```

**Callbacks devem garantir:**
```typescript
saveLocal: async (todos) => {
  // 1. Persistir em storage sincronamente
  localStorage.setItem(key, JSON.stringify(todos));
  
  // 2. (Opcional) Persistir em IndexedDB para maior segurança
  await indexedDB.put(...);
},
```

### 4. Versão Obsoleta no Pull

**RISCO:** Servidor rejeitou push (conflito), pull retorna versão antiga

```
❌ PROBLEMA:
Local v3: {id: 1, text: 'A', v: 3}
Server v2: {id: 1, text: 'B', v: 2}  ← Conflito!

Push: Rejeitado (conflito)
Pull: Retorna v2
Merge: v2 < v3, local deveria win
      mas sem contexto, podemos sobrescrever
```

**✅ SOLUÇÃO:** Merge deve considerar versão

```typescript
merge: (local, remote) => {
  const map = new Map(local.map(item => [item.id, item]));

  remote.forEach(item => {
    const existing = map.get(item.id);
    const existingVer = existing?.version ?? 0;
    const incomingVer = item.version ?? 0;

    // Remote só ganha se versão >= local
    if (incomingVer >= existingVer) {
      map.set(item.id, item);
    }
    // Senão, local mantém (mais recente)
  });

  return Array.from(map.values());
},
```

### 5. Memory Leak: Listeners Não Limpos

**RISCO:** Componente unmount mas engine continua sincronizando

```
❌ PROBLEMA:
useEffect(() => {
  const engine = new SyncEngine(...);
  
  engine.onStateChanged(setState);
  
  return () => {
    // Esqueceu de dispose()!
    // Engine continua com setInterval ativo
    // Memory leak!
  };
}, []);
```

**✅ SOLUÇÃO:** Sempre chamar `dispose()`

```typescript
useEffect(() => {
  const engine = new SyncEngine(...);
  const unsubscribe = engine.onStateChanged(setState);

  return () => {
    unsubscribe();       // Remover listener
    engine.dispose();    // CRÍTICO: limpar intervals/timeouts
  };
}, []);
```

### 6. Debounce Muito Curto

**RISCO:** Usuário digitando rápido → sincroniza a cada 100ms → muitas requisições

```
❌ PROBLEMA (debounceMs: 100):
User: a, b, c, d, e, f
      ↓
      100ms → SYNC
      ↓
      100ms → SYNC
      ↓
      100ms → SYNC
      ↓
      100ms → SYNC
→ 4 sincronizações para 6 caracteres!
→ Muita carga no servidor
```

**✅ SOLUÇÃO:** Debounce maior (300-500ms é padrão)

```typescript
const config = {
  debounceMs: 300,  // ← Recomendado
  // Espera 300ms após ÚLTIMA mudança antes de sincronizar
};

// Timeline com 300ms debounce:
User: a    (t=0)
      b    (t=50)   ← clear anterior timeout
      c    (t=100)  ← clear anterior timeout
      d    (t=150)  ← clear anterior timeout
      e    (t=200)  ← clear anterior timeout
      f    (t=250)  ← clear anterior timeout
           (t=550)  ← 300ms após última → SYNC (1 sincronização!)
```

### 7. Retry Infinito

**RISCO:** Servidor sempre retorna erro → retry infinito → bate no limite

```
❌ PROBLEMA:
retryCount → 1, 2, 3, 4, 5, ... forever
if (retryCount < maxRetries)  ← nunca atinge limite?
```

**✅ SOLUÇÃO:** Engine já limita!

```typescript
private async executeSyncCycle() {
  try {
    // sync logic
    this.metadata.retryCount = 0;  // Reset em sucesso
  } catch (error) {
    if (this.config.autoRetry && 
        this.metadata.retryCount < this.config.maxRetries) {
      this.metadata.retryCount++;
      // ↑ Só retenta se < maxRetries
      await this.scheduleRetry();
    } else {
      // ↓ Depois para (com syncError persistido)
      this.state.syncError = error;
      // Usuário pode ver erro e tentar syncNow() manualmente
    }
  }
}
```

---

## 🔄 Refatoração de Hooks Existentes

### Antes: `usePlanetTodos` (repetição de código)

```typescript
// ❌ Muito código boilerplate:
// - useRef para interval
// - useRef para pendingIds
// - useRef para suppressOutbox
// - useEffect para inicializar
// - useEffect para polling
// - useEffect para save local
// - Lógica duplicada em usePlanetState também!

const usePlanetTodos = () => {
  const [todos, setTodosState] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const syncIntervalRef = useRef(null);
  const pendingIdsRef = useRef(new Set());
  const suppressOutboxRef = useRef(false);

  useEffect(() => {
    // ... 50+ linhas de lógica repetida
  }, [hasLoaded, isAuthenticated, user?.userId]);

  return { todos, setTodos, hasLoaded };
};
```

### Depois: Refatorado com SyncEngine

```typescript
// ✅ Só lógica de domínio (tipos, merge, API)
// ✅ Engine cuida de timing, retry, estado

const usePlanetTodos = () => {
  // 1. Definir callbacks específicos do domínio
  const callbacks: SyncCallbacks<SavedTodo[]> = {
    push: async (todos) => {
      const response = await pushTodoChanges();
      return {
        applied: response?.applied.map(a => a.id) ?? [],
        conflicts: response?.conflicts.map(c => c.id) ?? [],
      };
    },

    pull: async (cursor) => {
      const result = await pullTodoChanges(userId);
      return {
        data: result.items,
        cursor: result.cursor,
        version: 0, // ou do resposta
      };
    },

    merge: (local, remote) => {
      if (!remote) return local;
      return applyServerTodos(local, remote);
    },

    saveLocal: async (todos) => {
      saveSavedTodos(todos);
    },

    loadLocal: async () => {
      return loadSavedTodos();
    },

    saveMeta: async (meta) => {
      // Persistir cursor, version, etc
    },

    loadMeta: async () => {
      // Carregar
    },
  };

  // 2. Usar hook genérico (tudo o resto é automático!)
  const {
    state: todos,
    setState: setTodos,
    isLoaded,
    hasPending,
    isSyncing,
    error,
  } = useSyncedState<SavedTodo[]>(
    `todos:${userId}`,
    [],
    callbacks,
    { syncIntervalMs: 10000, debounceMs: 300 }
  );

  return { todos, setTodos, isLoaded };
  // ✅ De 200+ linhas para ~50 (sem duplicação)
};
```

### Checklist de Refatoração

- [ ] Extrair `push`/`pull` em callbacks
- [ ] Implementar `merge` (resolver conflitos)
- [ ] Implementar `saveLocal`/`loadLocal`
- [ ] Implementar `saveMeta`/`loadMeta`
- [ ] Usar `useSyncedState()` genérico
- [ ] Remover `useRef` e `useEffect` repetidos
- [ ] Testar merge de conflitos
- [ ] Testar retry automático
- [ ] Medir memory leaks

---

## 🧪 Testando o Engine

### Teste: Merge Sem Conflito

```typescript
it('merge deve combinar local + remote', () => {
  const local = [{ id: 1, v: 1 }, { id: 2, v: 1 }];
  const remote = [{ id: 1, v: 2 }, { id: 3, v: 1 }];
  
  const result = merge(local, remote);
  
  expect(result).toEqual([
    { id: 1, v: 2 },  // remote ganha (v2 > v1)
    { id: 2, v: 1 },  // local mantém (não em remote)
    { id: 3, v: 1 },  // novo de remote
  ]);
});
```

### Teste: Retry com Backoff

```typescript
it('deve retentar com backoff exponencial', async () => {
  let attemptCount = 0;
  const callbacks = {
    push: async () => {
      attemptCount++;
      if (attemptCount < 3) throw new Error('Fail');
      return { applied: [], conflicts: [] };
    },
    // ... outros callbacks
  };

  const engine = new SyncEngine([], callbacks, {
    maxRetries: 3,
    retryDelayMs: 10,  // Teste rápido
    autoRetry: true,
  });

  await engine.syncNow();
  
  expect(attemptCount).toBe(3);  // Falhou 2x, sucesso na 3ª
});
```

### Teste: Debounce

```typescript
it('debounce deve agrupar mudanças rápidas', async () => {
  let syncCount = 0;
  const callbacks = {
    push: async () => {
      syncCount++;
      return { applied: [], conflicts: [] };
    },
    // ...
  };

  const engine = new SyncEngine([], callbacks, {
    debounceMs: 100,
  });

  // 5 mudanças rápidas
  engine.updateLocal(() => ({ a: 1 }));
  engine.updateLocal(() => ({ a: 2 }));
  engine.updateLocal(() => ({ a: 3 }));
  engine.updateLocal(() => ({ a: 4 }));
  engine.updateLocal(() => ({ a: 5 }));

  // Aguardar debounce
  await new Promise(r => setTimeout(r, 150));

  expect(syncCount).toBe(1);  // Só 1 push! (não 5)
});
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (usePlanetTodos) | Depois (SyncEngine) |
|---------|------------------------|-------------------|
| **Linhas de Código** | ~230 | ~50 (callbacks) + engine genérico |
| **Duplicação** | 80% repetido em usePlanetState | 0% (engine agnóstico) |
| **Retry** | Manual | Automático com backoff |
| **Debounce** | Manual | Automático |
| **Memory Leak** | Risco alto | Protegido (dispose) |
| **Testabilidade** | Difícil (acoplado a React) | Fácil (engine puro) |
| **Reusabilidade** | Só para todos | Qualquer tipo T |

---

## 🚀 Próximos Passos

1. **Refatorar usePlanetTodos e usePlanetState** para usar SyncEngine
2. **Criar callbacks específicos** (push, pull, merge) em arquivos separados
3. **Adicionar testes** para merge, retry, debounce
4. **Monitorar performance** (heap size, sync frequency)
5. **Documentar migration guide** para novos domínios

---

**Status:** ✅ Motor pronto | 🚧 Refactoring em progresso | 📋 Testes pendentes
