# 💻 Exemplos de Integração e Teste

## 1. Dados Mock para Testes Rápidos

```typescript
import { SavedTodo } from "@/app/cosmos/utils/todoStorage";
import type { MoonPhase } from "@/app/cosmos/utils/moonPhases";
import type { IslandId } from "@/app/cosmos/types/screen";

export const MOCK_TODOS: SavedTodo[] = [
  {
    id: "todo-1",
    text: "Revisar design do componente EmptyState",
    completed: false,
    depth: 0,
    phase: "luaNova",
    islandId: "ilha1",
    project: "Cosmic Space",
    category: "Design",
    dueDate: "2025-12-24",
  },
  {
    id: "todo-2",
    text: "Implementar AccessibleTabs",
    completed: true,
    depth: 0,
    phase: "luaCrescente",
    islandId: "ilha2",
    project: "Cosmic Space",
    category: "Development",
    dueDate: "2025-12-23",
  },
  {
    id: "todo-3",
    text: "Testar navegação de teclado em IslandsList",
    completed: false,
    depth: 1,
    phase: "luaCheia",
    islandId: "ilha3",
    project: "QA",
    category: "Testing",
    dueDate: "2025-12-25",
  },
];

export const MOCK_STATE = {
  savedTodos: MOCK_TODOS,
  selectedProject: "Cosmic Space",
  selectedIsland: "ilha1" as IslandId,
  selectedPhase: "luaNova" as MoonPhase,
};
```

---

## 2. Exemplo Completo - SidePlanetCardScreen

```tsx
"use client";

import React from "react";
import { SavedTodosPanel } from "@/app/cosmos/components/SavedTodosPanel";
import { MoonPhasesRail } from "@/app/cosmos/components/MoonPhasesRail";
import { IslandsList } from "@/app/cosmos/components/IslandsList";
import type { SavedTodo, MoonPhase } from "@/app/cosmos/utils/todoStorage";
import type { IslandId } from "@/app/cosmos/types/screen";
import { MOCK_TODOS } from "@/doc/EXEMPLOS_INTEGRACAO";

export function SidePlanetCardScreenExample() {
  const [savedTodos, setSavedTodos] = React.useState<SavedTodo[]>(MOCK_TODOS);
  const [selectedProject, setSelectedProject] = React.useState("");
  const [selectedIsland, setSelectedIsland] = React.useState<IslandId | null>(null);
  const [selectedPhase, setSelectedPhase] = React.useState<MoonPhase | null>(null);

  // =========================================================================
  // LÓGICA DE FILTRAGEM
  // =========================================================================

  // Contar tarefas por fase (para badges)
  const moonCounts = React.useMemo(
    () =>
      savedTodos.reduce(
        (acc, todo) => {
          if (todo.phase) acc[todo.phase] = (acc[todo.phase] ?? 0) + 1;
          return acc;
        },
        {} as Record<MoonPhase, number>
      ),
    [savedTodos]
  );

  // Filtrar por projeto
  const todosByProject = React.useMemo(() => {
    const trimmed = selectedProject.trim();
    if (!trimmed) return savedTodos;
    return savedTodos.filter(
      (todo) =>
        (todo.project ?? "").toLowerCase() === trimmed.toLowerCase()
    );
  }, [savedTodos, selectedProject]);

  // Filtrar por fase (aplicado APÓS projeto)
  const filteredTodos = React.useMemo(() => {
    if (!selectedPhase) return todosByProject;
    return todosByProject.filter((todo) => todo.phase === selectedPhase);
  }, [todosByProject, selectedPhase]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleToggleComplete = (todoId: string) => {
    setSavedTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleAssignPhase = (todoId: string, phase: MoonPhase) => {
    setSavedTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, phase } : todo
      )
    );
  };

  // =========================================================================
  // TEMPLATE
  // =========================================================================

  return (
    <div className="relative flex w-full items-start justify-center px-4 sm:px-8 pt-4 sm:pt-6">
      <div className="relative flex w-full max-w-7xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        
        {/* Coluna Esquerda */}
        <div className="flex w-full flex-col gap-6 lg:w-auto lg:max-w-xs">
          <IslandsList
            selectedIsland={selectedIsland}
            onSelectIsland={setSelectedIsland}
          />
        </div>

        {/* Coluna Central */}
        <div className="relative w-full lg:flex-1">
          <SavedTodosPanel
            savedTodos={filteredTodos}
            onDragStart={() => {}}
            onDragEnd={() => {}}
            onToggleComplete={handleToggleComplete}
            onAssignPhase={handleAssignPhase}
            selectedPhase={selectedPhase}
          />
        </div>

        {/* Coluna Direita */}
        <div className="w-full lg:w-auto lg:max-w-xs">
          <MoonPhasesRail
            selectedPhase={selectedPhase}
            onSelectPhase={setSelectedPhase}
            phaseCounts={moonCounts}
            orientation="vertical"
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Casos de Uso Específicos

### SavedTodosPanel com Filtro de Fase

```tsx
import { SavedTodosPanel } from "@/app/cosmos/components/SavedTodosPanel";

