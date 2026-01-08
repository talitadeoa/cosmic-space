# Shared - Infraestrutura e Componentes Compartilhados

Código reutilizável que não é específico de nenhum domínio.

## Estrutura

- **ui/primitives/** - Componentes genéricos (Button, Card, Modal)
- **ui/layouts/** - Layouts reutilizáveis
- **ui/feedback/** - Feedback visual (Loading, Toast, EmptyState)
- **hooks/** - Custom hooks genéricos (useAsync, useLocalStorage)
- **utils/** - Funções utilitárias (formatters, validators)
- **storage/** - Persistência (StorageAdapter, PersistenceHub)
- **api/** - HTTP client e interceptadores
- **providers/** - Context providers globais (Auth, Theme)
- **types/** - Tipos que transcendem domínios (User, Session)

## Princípios

1. **Isolado** - shared/ NÃO importa de domains/
2. **Reutilizável** - Cada arquivo pode ser usado em múltiplos domínios
3. **Genérico** - Sem lógica específica de negócio
4. **Well-documented** - Fácil de entender e usar

## Importação

```typescript
import { Card, Button } from '@/shared/ui/primitives';
import { useAsync } from '@/shared/hooks';
import { formatDate } from '@/shared/utils/formatters';
```

## Evitar

- ❌ Lógica de negócio específica
- ❌ Tipos que conhecem domínios
- ❌ Componentes muito customizados
- ❌ Dependência de domínios
