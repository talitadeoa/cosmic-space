# 📊 Referência Rápida: Arquitetura Cosmic Space

## 1. Onde Colocar Cada Tipo de Arquivo

```
┌─────────────────────────────────────────────────────────────────┐
│                    DECISÃO: ONDE COLOCAR?                       │
└─────────────────────────────────────────────────────────────────┘

Componente de UI genérica (Button, Card, Modal)?
  ↓
  shared/ui/primitives/Button.tsx
  ✅ Reutilizável em múltiplos domínios

Componente específico de um domínio (TodoCard, MoonPhaseDisplay)?
  ↓
  domains/[domínio]/components/TodoCard.tsx
  ✅ Faz sentido só naquele domínio

Hook genérico (useAsync, useLocalStorage)?
  ↓
  shared/hooks/useAsync.ts
  ✅ Sem lógica de domínio

Hook específico de domínio (usePlanetTodos, useLunarCycle)?
  ↓
  domains/[domínio]/hooks/usePlanetTodos.ts
  ✅ Usa lógica do domínio

Função de cálculo (getMoonPhase, calculateInsight)?
  ↓
  domains/[domínio]/services/lunarCalculations.ts
  ✅ Lógica de negócio específica

Função utilitária genérica (formatDate, validateEmail)?
  ↓
  shared/utils/formatters.ts
  ✅ Reutilizável, sem lógica de negócio

Tipo que é usado em múltiplos domínios (User, Session)?
  ↓
  shared/types/common.ts
  ✅ Transcende domínios

Tipo específico de um domínio (MoonPhase, SavedTodo)?
  ↓
  domains/[domínio]/types/[type].ts
  ✅ Só faz sentido naquele domínio

Constante global (APP_NAME, API_URL)?
  ↓
  shared/constants.ts
  ✅ Usada em múltiplos lugares

Constante de um domínio (MOON_PHASES, ISLAND_IDS)?
  ↓
  domains/[domínio]/constants.ts
  ✅ Específica do domínio

Feature que usa múltiplos domínios (SyncEngine)?
  ↓
  features/sync/
  ✅ Orquestra múltiplos domínios

Página / Route Handler?
  ↓
  app/[page]/page.tsx
  ✅ Top-level, importa de shared/domains/features
```

---

## 2. Estrutura de Importação

```typescript
┌─────────────────────────────────────────────────────────────────┐
│                     IMPORT GUIDELINES                            │
└─────────────────────────────────────────────────────────────────┘

// ✅ CORRETO: Importar usando path aliases
import { Card } from '@/shared/ui/primitives';
import { usePlanetTodos } from '@/domains/todo';
import { MoonPhase, getMoonPhase } from '@/domains/lunar-cycle';

// ❌ ERRADO: Imports relativos longos
import { Card } from '../../../shared/ui/primitives';

// ❌ ERRADO: Arquivo não existe mais
import { Card } from '@/components/shared/cosmos/Card';

// ✅ CORRETO: Imports dentro do próprio domínio (sem prefix)
// Em domains/todo/components/TodoCard.tsx
import { usePlanetTodos } from '../hooks';
import type { SavedTodo } from '../types';
import { saveTodo } from '../services';

// ✅ CORRETO: De outro domínio (sempre com @/domains)
import { MoonPhase } from '@/domains/lunar-cycle/types';

// ✅ CORRETO: De shared (sempre com @/shared)
import { formatDate } from '@/shared/utils/formatters';

// ✅ CORRETO: De features (sempre com @/features)
import { useSyncEngine } from '@/features/sync';

// ❌ ERRADO: Importar de cima pra baixo (violação de boundary)
// Em domains/todo/ NÃO fazer:
import { useSyncEngine } from '@/features/sync';
// Features não podem ser importadas por domínios!

// ❌ ERRADO: shared importando de domínios
// Em shared/utils/ NÃO fazer:
import { TodoItem } from '@/domains/todo';
// shared é isolado, não conhece domínios!
```

---

## 3. Dependency Graph Correto

