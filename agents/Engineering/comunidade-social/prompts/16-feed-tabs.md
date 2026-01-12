# Prompt 16: Componente FeedTabs

## Objetivo
Criar componente de abas para alternar entre feeds "Para você" e "Seguindo".

## Contexto
- Feed principal em `app/comunidade/page.tsx`
- API suportará `?feed=following` após Fase 2

## Instrução

Crie o arquivo `app/comunidade/components/FeedTabs.tsx`:

```typescript
'use client';

import { memo } from 'react';
import { SparklesIcon, UserGroupIcon } from './icons';

type FeedType = 'for-you' | 'following';

type FeedTabsProps = {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
  followingCount?: number;
  disabled?: boolean;
};

const tabs = [
  {
    id: 'for-you' as const,
    label: 'Para você',
    icon: SparklesIcon,
    description: 'Posts da comunidade toda',
  },
  {
    id: 'following' as const,
    label: 'Seguindo',
    icon: UserGroupIcon,
    description: 'Posts de quem você segue',
  },
];

/**
 * Abas para alternar entre feeds
 * Mobile: tabs horizontais
 * Desktop: pode ser usado inline no header
 */
export const FeedTabs = memo(function FeedTabs({
  activeTab,
  onTabChange,
  followingCount = 0,
  disabled = false,
}: FeedTabsProps) {
  return (
    <div className="flex gap-1 rounded-full border border-slate-800/70 bg-black/40 p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const isDisabled = disabled || (tab.id === 'following' && followingCount === 0);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={`
              relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
              transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
              ${isActive
                ? 'bg-indigo-500/20 text-indigo-200 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
              }
              ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            aria-pressed={isActive}
            aria-label={tab.description}
            title={
              tab.id === 'following' && followingCount === 0
                ? 'Siga alguém para ver posts aqui'
                : tab.description
            }
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            
            {/* Indicador de ativo */}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-indigo-400" />
            )}
          </button>
        );
      })}
    </div>
  );
});

/**
 * Variante compacta para mobile
 */
export const FeedTabsCompact = memo(function FeedTabsCompact({
  activeTab,
  onTabChange,
  followingCount = 0,
  disabled = false,
}: FeedTabsProps) {
  return (
    <div className="flex border-b border-slate-800/50">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const isDisabled = disabled || (tab.id === 'following' && followingCount === 0);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => !isDisabled && onTabChange(tab.id)}
            disabled={isDisabled}
            className={`
              relative flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium
              transition-colors
              ${isActive
                ? 'text-indigo-300'
                : 'text-slate-400 hover:text-slate-200'
              }
              ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
            `}
            aria-pressed={isActive}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            
            {/* Indicador inferior */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
            )}
          </button>
        );
      })}
    </div>
  );
});
```

## Export

Adicione ao `app/comunidade/components/index.ts`:

```typescript
export { FeedTabs, FeedTabsCompact } from './FeedTabs';
```

## Uso

```tsx
// No componente de página
const [feedType, setFeedType] = useState<'for-you' | 'following'>('for-you');
const [followingCount, setFollowingCount] = useState(0);

// ...

<FeedTabs
  activeTab={feedType}
  onTabChange={setFeedType}
  followingCount={followingCount}
/>

// Ou variante compacta para mobile
<FeedTabsCompact
  activeTab={feedType}
  onTabChange={setFeedType}
  followingCount={followingCount}
/>
```

## Estados

| Estado | Comportamento |
|--------|---------------|
| Ativo | Background indigo, texto claro, indicador |
| Inativo | Texto slate, hover mais claro |
| Desabilitado | Opaco, cursor not-allowed, tooltip |
| Seguindo vazio | Tab "Seguindo" desabilitada com tooltip |

## Validação
- [ ] Tabs alternam corretamente
- [ ] Tab "Seguindo" desabilitada se followingCount = 0
- [ ] Tooltip explica quando desabilitado
- [ ] Indicador visual de aba ativa
- [ ] Acessível (aria-pressed, aria-label)
- [ ] Responsivo

## Próximo Passo
→ Task 4.3: Integrar Tabs no Feed Principal
