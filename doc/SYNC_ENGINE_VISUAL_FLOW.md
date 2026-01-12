# 📊 Fluxo Visual: Sincronização com SyncEngine

## 1️⃣ Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                         │
│              (PlanetScreen, TodoList, etc)                   │
├─────────────────────────────────────────────────────────────┤
│                    useSyncedState Hook                       │
│              (observar mudanças de estado)                   │
├─────────────────────────────────────────────────────────────┤
│  SyncEngine<T>                          SyncCallbacks<T>     │
│  ├─ Gerenciar timing                   ├─ push()            │
│  ├─ Coordenar push/pull                ├─ pull()            │
│  ├─ Retry automático                   ├─ merge()           │
│  ├─ Rastrear estado                    └─ storage I/O       │
│  └─ Emitir eventos                                          │
├─────────────────────────────────────────────────────────────┤
│  Storage (localStorage, IndexedDB)  +  API (fetch, HTTP)    │
└─────────────────────────────────────────────────────────────┘
```

## 2️⃣ Ciclo de Sincronização Completo

```
┌─────────────────────────────────────────────────────────────┐
│                   INICIALIZAÇÃO (init)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  engine.initialize()                                         │
│  │                                                            │
│  ├─→ loadLocal()      ┌─ localStorage                         │
│  │                     └─ recover state                       │
│  │                                                            │
│  ├─→ loadMeta()       ┌─ cursor, version, lastSync           │
│  │                     └─ para continuar sync                 │
│  │                                                            │
│  └─→ startPolling()   ┌─ setTimeout(initialDelayMs)           │
│                        ├─ setInterval(syncIntervalMs)         │
│                        └─ executeSyncCycle() periodicamente   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              UPDATE LOCAL (com debounce)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  updateLocal(() => ({...}))                                 │
│  │                                                            │
│  ├─→ state.local = updated                                   │
│  ├─→ hasPending = true                                       │
│  ├─→ emitStateChange()                                       │
│  └─→ debounceSync()                                          │
│      │                                                        │
│      ├─→ clearTimeout (anterior)  ┐                          │
│      │                             │ Agrupar mudanças        │
│      └─→ setTimeout(debounceMs)    │ rápidas em 1 push       │
│          └─ (300ms) → executeSyncCycle()                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            EXECUTE SYNC CYCLE (push → pull)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  isSyncing = true                                            │
│  └─ emitStateChange({isSyncing: true})                       │
│                                                               │
│  ┌──────────────── PUSH (enviar mudanças) ───────────┐      │
│  │                                                    │       │
│  │  IF hasPending:                                    │       │
│  │  │                                                 │       │
│  │  └─→ push(local)                                   │       │
│  │      │                                             │       │
│  │      ├─→ POST /api/todos/sync { local }            │       │
│  │      │                                             │       │
│  │      ├─→ resposta: {applied[], conflicts[]}        │       │
│  │      │                                             │       │
│  │      └─→ hasPending = conflicts.length > 0         │       │
│  │          (continuar tentando se conflitos)        │       │
│  │                                                    │       │
│  └────────────────────────────────────────────────────┘      │
│                        │                                      │
│                        ▼                                      │
│  ┌──────────────── PULL (receber mudanças) ────────────┐    │
│  │                                                      │     │
│  │  pull(cursor)                                        │     │
│  │  │                                                   │     │
│  │  ├─→ GET /api/todos/sync?cursor=123                 │     │
│  │  │                                                   │     │
│  │  ├─→ resposta: {items[], cursor, version}           │     │
│  │  │                                                   │     │
│  │  ├─→ merge(local, items)                            │     │
│  │  │   └─ resolvendo conflitos por versão            │     │
│  │  │                                                   │     │
│  │  └─→ updateLocalSuppressed(merged)                  │     │
│  │      └─ sem enfileirar novamente!                   │     │
│  │                                                      │     │
│  └──────────────────────────────────────────────────────┘    │
│                        │                                      │
│                        ▼                                      │
│  SUCESSO ✅                 ERRO ❌                           │
│  ├─ retryCount = 0         ├─ retryCount++                   │
│  ├─ syncError = null       ├─ syncError = error              │
│  ├─ lastSyncAt = now()     └─ scheduleRetry(backoff)         │
│  └─ saveMeta()                                               │
│                                                               │
│  isSyncing = false                                           │
│  └─ emitStateChange({isSyncing: false})                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 3️⃣ Timeline: Sequência Temporal

```
CENÁRIO: Usuário digita, app sincroniza com servidor

t=0ms
├─ App carrega
├─ initialize() → loadLocal
├─ loadMeta()
└─ startPolling

t=100ms
├─ (initialDelayMs expirou)
├─ Primeiro sync tentado
└─ pull() busca dados do servidor

t=150ms
├─ pull() completou
├─ merge() resolveu conflitos
└─ hasPending = false

t=200ms
├─ Usuário digita "Hello"
├─ updateLocal() chamado
├─ debounceSync() ativa (300ms timer)
└─ hasPending = true

t=220ms
├─ Usuário digita "World" (mudança rápida)
├─ updateLocal() chamado
├─ debounceSync() RESETA timer (clara anterior)
└─ novo timer: 300ms

t=520ms
├─ debounce expirou (300ms desde última mudança)
├─ executeSyncCycle() chamado
├─ push() envia "HelloWorld"
└─ (1 push! não 2)

t=550ms
├─ push() completou
├─ pull() busca atualizações
└─ merge()

t=10100ms
├─ Polling: próximo sync automático
├─ (10s desde último sucesso)
└─ Sem mudanças? skip push

t=10150ms
├─ pull() novamente
└─ servidor pode ter dados de outros dispositivos!
```