```
┌──────────────────────────────────────────────────────────────┐
│              FLUXO DE DEPENDÊNCIAS (↓ = pode importar)        │
└──────────────────────────────────────────────────────────────┘

                         app/
                    (páginas & routes)
                           ↑
                           │ importa
                           │
        ┌─────────────────┴─────────────────┐
        │                                   │
     features/                          domains/
   (composições)                       (negócio)
        ↑                                   ↑
        │ importa                          │ importa
        │                                   │
        └─────────────────┬─────────────────┘
                          │
                       shared/
                  (infraestrutura)
                          ↑
                          │ NÃO importa de ninguém!
                          │

Regra: Fluxo sempre de baixo para cima, nunca inverter!
```

---

## 4. Checklist para Criar Novo Domínio

```bash
# Criar estrutura
mkdir -p domains/[novo-dominio]/{components,hooks,services,types}

# Criar arquivos mínimos
touch domains/[novo-dominio]/{components,hooks,services,types}/index.ts
touch domains/[novo-dominio]/constants.ts
touch domains/[novo-dominio]/index.ts
touch domains/[novo-dominio]/README.md

# Preencher README (veja template abaixo)

# Commit
git add -A
git commit -m "feat: create new [novo-dominio] domain structure"
```

### Template de README para Novo Domínio

```markdown
# [Domínio] Domain

[Descrição breve do que o domínio faz]

## Estrutura

- `components/` - Componentes UI do domínio
- `hooks/` - Custom hooks do domínio
- `services/` - Lógica de negócio (API, DB, transformação)
- `types/` - Tipos específicos do domínio
- `constants.ts` - Constantes do domínio

## Responsabilidades

- [O que este domínio faz]
- [E mais]

## Dependências

- `@/shared/[X]` - [Por quê]
- `@/domains/[outro]` - [Por quê]

## Uso

```typescript
import {
  Component,
  useHook,
  serviceFunction,
  type TypeName,
} from '@/domains/[dominio]';
```

## Exemplo

[Código de exemplo]
```

---

## 5. Padrão de Barrel Export

```typescript
// ✅ CORRETO: Sempre exportar index.ts!

// domains/todo/components/index.ts
export { TodoInput } from './TodoInput';
export { TodoCard } from './TodoCard';
export { IslandsList } from './IslandsList';

// domains/todo/hooks/index.ts
export { usePlanetTodos } from './usePlanetTodos';
export { useFilteredTodos } from './useFilteredTodos';

// domains/todo/services/index.ts
export { saveTodo, loadTodos, deleteTodo } from './todoStorage';
export { getIslandLabel } from './islandHelpers';

// domains/todo/types/index.ts
export type { SavedTodo, TodoItem, IslandId };
export { isValidIsland } from './validators';

// domains/todo/index.ts (Barrel final - só uma vírgula!)
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export { ISLAND_IDS, TODO_STATUS_FILTERS } from './constants';
```

**Resultado:** Import simples e único

```typescript
// Ao invés de:
import { TodoInput } from '@/domains/todo/components/TodoInput';
import { usePlanetTodos } from '@/domains/todo/hooks/usePlanetTodos';
import { saveTodo } from '@/domains/todo/services/todoStorage';

// Fazer:
import { TodoInput, usePlanetTodos, saveTodo } from '@/domains/todo';
```

---

## 6. Naming Conventions Quick Reference

| O quê | Padrão | Exemplo |
|-------|--------|---------|
| Pasta de domínio | `kebab-case` | `lunar-cycle`, `todo` |
| Pasta de subfuncionalidade | `kebab-case` | `components/`, `services/` |
| Arquivo de componente | `PascalCase` | `TodoCard.tsx`, `MoonPhase.tsx` |
| Arquivo de hook | `camelCase` + use | `usePlanetTodos.ts`, `useLunarCycle.ts` |
| Arquivo de serviço | `camelCase` | `todoStorage.ts`, `lunarCalculations.ts` |
| Arquivo de tipo | `camelCase` | `todo.ts`, `moonPhase.ts` |
| Arquivo de utilidade | `camelCase` | `formatters.ts`, `validators.ts` |
| Arquivo de constante | `constants.ts` | — |
| Constante (dentro do arquivo) | `SCREAMING_SNAKE_CASE` | `MOON_PHASES`, `ISLAND_IDS` |
| Variável/função | `camelCase` | `getMoonPhase()`, `todoList` |

