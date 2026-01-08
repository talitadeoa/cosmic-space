# Todo Domain

Gerencia tarefas (todos) e ilhas (categorias).

## Estrutura

- `components/` - TodoInput, TodoCard, IslandsList
- `hooks/` - usePlanetTodos, useFilteredTodos
- `services/` - Persistência, API, helpers
- `types/` - TodoItem, SavedTodo, IslandId
- `constants.ts` - ISLAND_IDS, STATUS_FILTERS

## Responsabilidades

- CRUD de tarefas
- Gerenciamento de ilhas
- Filtragem e ordenação
- Persistência local e sync

## Dependências

- `@/shared/storage` - Persistência
- `@/shared/api` - HTTP requests
- `@/domains/auth` - Usuário

## Uso

```typescript
import {
  TodoInput,
  TodoCard,
  usePlanetTodos,
  type SavedTodo,
  ISLAND_IDS,
} from '@/domains/todo';

function CosmoPage() {
  const { todos, addTodo, removeTodo } = usePlanetTodos();
  
  return (
    <>
      <TodoInput onSubmit={addTodo} />
      {todos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} onDelete={removeTodo} />
      ))}
    </>
  );
}
```

## Roadmap

- [ ] Mover app/cosmos/components/TodoInput.tsx
- [ ] Criar TodoCard especializada
- [ ] Consolidar lib/planetTodos.ts
- [ ] Consolidar app/cosmos/utils/
- [ ] Consolidar types/todo.ts
- [ ] Criar hooks/index.ts
- [ ] Criar index.ts barrel export
