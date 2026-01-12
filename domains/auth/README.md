# Auth Domain

Gerencia autenticação, tokens e sessões de usuário.

## Estrutura

- `components/` - Componentes de autenticação
- `hooks/` - Lógica de autenticação (useAuth, useAuthChatFlow)
- `services/` - Gerenciamento de tokens e validação
- `types/` - Tipos de autenticação
- `constants.ts` - Constantes

## Responsabilidades

- Validar credenciais
- Gerenciar tokens JWT
- Manter sessão de usuário
- Autenticação com providers (Google, GitHub)

## Dependências

- `@/shared/storage` - Persistência
- `@/shared/api` - HTTP requests

## Uso

```typescript
import { useAuth, type AuthToken } from '@/domains/auth';

function MyComponent() {
  const { user, isLoading, error } = useAuth();
  
  if (isLoading) return <div>Carregando...</div>;
  
  return <div>Bem-vindo, {user?.email}</div>;
}
```

## Roadmap

- [ ] Mover components/auth/ para components/
- [ ] Mover hooks/useAuth.ts para hooks/
- [ ] Consolidar lib/auth.ts em services/
- [ ] Criar types/auth.ts
- [ ] Criar index.ts barrel export
