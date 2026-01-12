# Sync Feature

Orquestra a sincronização entre múltiplos domínios.

## Responsabilidades

Sincroniza dados entre cliente local e servidor:
- Autenticação (tokens, sessão)
- Tarefas (todos e ilhas)
- Insights (dados gerados)
- Cache local

## Dependências

- `@/domains/auth` - Tokens e autenticação
- `@/domains/todo` - Tarefas para sync
- `@/domains/insights` - Insights para sync
- `@/shared/storage` - Persistência
- `@/shared/api` - HTTP client

## Estrutura

```
features/sync/
├── components/        # UI de sync (status, progresso)
├── hooks/             # useSyncEngine, useSyncStatus
├── services/          # Lógica de sync (batch, conflitos)
├── types/             # SyncResult, SyncState
├── constants.ts       # SYNC_BATCH_SIZE, RETRY_DELAY
├── index.ts           # Barrel export
└── README.md          # Esta documentação
```

## Uso

```typescript
import { useSyncEngine, SyncStatus } from '@/features/sync';

function CosmoPage() {
  const { sync, status, lastResult } = useSyncEngine();
  
  return (
    <>
      <button onClick={() => sync()}>
        {status === 'syncing' ? 'Sincronizando...' : 'Sincronizar'}
      </button>
      {lastResult?.success && (
        <div>✅ {lastResult.itemsSynced} itens sincronizados</div>
      )}
    </>
  );
}
```

## Roadmap

- [ ] Consolidar lib/sync/
- [ ] Consolidar hooks de sync
- [ ] Implementar batch upload
- [ ] Implementar conflict resolution
- [ ] Adicionar retry logic
- [ ] Criar index.ts barrel export