const [selectedPhase, setSelectedPhase] = React.useState<MoonPhase | null>(
  "luaNova"
);

export function SavedTodosPanelExample() {
  return (
    <SavedTodosPanel
      savedTodos={MOCK_TODOS}
      onDragStart={(todoId) => (e) => {
        console.log("Drag start:", todoId);
      }}
      onDragEnd={() => {
        console.log("Drag end");
      }}
      onToggleComplete={(todoId) => {
        console.log("Toggle complete:", todoId);
      }}
      onAssignPhase={(todoId, phase) => {
        console.log("Assign phase:", todoId, phase);
      }}
      selectedPhase={selectedPhase}
      // Resultado: Mostra apenas tarefas com phase === "luaNova"
    />
  );
}
```

### MoonPhasesRail com Contadores

```tsx
import { MoonPhasesRail } from "@/app/cosmos/components/MoonPhasesRail";
import type { MoonPhase } from "@/app/cosmos/utils/moonPhases";

export function MoonPhasesRailExample() {
  const [selectedPhase, setSelectedPhase] = React.useState<MoonPhase | null>(
    null
  );

  const phaseCounts: Record<MoonPhase, number> = {
    luaNova: 5,
    luaCrescente: 3,
    luaCheia: 7,
    luaMinguante: 2,
  };

  return (
    <MoonPhasesRail
      selectedPhase={selectedPhase}
      onSelectPhase={setSelectedPhase}
      phaseCounts={phaseCounts}
      orientation="vertical"
      // Resultado: Exibe as 4 fases com badges de contagem
    />
  );
}
```

### IslandsList com Seleção

```tsx
import { IslandsList } from "@/app/cosmos/components/IslandsList";
import type { IslandId } from "@/app/cosmos/types/screen";

export function IslandsListExample() {
  const [selectedIsland, setSelectedIsland] = React.useState<IslandId | null>(
    null
  );

  return (
    <IslandsList
      selectedIsland={selectedIsland}
      onSelectIsland={setSelectedIsland}
      // Resultado: Permite selecionar uma das 4 ilhas
    />
  );
}
```

### AccessibleTabs para Navegação

```tsx
import { AccessibleTabs } from "@/app/cosmos/components/AccessibleTabs";

export function AccessibleTabsExample() {
  const [activeTab, setActiveTab] = React.useState("inbox");

  return (
    <AccessibleTabs
      id="main-tabs"
      items={[
        { id: "inbox-tab", label: "Inbox", value: "inbox" },
        { id: "moon-tab", label: "Lua Atual", value: "moon" },
      ]}
      value={activeTab}
      onChange={setActiveTab}
      // Resultado: Dois painéis com navegação por teclado
    />
  );
}
```

### EmptyState Quando Sem Tarefas

```tsx
import { EmptyState } from "@/app/cosmos/components/EmptyState";

