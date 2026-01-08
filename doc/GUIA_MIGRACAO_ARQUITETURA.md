# 🚀 Guia de Migração: Passo-a-Passo

## Visão Geral

Este documento descreve como migrar o projeto Cosmic Space da arquitetura caótica atual para a arquitetura proposta com domínios bem definidos.

**Tempo estimado:** 2-3 semanas (dependendo de paralelização)

**Risco:** BAIXO (mudanças estruturais, não lógicas)

---

## Fases da Migração

### Fase 1: Preparação (1-2 horas)
### Fase 2: Compartilhado (2-3 horas)
### Fase 3: Domínios (5-7 dias)
### Fase 4: Features (2-3 dias)
### Fase 5: Validação (1-2 dias)

---

## Fase 1: Preparação ✅

### Passo 1.1: Criar Branches

```bash
# Branch para a nova arquitetura
git checkout -b refactor/architecture-cleanup

# Branch de backup (segurança)
git branch backup/architecture-current
```

### Passo 1.2: Criar Estrutura de Pastas

```bash
# Criar domínios
mkdir -p domains/{astro,lunar-cycle,todo,insights,community,auth}

# Criar shared
mkdir -p shared/{ui/primitives,ui/layouts,ui/feedback,hooks,utils,storage,api,providers,types}

# Criar features
mkdir -p features/{sync,lunar-planner,emotional-tracking}

# Criar README para cada pasta
touch domains/README.md shared/README.md features/README.md

echo "# Domínios\n\nDomínios de negócio do projeto." > domains/README.md
echo "# Shared\n\nInfraestrutura e componentes compartilhados." > shared/README.md
echo "# Features\n\nFeatures compostas que usam múltiplos domínios." > features/README.md
```

### Passo 1.3: Atualizar `tsconfig.json`