---

## 7. Resolução de Problemas Comuns

```typescript
┌─────────────────────────────────────────────────────────────────┐
│                     TROUBLESHOOTING                              │
└─────────────────────────────────────────────────────────────────┘

❌ ERRO: Cannot find module '@/domains/todo'
✅ SOLUÇÃO:
   - Verificar se domains/todo/index.ts existe
   - Verificar se export * from './components' está lá
   - Limpar .next: rm -rf .next

❌ ERRO: Circular dependency
✅ SOLUÇÃO:
   - Domínio A importa de B, e B importa de A?
   - Extrair código compartilhado para @/shared
   - Ou mover para domains/ se for específico

❌ ERRO: Module not found: @/domains/X/hooks
✅ SOLUÇÃO:
   - Verificar se domains/X/hooks/index.ts existe
   - Se não tiver index.ts, criar com exports

❌ ERRO: Import must exist (ESLint)
✅ SOLUÇÃO:
   - Verificar se path alias está em tsconfig.json
   - Pode precisar reiniciar server: npm run dev

❌ ERRO: Componente de domínio A importando de domínio B
✅ SOLUÇÃO:
   - Se necessário compartilhamento, criar em @/shared
   - Ou criar feature que orquestre ambos

❌ ERRO: Arquivo .ts em pasta de componentes
✅ SOLUÇÃO:
   - Mover para services/ ou utils/
   - Componentes só podem ter .tsx
   
❌ ERRO: Types espalhados em múltiplos places
✅ SOLUÇÃO:
   - Centralizar em types/index.ts do domínio
   - Exportar no barrel export

❌ ERRO: Utils sem padrão (quando usar?)
✅ SOLUÇÃO:
   - Lógica de negócio → services/
   - Helper puro → @/shared/utils/
   - Validação → @/shared/utils/validators.ts
```

---

## 8. Tamanho de Domínios: Quando Dividir/Mesclar

```
┌──────────────────────────────────────────────────────────┐
│           DOMÍNIOS: Quando Dividir ou Mesclar?            │
└──────────────────────────────────────────────────────────┘

TOO SMALL (< 10 arquivos):
  └─ Considere mesclar com domínio relacionado
  └─ Ou mover para shared/ se for genérico
  └─ Exemplo: se "auth" tem só 3 arquivos

GOOD SIZE (10-50 arquivos):
  ✅ Tamanho ideal de um domínio
  ✅ Fácil de navegar
  ✅ Responsabilidades claras
  └─ Exemplos: todo, lunar-cycle, insights

TOO LARGE (> 50 arquivos):
  └─ Considere dividir em sub-domínios
  └─ Exemplo: "cosmos" → "planets", "stars", "galaxies"
  └─ Usar subpasta: domains/cosmos/planets/

MUITO ACOPLADO (sempre importa de outros domínios):
  └─ Talvez seja feature, não domínio
  └─ Mover para features/ se usar múltiplos domínios
  └─ Exemplos: sync, emotional-tracking, lunar-planner

MUITO GENÉRICO (poderia servir qualquer app):
  └─ Mover para shared/
  └─ Não é domínio específico
  └─ Exemplos: formatters, validators, storage adapters
```

---

## 9. Matriz de Responsabilidades

