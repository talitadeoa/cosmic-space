# ✅ Atualização do Script de Sincronização - Subtarefas e Categoria

## 🔧 Mudanças Implementadas

### 1. **Migration de Banco de Dados**
- ✅ Criado novo script `16-planet-todos-parent-id.sql`
- ✅ Adiciona coluna `parent_id` na tabela `planet_todos`
- ✅ Adiciona índices para otimizar buscas de subtarefas
- ✅ Atualizado scripts de migração para incluir o novo script

### 2. **Backend (lib/planetTodos.ts)**
- ✅ Adicionado campo `parentId` na interface `PlanetTodoRecord`
- ✅ Atualizada função `normalizeTodo()` para processar `parentId`
- ✅ Atualizada função `listPlanetTodos()` para buscar `parent_id`
- ✅ Atualizada função `mergePlanetTodos()` para salvar `parent_id`

### 3. **API de Sincronização (app/api/planet-todos/sync/route.ts)**
- ✅ Adicionado `parentId` ao tipo `SyncTodoPayload`
- ✅ Atualizada query GET para incluir `parent_id`
- ✅ Atualizado payload de resposta para incluir `parentId`
- ✅ Atualizada query POST para salvar `parent_id`
- ✅ Atualizado INSERT/UPDATE para processar `parentId`

### 4. **Cliente/Frontend (app/cosmos/utils/planetSync.ts)**
- ✅ Adicionado `parentId` ao tipo `SyncTodoPayload`
- ✅ Atualizada função `mapTodoToPayload()` para incluir `parentId`

### 5. **Hook de Sincronização (hooks/usePlanetTodos.ts)**
- ✅ Atualizada função `applyServerTodos()` para processar `parentId` do servidor

## 🚀 Para Aplicar as Mudanças

### Opção 1: Com Banco de Desenvolvimento Local
```bash
# 1. Configure um banco PostgreSQL local (se não tiver)
# 2. Configure .env.local com DATABASE_URL
# 3. Execute o script de migração
npx tsx scripts/run-sync-migrations.ts
```

### Opção 2: Apenas Build & Test (Recomendado)
```bash
# Fazer build para verificar se tudo compila
npm run build

# Executar em desenvolvimento
npm run dev
```

## 🔍 Como Testar

### 1. **Teste de Subtarefas**
1. Crie uma tarefa principal
2. Adicione subtarefas à tarefa principal
3. Verifique se as subtarefas têm `parentId` correto
4. Teste sincronização entre dispositivos

### 2. **Teste de Categoria**
1. Crie tarefas com diferentes categorias
2. Verifique se a categoria é preservada na sincronização

### 3. **Verificar Dados Sincronizados**
- Verifique no localStorage: `flua_todos_salvos`
- Verifique se tem campos `parentId` e `category`
- Teste offline/online para verificar sincronização

## 📊 Estrutura de Dados Atualizada

```typescript
// SavedTodo agora inclui:
{
  id: string;
  text: string;
  completed: boolean;
  depth: number;
  inputType: TodoInputType;
  category?: string;        // ✅ JÁ EXISTIA
  dueDate?: string;
  parentId?: string | null; // ✅ NOVO - para subtarefas
  islandId?: IslandId;
  phase?: MoonPhase;
  // ... outros campos
}
```

## 🎯 Próximos Passos

1. **Testar localmente** a funcionalidade
2. **Aplicar migration** no ambiente de produção quando aprovar
3. **Monitorar** se a sincronização está funcionando corretamente
4. **Verificar performance** dos novos índices

## ⚠️ Observações

- A migration é **backward compatible** - não quebra dados existentes
- O campo `category` **já existia** e continua funcionando
- O campo `parentId` é **novo** e permite hierarquia de tarefas
- Todos os scripts de migração foram atualizados para incluir a nova migration

---

**Status:** ✅ Implementação completa - Pronto para teste e deploy