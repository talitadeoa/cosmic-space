# 🎯 Guia de Componentes Globais Consolidados

## 📦 Nova Estrutura de Pastas

```
components/
├── index.ts                    ← Exports centralizados
├── auth/
│   ├── AuthGate.tsx            ← Proteção de autenticação
│   └── index.ts
├── providers/
│   ├── SfxProvider.tsx         ← Provider de efeitos sonoros
│   └── index.ts
├── layouts/
│   ├── SpacePageLayout.tsx     ← Layout padrão com fundo espacial
│   └── index.ts
├── sync/
│   ├── AutoSyncLunar.tsx       ← Sincronização automática de fase lunar
│   ├── LunationSync.tsx        ← Sincronização de lunações do banco
│   ├── GalaxySunsSync.tsx      ← Placeholder para sincronização Galáxia/Sol
│   └── index.ts
├── navigation/
│   ├── NavMenu.tsx             ← Menu de navegação principal
│   └── index.ts
├── audio/
│   ├── RadioPlayer.tsx         ← Player de rádio/YouTube
│   └── index.ts
├── home/                        ← (Existente) Componentes de Home
├── timeline/                    ← (Existente) Componentes de Timeline
└── shared/                      ← (Futuro) Componentes UI primitivos
```

---

## 📥 Como Usar os Novos Imports

### ❌ Antes (Caminhos Antigos)
```tsx
import AuthGate from '@/components/AuthGate';
import SfxProvider from '@/components/SfxProvider';
import { SpacePageLayout } from '@/components/SpacePageLayout';
import { LunationSync } from '@/components/LunationSync';
import NavMenu from '@/components/NavMenu';
import RadioPlayer from '@/components/RadioPlayer';
```

### ✅ Depois (Novos Caminhos)
```tsx
import { AuthGate } from '@/components/auth';
import { SfxProvider } from '@/components/providers';
import { SpacePageLayout } from '@/components/layouts';
import { LunationSync } from '@/components/sync';
import { NavMenu } from '@/components/navigation';
import { RadioPlayer } from '@/components/audio';

// Ou usando imports centralizados:
import { AuthGate, SfxProvider, SpacePageLayout, NavMenu, RadioPlayer } from '@/components';
```

---

## 🔄 Sincronizações Globais

### Componentes de Sincronização

| Componente | Propósito | Localização | Status |
|-----------|----------|-----------|--------|
| **AutoSyncLunar** | Sincroniza fase lunar ao autenticar | `@/components/sync` | ✅ Funcional |
| **LunationSync** | Sincroniza lunações do banco | `@/components/sync` | ✅ Funcional |
| **GalaxySunsSync** | Sincroniza Galáxia/Sol | `@/components/sync` | ⚠️ Stub |

### Uso no Layout Raiz

```tsx
// app/layout.tsx
import { SfxProvider } from '@/components/providers';
import { NavMenu } from '@/components/navigation';
import { RadioPlayer } from '@/components/audio';
import { AutoSyncLunar, LunationSync, GalaxySunsSync } from '@/components/sync';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <SfxProvider>
          <NavMenu />
          <AutoSyncLunar />
          <LunationSync autoSync={true} verbose={false} />
          <GalaxySunsSync autoSync={true} />
          {children}
          <RadioPlayer />
        </SfxProvider>
      </body>
    </html>
  );
}
```

---

## 🎯 Hook Centralizado para Sincronizações

Use `useGlobalSync()` para gerenciar todas as sincronizações:

```tsx
import { useGlobalSync } from '@/hooks/useGlobalSync';

export function MyComponent() {
  const sync = useGlobalSync();

  async function syncYear() {
    try {
      const result = await sync.lunations.sync(2024);
      console.log('Sincronização completa:', result);
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  return <button onClick={syncYear}>Sincronizar 2024</button>;
}
```

---

## 📋 Checklist de Migração

- [x] Criar estrutura de pastas (`auth/`, `providers/`, `layouts/`, `sync/`, `navigation/`, `audio/`)
- [x] Mover componentes para novas pastas
- [x] Criar arquivos `index.ts` em cada pasta
- [x] Criar `components/index.ts` centralizado
- [x] Atualizar `app/layout.tsx` com novos imports
- [x] Atualizar imports em 15+ rotas (galaxia, emocoes, ciclos, perfil, home, comunidade, sol, lua, planeta, eclipse, timeline, cosmos/auth, logs, etc)
- [x] Criar `hooks/useGlobalSync.ts`
- [x] Documentar padrão consolidado

---

## 🚀 Próximos Passos

### 1. **Implementar GalaxySunsSync**
```tsx
// components/sync/GalaxySunsSync.tsx
// TODO: Adicionar lógica real de sincronização
```

### 2. **Criar `components/shared/`**
Para componentes UI primitivos reutilizáveis:
- Botões
- Cards
- Modais
- Inputs
- etc.

### 3. **Consolidar Providers em um Único Wrapper**
```tsx
// components/RootProviders.tsx
export function RootProviders({ children }) {
  return (
    <SfxProvider>
      <AutoSyncLunar />
      <LunationSync />
      <GalaxySunsSync />
      {children}
    </SfxProvider>
  );
}
```

### 4. **Adicionar Testes**
- Testes unitários para componentes críticos
- Testes de integração para sincronizações

---

## 📚 Referência Rápida

### Autenticação
```tsx
import { AuthGate } from '@/components/auth';

<AuthGate>
  {/* Conteúdo protegido */}
</AuthGate>
```

### Layouts
```tsx
import { SpacePageLayout } from '@/components/layouts';

<SpacePageLayout allowBackNavigation>
  {/* Conteúdo */}
</SpacePageLayout>
```

### Hooks de Sincronização
```tsx
import { useSyncLunations } from '@/components/sync';

const { sync, isSyncing } = useSyncLunations();
await sync(2024);
```

---

## ✨ Benefícios da Consolidação

✅ **Organização Clara** - Componentes globais separados por responsabilidade
✅ **Imports Consistentes** - Padrão único para todos os componentes
✅ **Fácil Manutenção** - Localizar componentes é mais rápido
✅ **Escalabilidade** - Estrutura pronta para crescimento
✅ **Documentação** - Cada pasta tem seu propósito claro
✅ **DRY** - Evita duplicação de código

---

## 🔗 Compatibilidade

- ✅ Mantém backward compatibility com documentação existente
- ✅ Todos os imports antigos podem ser atualizados gradualmente
- ✅ Novos projetos devem usar novos caminhos

---

**Última atualização:** 28 de dezembro de 2025
**Status:** ✅ Implementação Completa