export function EmptyStateExample() {
  const isEmpty = true; // Simular sem tarefas

  return isEmpty ? (
    <EmptyState
      title="Nenhum to-do salvo"
      description="Crie uma tarefa ou selecione uma fase lunar."
      icon="✨"
      // Resultado: Exibe mensagem visual quando tarefas.length === 0
    />
  ) : null;
}
```

---

## 4. Padrões de Navegação por Teclado

### Navegar em Tarefas com Setas

```tsx
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  const items = MOCK_TODOS;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % items.length);
      break;
    case "ArrowUp":
      e.preventDefault();
      setFocusedIndex((prev) =>
        (prev - 1 + items.length) % items.length
      );
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      console.log("Ação em:", items[index].id);
      break;
  }
};
```

---

## 5. Testes de Filtro Avançado

### Filtrar por Projeto + Fase Simultaneamente

```tsx
export function AdvancedFilteringExample() {
  const [project, setProject] = React.useState("Cosmic Space");
  const [phase, setPhase] = React.useState<MoonPhase | null>("luaNova");

  // Filtro composto
  const filtered = MOCK_TODOS.filter(
    (todo) =>
      (!project || todo.project?.toLowerCase() === project.toLowerCase()) &&
      (!phase || todo.phase === phase)
  );

  return (
    <div className="space-y-4">
      <div>
        <label>Projeto:</label>
        <select value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="">Todos</option>
          <option value="Cosmic Space">Cosmic Space</option>
          <option value="QA">QA</option>
        </select>
      </div>

      <div>
        <label>Fase:</label>
        <select
          value={phase ?? ""}
          onChange={(e) =>
            setPhase((e.target.value as MoonPhase) || null)
          }
        >
          <option value="">Todas</option>
          <option value="luaNova">Lua Nova</option>
          <option value="luaCrescente">Lua Crescente</option>
          <option value="luaCheia">Lua Cheia</option>
          <option value="luaMinguante">Lua Minguante</option>
        </select>
      </div>

      <p>Tarefas encontradas: {filtered.length}</p>
      <ul>
        {filtered.map((todo) => (
          <li key={todo.id}>
            {todo.text} ({todo.project} - {todo.phase || "sem fase"})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 6. Cálculo de Contadores

### Contar Tarefas por Fase

```tsx
const phaseCounters = MOCK_TODOS.reduce(
  (acc, todo) => {
    if (todo.phase) {
      acc[todo.phase] = (acc[todo.phase] ?? 0) + 1;
    }
    return acc;
  },
  {} as Record<MoonPhase, number>
);

// Resultado:
// {
//   luaNova: 1,
//   luaCrescente: 1,
//   luaCheia: 2,
//   luaMinguante: 0,
// }
```

---

## 7. Imports Necessários

```typescript
import React from "react";
import { SavedTodosPanel } from "@/app/cosmos/components/SavedTodosPanel";
import { MoonPhasesRail } from "@/app/cosmos/components/MoonPhasesRail";
import { IslandsList } from "@/app/cosmos/components/IslandsList";
import { AccessibleTabs } from "@/app/cosmos/components/AccessibleTabs";
import { EmptyState } from "@/app/cosmos/components/EmptyState";
import type { SavedTodo, MoonPhase } from "@/app/cosmos/utils/todoStorage";
import type { IslandId } from "@/app/cosmos/types/screen";
import { phaseLabels } from "@/app/cosmos/utils/todoStorage";
```

---

## 8. Dicas e Truques

### ✅ DO: Usar useMemo para Filtros

```tsx
const filtered = React.useMemo(() => {
  return todos.filter(/* ... */);
}, [todos, selectedPhase, selectedProject]);
```

### ❌ DON'T: Calcular Inline

```tsx
// Evitar: Recalcula a cada render
const filtered = todos.filter(/* ... */);
```

### ✅ DO: Usar useCallback para Handlers

```tsx
const handleSelect = React.useCallback((phase: MoonPhase) => {
  setSelectedPhase(phase);
}, []);
```

### ✅ DO: Tipagem TypeScript Completa

```tsx
const [state, setState] = React.useState<MoonPhase | null>(null);
```

### ✅ DO: Aria Labels Descritivas

```tsx
<button aria-label="Select Lua Nova phase">🌑</button>
```

---

## 9. Testes Manuais Checklist

- [ ] Abrir componentes em Chrome, Firefox, Safari
- [ ] Navegar com Tab entre elementos
- [ ] Usar Arrow Keys em tabs/fases
- [ ] Verificar focus ring
- [ ] Testar drag-and-drop
- [ ] Verificar contrastes (WAVE)
- [ ] Testar em mobile (375px)
- [ ] Testar em tablet (768px)
- [ ] Testar em desktop (1200px+)

---

## 10. Debugging Tips

### Verificar Contadores

```tsx
console.log("moonCounts:", moonCounts);
// { luaNova: 3, luaCrescente: 1, ... }
```

### Verificar Filtro

```tsx
console.log("filteredTodos:", filteredTodos);
console.log("length:", filteredTodos.length);
```

### Verificar Estado

```tsx
console.log("selectedPhase:", selectedPhase);
console.log("selectedIsland:", selectedIsland);
console.log("selectedProject:", selectedProject);
```

### Verificar Handlers

```tsx
const handleSelect = (phase: MoonPhase | null) => {
  console.log("Selecionou:", phase);
  setSelectedPhase(phase);
};
```

---

Pronto para começar! Use esses exemplos como referência para integrar os componentes no seu projeto.
