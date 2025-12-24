# Rota Planeta - Estrutura por Camadas

## 📁 Estrutura da Rota
```
/app/planeta/
├── layout.tsx          (Camada 1: Metadata e configuração)
└── page.tsx           (Camada 2: Página Principal)
```

## 🏗️ Camadas de Arquitetura

### Camada 1: Layout e Metadata
**Arquivo:** `/app/planeta/layout.tsx`
- Configuração de metadados (SEO)
- Wrapper de layout da página
- Estilos globais

### Camada 2: Página Principal
**Arquivo:** `/app/planeta/page.tsx`
- Componente React da página
- Provedor de contexto (YearProvider)
- Background (SpaceBackground)
- Integração com o componente principal

### Camada 3: Contexto (Context Layer)
**Localização:** `/app/cosmos/context/`
- `YearContext.tsx` - Gerencia o estado do ano lunar

### Camada 4: Componentes (Component Layer)
**Localização:** `/app/cosmos/components/`

#### Componentes Principais
- **SpaceBackground** - Background animado do espaço
- **CelestialObject** - Objetos celestiais interativos (Planeta, Luas, Sol)
- **Card** - Container com estilo
- **TodoInput** - Input para criar novas tarefas
- **SavedTodosPanel** - Painel exibindo tarefas salvas
- **IslandsList** - Lista de ilhas interativas

### Camada 5: Tela Principal (Screen Layer)
**Localização:** `/app/cosmos/screens/`
- **PlanetScreen** (planet.tsx) - Tela de organização por fases lunares
  - Exibe planeta, luas e sol
  - Gerencia tarefas por fase lunar
  - Gerencia seleção de ilhas
  - Filtros avançados

### Camada 6: Types (Type Layer)
**Localização:** `/app/cosmos/types/`
- `ScreenProps` - Props de tela
- `ScreenId` - ID de telas
- `IslandId` - ID de ilhas
- `MoonPhase` - Fases lunares

### Camada 7: Utilities (Utility Layer)
**Localização:** `/app/cosmos/utils/`

#### Utilitários Usados
- **todoStorage.ts**
  - `loadSavedTodos()` - Carrega tarefas do localStorage
  - `saveSavedTodos()` - Salva tarefas no localStorage
  - `MoonPhase` type
  - `SavedTodo` type
  - `phaseLabels` - Labels das fases lunares

- **phaseVibes.ts**
  - `PHASE_VIBES` - Energia/vibe de cada fase lunar

- **islandNames.ts**
  - `getIslandLabel()` - Obtém label customizado de ilha
  - `IslandNames` type

### Camada 8: Hooks (Custom Hooks Layer)
**Localização:** `/hooks/`

#### Hooks Usados
- **usePhaseInputs** - Gerencia inputs de fase lunar
- **useFilteredTodos** - Filtra tarefas por vários critérios
- **useIslandNames** - Gerencia nomes customizados de ilhas

## 📊 Fluxo de Dados

```
/planeta/page.tsx
    ↓
YearProvider (Context)
    ↓
SpaceBackground + PlanetScreen
    ↓
├── CelestialObject (planeta, luas, sol)
├── Card (container)
├── SavedTodosPanel
│   ├── useFilteredTodos hook
│   ├── todoStorage utilities
│   └── islandNames utilities
├── TodoInput
├── IslandsList
└── FiltersPanel
    └── FilterState type
```

## 🔄 Estados Gerenciados

### Em PlanetScreen:
- `savedTodos` - Tarefas salvas
- `hasLoadedTodos` - Flag de carregamento
- `isFiltersPanelOpen` - Painel de filtros visível
- `activeDrop` - Fase lunar sob hover
- `activeIslandDrop` - Ilha sob hover
- `isDraggingTodo` - Se uma tarefa está sendo arrastad
- `draggingTodoId` - ID da tarefa sendo arrastada
- `showDeleteConfirm` - Modal de confirmação
- `filters` - Estado de filtros (view, inputType, todoStatus, phase, island)

## 🎯 Funcionalidades Principais

1. **Drag & Drop de Tarefas**
   - Arrastar para fases lunares
   - Arrastar para ilhas
   - Confirmação de exclusão

2. **Filtros Avançados**
   - Por fase lunar
   - Por tipo de input (text/checkbox)
   - Por status de tarefa (completada/aberta)
   - Por ilha selecionada
   - Por visualização (inbox/lua-atual)

3. **Gerenciamento de Ilhas**
   - Seleção de ilha
   - Renomeação de ilha
   - Atribuição de tarefas

4. **Sincronização com Backend**
   - Salva inputs em fases lunares
   - Persiste tarefas no localStorage

## 📦 Dependências Externas

- **react** - Framework
- **framer-motion** - Animações
- **tailwindcss** - Estilos

## ✨ Acessibilidade

- Componentes interativos com suporte a teclado
- Labels ARIA apropriadas
- Contraste de cores adequado
