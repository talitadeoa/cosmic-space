# 📍 Referência Rápida - Componentes Globais Consolidados

## 🎯 LOCALIZAÇÃO RÁPIDA

### 🔐 Autenticação
```tsx
import { AuthGate } from '@/components/auth';
// Arquivo: components/auth/AuthGate.tsx
```

### 🎨 Providers Globais
```tsx
import { SfxProvider, useSfxContext } from '@/components/providers';
// Arquivo: components/providers/SfxProvider.tsx
```

### 🎭 Layouts
```tsx
import { SpacePageLayout } from '@/components/layouts';
// Arquivo: components/layouts/SpacePageLayout.tsx
```

### 🔄 Sincronizações
```tsx
// AutoSyncLunar
import { AutoSyncLunar } from '@/components/sync';

// LunationSync + Hook
import { LunationSync, useSyncLunations } from '@/components/sync';

// GalaxySunsSync
import { GalaxySunsSync } from '@/components/sync';
```

### 🧭 Navegação
```tsx
import { NavMenu } from '@/components/navigation';
// Arquivo: components/navigation/NavMenu.tsx
```

### 🎵 Áudio
```tsx
import { RadioPlayer } from '@/components/audio';
// Arquivo: components/audio/RadioPlayer.tsx
```

---

## 💡 CASOS DE USO COMUNS

### Proteger uma rota
```tsx
import { AuthGate } from '@/components/auth';

export default function MyPage() {
  return (
    <AuthGate>
      <h1>Conteúdo protegido</h1>
    </AuthGate>
  );
}
```

### Layout com fundo espacial
```tsx
import { SpacePageLayout } from '@/components/layouts';

export default function MyPage() {
  return (
    <SpacePageLayout allowBackNavigation>
      <h1>Minha página</h1>
    </SpacePageLayout>
  );
}
```

### Sincronizar lunações
```tsx
import { useSyncLunations } from '@/components/sync';

export function SyncButton() {
  const { sync, isSyncing } = useSyncLunations();
  
  return (
    <button onClick={() => sync(2024)} disabled={isSyncing}>
      {isSyncing ? 'Sincronizando...' : 'Sincronizar 2024'}
    </button>
  );
}
```

### Usar sincronizações centralizadas
```tsx
import { useGlobalSync } from '@/hooks/useGlobalSync';

export function MyComponent() {
  const sync = useGlobalSync();
  // Acesso: sync.lunations.sync(year)
}
```

### Controlar áudio
```tsx
import { useSfxContext } from '@/components/providers';

export function SfxToggle() {
  const sfx = useSfxContext();
  
  return (
    <button onClick={() => sfx.toggle()}>
      SFX: {sfx.enabled ? 'ON' : 'OFF'}
    </button>
  );
}
```

---

## 🏗️ PADRÃO DO LAYOUT RAIZ

```
SfxProvider (Contexto de sons)
  ├── NavMenu (Navegação)
  ├── AutoSyncLunar (Sync automática fase lunar)
  ├── LunationSync (Sync lunações do banco)
  ├── GalaxySunsSync (Placeholder)
  ├── {children} (Rotas)
  └── RadioPlayer (Player flutuante)
```

---

## 📋 CHECKLIST: NOVA PÁGINA PROTEGIDA

- [ ] `import { AuthGate } from '@/components/auth'`
- [ ] Wrappear com `<AuthGate>`
- [ ] `import { SpacePageLayout } from '@/components/layouts'`
- [ ] Wrappear com `<SpacePageLayout>`
- [ ] Adicionar `allowBackNavigation={true}` se necessário

---

## ❌ ERROS COMUNS

| Erro | Solução |
|------|---------|
| Cannot find module `@/components/SfxProvider` | Use `@/components/providers` |
| Default export from `@/components/auth` | Use `import { AuthGate }` não `import AuthGate` |
| Sincronizações não funcionam | Verificar se `<LunationSync />` está em `app/layout.tsx` |

---

## 📚 DOCUMENTAÇÃO COMPLETA

- [COMPONENTES_GLOBAIS_CONSOLIDADOS.md](./COMPONENTES_GLOBAIS_CONSOLIDADOS.md) - Guia detalhado
- [MAPA_COMPONENTES_GLOBAIS.md](./MAPA_COMPONENTES_GLOBAIS.md) - Análise de cada componente
- [RESUMO_CONSOLIDACAO.md](./RESUMO_CONSOLIDACAO.md) - Visão geral do projeto

---

**Última atualização:** 28 de dezembro de 2025
