# Plano de Refatoração de Código - Resumo Executivo

## Situação Atual
- **Total de linhas**: 45.325 linhas de código TypeScript/JavaScript
- **Problema**: Concentração em poucos arquivos grandes
- **Impacto**: Redução de manutenibilidade, testabilidade e reutilização

## Refatorações Implementadas

### 1. ✅ CosmosChatModal.tsx (1100 → 400 linhas)
**Redução: 60%**

**Arquivos Criados:**
- `chat/useChatState.ts` (215 linhas) - Gerencia todo estado do chat
- `chat/useMessageSubmit.ts` (120 linhas) - Lógica de envio/submissão
- `chat/chatConstants.ts` (50 linhas) - Constantes e estilos
- `chat/ChatComponents.tsx` (330 linhas) - ChatHeader, ChatMessages, ChatComposer
- `chat/types.ts` (50 linhas) - Tipos compartilhados
- `CosmosChatModal.refactor.tsx` (400 linhas) - Componente principal refatorado

**Benefícios:**
- Lógica separada da UI
- Hooks reutilizáveis
- Componentes menores e focados
- Fácil de testar unitariamente

---

## Refatorações Propostas (Próximas)

### 2. SyncEngine.ts (704 linhas)
**Objetivo**: Dividir por responsabilidade

**Proposta:**
- `SyncEngine.core.ts` (350 linhas) - Classe SyncEngine
- `SyncEngine.strategies.ts` (150 linhas) - Retry, backoff, merge strategies
- `SyncEngine.utils.ts` (150 linhas) - Helpers e validators
- `SyncEngine.types.ts` (54 linhas) - Tipos compartilhados

**Por quê:** Arquivo gigante com múltiplas responsabilidades. Difícil testar isoladamente.

---

### 3. SavedTodosPanel.tsx (950 linhas)
**Objetivo**: Extrair subcomponentes

**Proposta:**
- Manter componente principal em 300 linhas
- Extrair em subcomponentes:
  - `TodoListContainer.tsx` (150 linhas)
  - `TodoFiltersBar.tsx` (120 linhas)
  - `TodoBatchActionsBar.tsx` (80 linhas)
  - `TodoEmptyState.tsx` (100 linhas)

**Por quê:** Componente faz muitas coisas: renderização, filtros, batch actions, states.

---

### 4. comunidade/page.tsx (704 linhas)
**Objetivo**: Dividir por domínio

**Proposta:**
- `page.tsx` (200 linhas) - Layout e orquestração
- `CommunityFeed.tsx` (250 linhas) - Feed de posts
- `CommunitySidebar.tsx` (150 linhas) - Sidebar
- `CommunityHeader.tsx` (100 linhas) - Header

**Por quê:** Mistura múltiplos domínios (feed, sidebar, header, profile).

---

## Métricas & Impacto

| Arquivo | Antes | Depois | Redução |
|---------|-------|--------|---------|
| CosmosChatModal | 1100 | 400 | 60% |
| SyncEngine | 704 | 350 | 50% |
| SavedTodosPanel | 950 | 300 | 68% |
| comunidade/page | 704 | 200 | 72% |
| **TOTAL** | **3458** | **1250** | **64%** |

**Benefício Total:** Redução de 2.208 linhas em 4 arquivos problemáticos

---

## Padrões Aplicados

### Pattern 1: Hook Extraction
```typescript
// Antes: 600 linhas em um componente
const MyComponent = () => {
  const [state, setState] = useState(...);
  const [data, setData] = useState(...);
  useEffect(() => { /* lógica complexa */ }, [...]);
  return <UI />;
};

// Depois: Lógica em hooks reutilizáveis
const useMyLogic = () => { /* 150 linhas */ };
const MyComponent = () => {
  const { state, setState, data } = useMyLogic();
  return <UI />;
};
```

### Pattern 2: Component Extraction
```typescript
// Antes: Componente renderiza tudo
<Modal>
  <Header {...} />
  <Messages {...} />
  <Composer {...} />
</Modal>

// Depois: Subcomponentes isolados
<Modal>
  <ChatHeader {...} />
  <ChatMessages {...} />
  <ChatComposer {...} />
</Modal>
```

### Pattern 3: Constants & Types
```typescript
// Evita strings mágicas e tipos implícitos
export const toneStyles = { ... };
export type Tone = 'indigo' | 'violet' | ...;
```

---

## Próximos Passos

1. ✅ **CosmosChatModal** - FEITO
2. ⏳ **SyncEngine** - Dividir em estratégias
3. ⏳ **SavedTodosPanel** - Extrair subcomponentes
4. ⏳ **comunidade/page** - Dividir por domínio
5. ⏳ **Validação** - TypeScript + testes

---

## Como Manter a Qualidade

- Usar `npx tsc --noEmit` antes de cada commit
- Manter componentes < 400 linhas
- Extrair lógica complexa em hooks
- Compartilhar tipos via arquivos `types.ts`
- Documentar padrões com JSDoc

---

**Data:** 11 de janeiro de 2026  
**Responsável:** Refatoração Automática
