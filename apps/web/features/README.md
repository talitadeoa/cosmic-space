# Features - Composições Complexas

Features que usam múltiplos domínios e orquestram sua interação.

## Estrutura

Cada feature segue o mesmo padrão que domínios:

```
features/[feature]/
├── components/     - UI da feature
├── hooks/          - Lógica composta
├── services/       - Orquestração entre domínios
├── types/          - Tipos da feature
├── constants.ts
├── index.ts
└── README.md
```

## Features Atuais

- **sync** - Sincronização (usa auth + todo + insights + storage)
- **lunar-planner** - Planejador lunar (usa astro + lunar-cycle + todo)
- **emotional-tracking** - Rastreamento emocional

## Diferença: Feature vs Domínio

| Aspecto | Domínio | Feature |
|---------|---------|---------|
| **Responsabilidade** | Negócio específico | Composição de domínios |
| **Dependências** | Poucos | Múltiplos domínios |
| **Componentes** | Específicos | Compostos |
| **Exemplos** | Todo, Astro | Sync, LunarPlanner |

## Importação

```typescript
import { useSyncEngine } from '@/features/sync';
import { LunarPlanner } from '@/features/lunar-planner';
```

## Princípios

1. **Orquestração** - Comanda múltiplos domínios
2. **Composição** - Usa componentes de domínios
3. **Re-uso** - Pode ser usado em múltiplas páginas
4. **Documentação** - README.md obrigatório