**File: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/shared/*": ["./shared/*"],
      "@/domains/*": ["./domains/*"],
      "@/features/*": ["./features/*"],
      "@/app/*": ["./app/*"],
      "@/types": ["./shared/types/index"],
      "@/lib": ["./lib/index"]
    }
  }
}
```

### Passo 1.4: Commit

```bash
git add -A
git commit -m "chore: create new folder structure for architecture refactor"
```

---

## Fase 2: Consolidar Compartilhado (2-3 horas)

### Passo 2.1: UI Primitives

**Objetivo:** Uma única Card.tsx em `shared/ui/primitives/`

```bash
# Criar arquivo único consolidando ambas as versões
cat > shared/ui/primitives/Card.tsx << 'EOF'
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  interactive = false,
  onClick,
  variant = 'default',
  hoverEffect = true,
}) => {
  const variants = {
    default: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_0_40px_rgba(148,163,184,0.45)]',
    outlined: 'bg-transparent border-2 border-white/30',
    elevated: 'bg-white/15 backdrop-blur-xl border border-white/40 shadow-lg',
  };

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      whileHover={hoverEffect && interactive ? { scale: 1.02 } : {}}
      className={[
        'rounded-3xl p-6',
        variants[variant],
        interactive && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </motion.div>
  );
};
EOF
```

**Criar index.ts:**

```bash
cat > shared/ui/primitives/index.ts << 'EOF'
export { Card } from './Card';
// Adicionar outros primitivos conforme necessário
EOF
```

**Criar index.ts da pasta ui:**

```bash
cat > shared/ui/index.ts << 'EOF'
export * from './primitives';
// export * from './layouts';
// export * from './feedback';
EOF
```

### Passo 2.2: Mover Hooks Genéricos

Identifique hooks que são genéricos (não específicos de um domínio):

```bash
# Copiar hooks genéricos para shared/hooks/
cp hooks/useAsync.ts shared/hooks/ 2>/dev/null || true
cp hooks/useLocalStorage.ts shared/hooks/ 2>/dev/null || true
cp hooks/useScreenStack.ts shared/hooks/ 2>/dev/null || true

# Criar index.ts
cat > shared/hooks/index.ts << 'EOF'
export { useAsync } from './useAsync';
export { useLocalStorage } from './useLocalStorage';
export { useScreenStack } from './useScreenStack';
EOF
```

### Passo 2.3: Mover Storage/Persistence

```bash
# Copiar arquivos de persistência
cp lib/persistence/PersistenceHub.ts shared/storage/
cp lib/persistence/StorageAdapter.ts shared/storage/
cp lib/persistence/WebStorageAdapter.ts shared/storage/

# Criar index.ts
cat > shared/storage/index.ts << 'EOF'
export { PersistenceHub } from './PersistenceHub';
export { StorageAdapter } from './StorageAdapter';
export { WebStorageAdapter } from './WebStorageAdapter';
export { getPersistenceHub } from './PersistenceHub';
EOF
```

### Passo 2.4: Criar Tipos Compartilhados

**File: `shared/types/common.ts`**

```typescript
/**
 * Tipos que transcendem domínios
 * Exemplos: User, Session, ApiResponse
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface Session {
  token: string;
  expiresAt: Date;
  user: User;
}
```

**File: `shared/types/index.ts`**

```typescript
export type { User, Session } from './common';
```

### Passo 2.5: Commit

```bash
git add -A
git commit -m "chore: consolidate shared UI, hooks, and storage"
```

---

## Fase 3: Refatorar Domínios (5-7 dias)

Migre um domínio por vez. Ordem recomendada:

1. **auth** (base para outros)
2. **todo** (tamanho médio, bem definido)
3. **astro** (pequeno, independente)
4. **lunar-cycle** (pequeno, independente)
5. **insights** (médio, depende de outros)
6. **community** (pequeno, independente)

### Passo 3.1: Migrar Domínio `auth`

**Passo 3.1.1: Copiar arquivos**

```bash
# Components
mkdir -p domains/auth/components
cp app/cosmos/auth/components/*.tsx domains/auth/components/ 2>/dev/null || true
cp components/auth/*.tsx domains/auth/components/ 2>/dev/null || true

# Hooks
mkdir -p domains/auth/hooks
cp hooks/useAuth.ts domains/auth/hooks/ 2>/dev/null || true
cp components/auth/AuthChatFlow.tsx domains/auth/components/ 2>/dev/null || true

# Services
mkdir -p domains/auth/services
cp lib/auth.ts domains/auth/services/authService.ts 2>/dev/null || true

# Types
mkdir -p domains/auth/types
touch domains/auth/types/auth.ts
```

**Passo 3.1.2: Atualizar imports internos**

```bash
# Em domains/auth/components/AuthFlow.tsx
# Trocar: import { useAuth } from '@/hooks'
# Por: import { useAuth } from '../hooks'

# Em domains/auth/hooks/useAuth.ts
# Trocar: import { validateToken } from '@/lib/auth'
# Por: import { validateToken } from '../services/authService'
```

**Passo 3.1.3: Criar barrel exports**

**File: `domains/auth/types/index.ts`**

```typescript
export type { AuthToken, User, Session } from './auth';
```

**File: `domains/auth/hooks/index.ts`**

```typescript
export { useAuth } from './useAuth';
export { useAuthChatFlow } from './useAuthChatFlow';
```

**File: `domains/auth/components/index.ts`**

```typescript
export { AuthFlow } from './AuthFlow';
export { LoginForm } from './LoginForm';
export { LogoutButton } from './LogoutButton';
```

**File: `domains/auth/services/index.ts`**

```typescript
export { validateToken, createAuthToken, getTokenPayload } from './authService';
```

**File: `domains/auth/constants.ts`**

```typescript
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_STORAGE_KEY = 'auth_session';
```

**File: `domains/auth/index.ts`** (Barrel final)

```typescript
// Components
export * from './components';

// Hooks
export * from './hooks';

// Services
export * from './services';

// Types
export * from './types';

// Constants
export { AUTH_TOKEN_KEY, AUTH_STORAGE_KEY } from './constants';
```

**Passo 3.1.4: Adicionar README**

**File: `domains/auth/README.md`**

```markdown
# Auth Domain

Gerencia autenticação, tokens e sessões de usuário.

## Estrutura

- `components/` - UI de autenticação (LoginForm, AuthFlow)
- `hooks/` - useAuth, useAuthChatFlow
- `services/` - Gerenciamento de tokens e validação
- `types/` - Tipos de autenticação
- `constants.ts` - Constantes de auth

## Responsabilidades

- Validar credenciais
- Gerenciar tokens JWT
- Manter sesão de usuário
- Autenticação com providers (Google, GitHub)

## Dependências

- `@/shared/storage` (persistência)
- `@/shared/api` (HTTP requests)

## Uso

```typescript
import { useAuth, type User } from '@/domains/auth';

function MyComponent() {
  const { user, login, logout } = useAuth();
  return <div>{user?.email}</div>;
}
```
```

**Passo 3.1.5: Testar imports**

```bash
# Verificar que a aplicação ainda compila
npm run build 2>&1 | head -20
```

### Passo 3.2: Migrar Domínio `todo`

Seguir os mesmos passos que `auth`, mas com:

```bash
# Components
mkdir -p domains/todo/components
cp app/cosmos/components/TodoInput.tsx domains/todo/components/
cp app/cosmos/components/Card.tsx domains/todo/components/TodoCard.tsx
# ... etc

# Hooks
mkdir -p domains/todo/hooks
cp hooks/usePlanetTodos.ts domains/todo/hooks/
cp hooks/useFilteredTodos.ts domains/todo/hooks/
# ... etc

# Services
mkdir -p domains/todo/services
cp lib/planetTodos.ts domains/todo/services/
cp app/cosmos/utils/todoStorage.ts domains/todo/services/
cp app/cosmos/utils/islandNames.ts domains/todo/services/
# ... etc

# Types
mkdir -p domains/todo/types
cp types/todo.ts domains/todo/types/
# ... criar types adicionais
```

### Passo 3.3: Migrar Outros Domínios

Repetir o padrão para:
- `astro` (lib/astro.ts → services)
- `lunar-cycle` (lib/lunar-cycle-utils.ts, lib/lunation-utils.ts)
- `insights` (hooks/useMonthlyInsights.ts, etc)
- `community` (app/comunidade/components)

### Passo 3.4: Commit por Domínio

```bash
git add -A
git commit -m "refactor: migrate auth domain to new structure"

git add -A
git commit -m "refactor: migrate todo domain to new structure"

# ... etc
```

---

## Fase 4: Refatorar Features (2-3 dias)

### Passo 4.1: Sync Feature

```bash
mkdir -p features/sync/{components,hooks,services,types}

# Copiar código da sincronização
# Que usa múltiplos domínios
```

**File: `features/sync/README.md`**

```markdown
# Sync Feature

Orquestra sincronização entre domínios.

## Dependências

- `@/domains/auth`
- `@/domains/todo`
- `@/domains/insights`
- `@/shared/storage`
```

### Passo 4.2: Emotional Tracking Feature

```bash
mkdir -p features/emotional-tracking/{components,hooks,services,types}
```

---

## Fase 5: Validação & Cleanup (1-2 dias)

### Passo 5.1: Atualizar Imports Globalmente

Use Find & Replace em todo o projeto:

```bash
# Usando sed (macOS/Linux)
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  's|@/app/cosmos/components|@/domains/todo/components|g'

find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  's|@/hooks/usePlanetTodos|@/domains/todo/hooks|g'

find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  's|@/types/todo|@/domains/todo/types|g'

# ... etc para todos os domínios
```

### Passo 5.2: Remover Duplicatas

```bash
# Deletar Card.tsx duplicadas
rm app/cosmos/components/Card.tsx
rm components/shared/cosmos/Card.tsx

# Deletar tipos legados
rm types/moon.ts
rm types/todo.ts
# ... (após confirmar que foram migradas)
```

### Passo 5.3: Testar Build

```bash
# Limpar cache
rm -rf .next .turbo node_modules/.cache

# Build
npm run build

# Verificar erros
echo "Build status: $?"
```

### Passo 5.4: Testar Aplicação

```bash
npm run dev

# Testar fluxos principais:
# - Login
# - Criar todo
# - Ver calendario lunar
# - Sincronizar
# - Ver insights
```

### Passo 5.5: Lint & Format

```bash
# Format
npx prettier --write . --ignore-path .gitignore

# Lint
npx eslint . --fix 2>&1 | head -20
```

### Passo 5.6: Commit Final

```bash
git add -A
git commit -m "refactor: complete architecture migration

- Moved all components to domain-based structure
- Consolidated duplicate Card components
- Reorganized types and utilities
- Created barrel exports for all domains
- Updated all imports to use new paths
- Added README documentation for each domain
- Removed legacy lib/ and types/ root files
"
```

---

## Scripts de Automação

### Script: Auto-migrate Domain

**File: `scripts/migrate-domain.sh`**

```bash
#!/bin/bash

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
  echo "Usage: ./scripts/migrate-domain.sh <domain_name>"
  exit 1
fi

echo "🚀 Migrating domain: $DOMAIN"

# Create structure
mkdir -p "domains/$DOMAIN/{components,hooks,services,types}"

# Create index files
cat > "domains/$DOMAIN/components/index.ts" << EOF
// Export components from this domain
EOF

cat > "domains/$DOMAIN/hooks/index.ts" << EOF
// Export hooks from this domain
EOF

cat > "domains/$DOMAIN/services/index.ts" << EOF
// Export services from this domain
EOF

cat > "domains/$DOMAIN/types/index.ts" << EOF
// Export types from this domain
EOF

cat > "domains/$DOMAIN/constants.ts" << EOF
// Constants for $DOMAIN domain
EOF

cat > "domains/$DOMAIN/index.ts" << EOF
// Barrel export for $DOMAIN domain
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
EOF

cat > "domains/$DOMAIN/README.md" << EOF
# $DOMAIN Domain

TODO: Add description

## Structure

- \`components/\` - UI components
- \`hooks/\` - Custom hooks
- \`services/\` - Business logic
- \`types/\` - Type definitions

## Dependencies

TODO: List dependencies

## Usage

\`\`\`typescript
import { ... } from '@/domains/$DOMAIN';
\`\`\`
EOF

echo "✅ Domain $DOMAIN structure created"
echo "📂 Location: domains/$DOMAIN/"
echo "📝 TODO: Fill in components, hooks, services"
```

Usar:

```bash
chmod +x scripts/migrate-domain.sh
./scripts/migrate-domain.sh lunar-cycle
```

---

## Rollback Plan

Se algo der errado:

```bash
# Voltar para branch anterior
git checkout backup/architecture-current

# Ou reverter commits
git revert <commit-hash>

# Ou hard reset
git reset --hard <commit-hash>
```

---

## Checklist de Migração

### Preparação
- [ ] Branch criado (`refactor/architecture-cleanup`)
- [ ] Pasta structure criada
- [ ] tsconfig.json atualizado

### Compartilhado
- [ ] Card.tsx consolidada em `shared/ui/primitives/`
- [ ] Hooks genéricos em `shared/hooks/`
- [ ] Storage em `shared/storage/`
- [ ] Tipos compartilhados em `shared/types/`

### Domínios
- [ ] Auth migrado
- [ ] Todo migrado
- [ ] Astro migrado
- [ ] Lunar-cycle migrado
- [ ] Insights migrado
- [ ] Community migrado

### Features
- [ ] Sync feature criada
- [ ] Emotional-tracking feature criada
- [ ] Lunar-planner feature criada

### Validação
- [ ] Imports atualizados globalmente
- [ ] Duplicatas removidas
- [ ] Build sem erros
- [ ] Aplicação funciona
- [ ] Testes passam
- [ ] ESLint limpo

### Finalização
- [ ] Documentação atualizada
- [ ] README.md por domínio
- [ ] PR criado para revisão
- [ ] Code review aprovado
- [ ] Merge em main

---

## FAQ de Migração

### P: E se eu deletar um arquivo por engano?

A: Use `git checkout <commit>~1 -- <file>` para recuperar

### P: Como encontrar imports antigos?

A: Use grep:
```bash
grep -r "@/app/cosmos/components" --include="*.tsx" --include="*.ts"
```

### P: Quanto tempo leva?

A: 2-3 semanas (1-2 pessoas)
- Prep: 1-2h
- Compartilhado: 2-3h
- Domínios: 5-7 dias (paralelizar)
- Features: 2-3 dias
- Validação: 1-2 dias

### P: Posso fazer isso em paralelo?

A: Sim! Diferentes domínios podem ser migrados em paralelo, mas todos precisam do Passo 1

### P: Que risco tem?

A: BAIXO - Apenas reestruturação, sem mudanças lógicas. Todos os testes devem passar

---

## Documentação Pós-Migração

Após completar a migração, atualize:

1. `README.md` - Adicionar nova arquitetura
2. `CONTRIBUTING.md` - Guias para novos domínios
3. Wiki do projeto - Documentação interna
4. Runbooks - Se houver

---

## Próximos Passos

1. ✅ Revisar ARQUITETURA_PROPOSTA.md
2. ✅ Revisar EXEMPLOS_ARQUITETURA.md
3. 🔄 Seguir este guia passo-a-passo
4. 📚 Atualizar documentação após migração
5. 🚀 Enforçar novos padrões com ESLint