## 4️⃣ Retry com Backoff Exponencial

```
CENÁRIO: Servidor instável, depois recupera

Tentativa 1 (retry 0):
  t=0ms    executeSyncCycle() chamado
  t=50ms   push() falha (timeout)
           retryCount = 1
           delayMs = 1000 * 2^0 = 1000ms
           scheduleRetry(1000ms)
           ▼

Tentativa 2 (retry 1):
  t=1000ms executeSyncCycle() chamado novamente
  t=1050ms pull() falha (erro)
           retryCount = 2
           delayMs = 1000 * 2^1 = 2000ms
           scheduleRetry(2000ms)
           ▼

Tentativa 3 (retry 2):
  t=3000ms executeSyncCycle() chamado novamente
  t=3050ms push() OK! ✅
  t=3100ms pull() OK! ✅
           retryCount = 0  ← RESET!
           lastSyncAt = now()
           syncError = null

Sem retryCount++ agora!
  t=13100ms próximo polling (10s depois)
            começa fresh novamente
```

## 5️⃣ Merge de Conflito

```
CENÁRIO: Local e remoto divergem

Tempo T1 (ambos no mesmo estado):
┌─────────────────┐
│ {id: 1, v: 1}   │
└─────────────────┘

Tempo T2 (diverg. sem conexão):
LOCAL:                REMOTO:
{id: 1, v: 3}        {id: 1, v: 2}
(mais recente!)      (menos recente)

Hora de sincronizar:
1. push(local) → "Que versão é essa?"
   Servidor rejeita: "Você tem v3? Eu tenho v2!"
   → Conflito!

2. pull(cursor) → Servidor envia {v: 2}

3. merge(local={v:3}, remote={v:2})
   └─ if (remote.v >= local.v)  false!
   └─ Manter local {v:3}
   └─ Próxima tentativa de push irá resolver

OU:

Hora de sincronizar (outro cenário):
1. pull(cursor) → Servidor envia {id: 1, v: 5}
   (outro dispositivo atualizou!)

2. merge(local={v:3}, remote={v:5})
   └─ if (remote.v >= local.v)  true!
   └─ Aplicar remote {v:5}
   └─ Local sobrescrito (merge correto)
```

## 6️⃣ Debounce em Ação

```
CENÁRIO: Usuário digita rapidamente

Sem debounce (❌ ruim):
User input:  a    b    c    d    e
              │    │    │    │    │
Sync calls:   ●    ●    ●    ●    ●  (5 pushes!)
              │    │    │    │    │
Server:      POST POST POST POST POST


Com debounce=300ms (✅ bom):
User input:  a    b    c    d    e         (nada)
              │    │    │    │    │
t=0ms        timer=300ms
t=50ms       timer=300ms (reset)
t=100ms      timer=300ms (reset)
t=150ms      timer=300ms (reset)
t=200ms      timer=300ms (reset)
t=500ms      timer expirou!
             Sync call: ●
             │
Server:      POST (1 push! com todo o texto)
```

## 7️⃣ Memory Leak: Antes vs Depois

```
❌ ANTES (sem dispose):
Hook mount
├─ setInterval (NÃO cleared)
├─ setTimeout (NÃO cleared)
└─ listener (NÃO unsubscribed)

Component unmount
└─ Intervalos + timeouts continuam rodando!
   └─ Memory leak + CPU waste

⚠️ DEPOIS (com dispose):
Hook mount
├─ setInterval
├─ setTimeout
└─ listener

Component unmount
└─ engine.dispose()
   ├─ clearInterval ✓
   ├─ clearTimeout ✓
   ├─ unsubscribe ✓
   └─ isDisposed = true
      └─ Próximas ops ignoradas
```

## 8️⃣ Push-Pull Sincronizado

```
❌ PROBLEMA (sem coordenação):
updateLocal()
├─ push() inicia
│  └─ fetch em andamento...
│
├─ pull() inicia (NÃO AGUARDOU)
│  └─ merge() com estado INCOMPLETO
│     └─ Mudanças do push podem perder-se!
│
└─ push() finaliza
   └─ Chegou tarde demais!

✅ SOLUÇÃO (engine orquestra):
executeSyncCycle()
├─ push() inicia
│  └─ await push()  ← AGUARDA!
│     ├─ fetch completo
│     └─ hasPending atualizado
│
├─ pull() inicia
│  └─ await pull()  ← SEQUENCIAL!
│     ├─ merge() com estado ATUALIZADO
│     └─ updateLocalSuppressed()
│
└─ Ambas completam ordenadamente
```

## 9️⃣ Estados Observáveis

```
SyncState<T> {
  local: T              ← Estado atual
  remote: T | null     ← Último remoto bem-sucedido
  remoteVersion: num   ← Versão do servidor
  isLoaded: bool       ← Carregado do storage
  isSyncing: bool      ← SINCRONIZANDO AGORA
  syncError: Err       ← Último erro
  hasPending: bool     ← Mudanças não sincronizadas
}

Transições:
┌─ INIT
│  isLoaded=false
│  isSyncing=false
│
├─→ LOADING
│  initialize()
│  isSyncing=true
│
├─→ READY
│  isLoaded=true
│  isSyncing=false
│
├─→ SYNCING
│  updateLocal() OU polling
│  isSyncing=true
│  hasPending=true
│
├─→ ERROR
│  push/pull falha
│  syncError=err
│  isSyncing=false
│  retry agendado
│
└─→ READY
   sucesso!
   retryCount=0
   syncError=null
```