```
┌────────────────┬──────────────┬──────────────┬──────────────┐
│ Responsabilidade | shared/    | domains/     | features/    │
├────────────────┼──────────────┼──────────────┼──────────────┤
│ Componentes UI   | Genéricos  | Específicos  | Compostos     │
│ generalizados    | (Button)   | (TodoCard)   | (Sync UI)     │
├────────────────┼──────────────┼──────────────┼──────────────┤
│ Hooks           | Genéricos   | Domínio      | Composição    │
│                 | (useAsync)  | (useAuth)    | (useSyncState)│
├────────────────┼──────────────┼──────────────┼──────────────┤
│ Lógica negócio  | ❌ Não!     | ✅ Sim       | ✅ Sim        │
│                 |             | (cálculos)   | (orquestração)│
├────────────────┼──────────────┼──────────────┼──────────────┤
│ Types           | Globais     | Domínio      | Composição    │
│                 | (User)      | (TodoItem)   | (SyncState)   │
├────────────────┼──────────────┼──────────────┼──────────────┤
│ API/Storage     | Base HTTP   | Específico   | Orquestração  │
│ integration     | (client)    | (fetch API)  | (batch sync)  │
├────────────────┼──────────────┼──────────────┼──────────────┤
│ Providers       | ✅ Global   | Raramente    | ❌ Não        │
│                 | (Auth,Theme)| (especial)   |               │
└────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## 10. Comparação: Antes vs Depois

```typescript
// ❌ ANTES (Caótico)
import { TodoInput } from '@/app/cosmos/components';
import { Card } from '@/components/shared/cosmos/Card';  // Qual?
import { usePlanetTodos } from '@/hooks';
import { saveTodo } from '@/app/cosmos/utils/todoStorage';
import type { SavedTodo, IslandId } from '@/types/todo';
import { ISLAND_IDS } from '@/app/cosmos/utils/islandNames';
import { getMoonPhase } from '@/lib/moon-calculations';

export function CosmoPage() {
  const { todos, addTodo } = usePlanetTodos();
  // ... 15+ linhas para um import simples

// ✅ DEPOIS (Organizado)
import {
  TodoInput,
  usePlanetTodos,
  type SavedTodo,
  ISLAND_IDS,
} from '@/domains/todo';

import { Card } from '@/shared/ui/primitives';
import { MoonPhaseDisplay, getMoonPhase } from '@/domains/lunar-cycle';

export function CosmoPage() {
  const { todos, addTodo } = usePlanetTodos();
  // Claro, organizado, sem confusão
```

---

## 11. Quick Links & Files

| Arquivo | Propósito |
|---------|-----------|
| `doc/ARQUITETURA_PROPOSTA.md` | Especificação completa |
| `doc/EXEMPLOS_ARQUITETURA.md` | Exemplos de código |
| `doc/GUIA_MIGRACAO_ARQUITETURA.md` | Passo-a-passo migração |
| `tsconfig.json` | Path aliases (atualize!) |
| `.eslintrc.json` | Regras de boundary (adicione!) |

---

## 12. Decisão Rápida: Arquivo em Qual Pasta?

```
Faça a pergunta →

┌─ É um componente React?
│  ├─ Genérico (reutilizável)?  → shared/ui/[tipo]/
│  ├─ Específico de 1 domínio?  → domains/[x]/components/
│  └─ Composto de múltiplos?    → features/[x]/components/
│
├─ É um hook?
│  ├─ Genérico?                 → shared/hooks/
│  ├─ De 1 domínio?             → domains/[x]/hooks/
│  └─ Composto?                 → features/[x]/hooks/
│
├─ É código de negócio (lógica)?
│  ├─ De 1 domínio?             → domains/[x]/services/
│  └─ Múltiplos domínios?       → features/[x]/services/
│
├─ É uma função helper?
│  ├─ Genérica?                 → shared/utils/[tipo].ts
│  └─ De domínio?               → domains/[x]/services/
│
├─ É um tipo (interface)?
│  ├─ Usado em múltiplos?       → shared/types/
│  └─ De 1 domínio?             → domains/[x]/types/
│
├─ É constante?
│  ├─ Global?                   → shared/constants.ts
│  └─ De domínio?               → domains/[x]/constants.ts
│
├─ Usa múltiplos domínios?
│  └─ É uma feature             → features/[nome]/
│
└─ É página/rota?
   └─ app/[pagina]/page.tsx
```

---

## Regra de Ouro

```
┌─────────────────────────────────────────────────────────────┐
│  Se tem dúvida sobre onde colocar, pense em OWNERSHIP:     │
│                                                              │
│  Quem é o "dono" deste código?                             │
│  - Um domínio específico?  → domains/                       │
│  - Múltiplos domínios?     → features/                      │
│  - Tudo?                   → shared/                        │
│  - Uma página?             → app/                           │
└─────────────────────────────────────────────────────────────┘
```

