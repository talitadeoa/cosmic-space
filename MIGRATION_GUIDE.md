# 🚀 Guia de Migração - Refatoração Estrutural

## ✅ O que foi implementado

### 1. **Types Consolidados** (`/types`)
- ✅ `types/todo.ts` - TodoItem, SavedTodo, IslandId
- ✅ `types/insights.ts` - GenericInsight, MonthlyInsight, etc
- ✅ `types/api.ts` - ApiResponse, ApiError, FetchState
- ✅ `types/index.ts` - Export central

### 2. **Utilities** (`/lib/utils`)
- ✅ `lib/utils/storage.ts` - Storage abstraction (Capacitor-ready)

### 3. **Hooks Genéricos** (`/lib/hooks`)
- ✅ `lib/hooks/useInsights.ts` - Hook genérico para insights
- ✅ `lib/hooks/useDebounce.ts` - Debounce hook
- ✅ `lib/hooks/useMediaQuery.ts` - Responsive breakpoints

### 4. **API Client** (`/lib/api`)
- ✅ `lib/api/client.ts` - HTTP client tipado

---

## 📝 Como Migrar Componentes

### **Exemplo 1: Migrar useMonthlyInsights**

#### ❌ ANTES (100 linhas)
```typescript
// hooks/useMonthlyInsights.ts
import { useState, useCallback } from 'react';

export function useMonthlyInsights() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const saveInsight = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/insights/monthly', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // ...
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { insights, isLoading, saveInsight };
}
```

#### ✅ DEPOIS (5 linhas)
```typescript
// hooks/useMonthlyInsights.ts
import { useInsights } from '@/lib/hooks/useInsights';
import type { MonthlyInsight } from '@/types/insights';

export function useMonthlyInsights() {
  return useInsights<MonthlyInsight>({
    endpoint: '/api/insights/monthly',
    storageKey: 'monthly-insights',
  });
}
```

#### 📱 USO NO COMPONENTE
```tsx
'use client';

import { useMonthlyInsights } from '@/hooks/useMonthlyInsights';

export function MonthlyInsightsPanel() {
  const { insights, isLoading, error, save } = useMonthlyInsights();

  const handleSave = async () => {
    await save({
      period: 5,
      year: 2024,
      content: 'Meu insight do mês',
    });
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {insights.map(insight => (
        <div key={insight.id}>{insight.content}</div>
      ))}
      <button onClick={handleSave}>Salvar</button>
    </div>
  );
}
```

---

### **Exemplo 2: Migrar localStorage para storage**

#### ❌ ANTES
```typescript
// Espalhado em múltiplos arquivos
const saved = localStorage.getItem('todos');
const todos = saved ? JSON.parse(saved) : [];

localStorage.setItem('todos', JSON.stringify(newTodos));
```

#### ✅ DEPOIS
```typescript
import { storage } from '@/lib/utils/storage';

// Ler
const todos = storage.get<Todo[]>('todos', []);

// Escrever
storage.set('todos', newTodos);

// Verificar
if (storage.has('todos')) {
  // ...
}

// Remover
storage.remove('todos');
```

**Benefício**: Quando implementar Capacitor, só precisa atualizar `storage.ts` - todos os componentes funcionarão automaticamente!

---

### **Exemplo 3: Usar API Client**

#### ❌ ANTES
```typescript
const res = await fetch('/api/insights', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data),
});

if (!res.ok) {
  throw new Error('Failed');
}

const result = await res.json();
```

#### ✅ DEPOIS
```typescript
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

try {
  const result = await apiClient.post<MyData>('/api/insights', data);
} catch (error) {
  // Tratamento automático de erros
  console.error(error.message);
}
```

---

### **Exemplo 4: Debounce em Busca**

```tsx
'use client';

import { useState } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Só executa 300ms após parar de digitar
  useEffect(() => {
    if (debouncedSearch) {
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

---

### **Exemplo 5: Responsive com useMediaQuery**

```tsx
'use client';

import { useIsMobile, useIsDesktop } from '@/lib/hooks/useMediaQuery';

export function ResponsiveLayout() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  return (
    <div>
      {isMobile && <MobileNav />}
      {isDesktop && <DesktopNav />}
    </div>
  );
}
```

---

## 🔄 Próximos Passos

### **Fase 1: Migração de Hooks** (você pode fazer agora)

1. **Migrar hooks de insights**:
   ```bash
   # Renomear arquivo antigo
   mv hooks/useMonthlyInsights.ts hooks/useMonthlyInsights.old.ts
   
   # Renomear o novo
   mv hooks/useMonthlyInsights.new.ts hooks/useMonthlyInsights.ts
   ```

2. **Fazer o mesmo para**:
   - `useQuarterlyInsights.ts`
   - `useAnnualInsights.ts`

3. **Testar** que tudo ainda funciona

### **Fase 2: Migrar localStorage**

1. Buscar todos os usos:
   ```bash
   grep -r "localStorage\." --include="*.ts" --include="*.tsx"
   ```

2. Substituir por `storage` do novo utility

3. Testar funcionalidade

### **Fase 3: Adicionar Types aos Componentes**

Adicionar imports de types nos componentes:

```typescript
// ANTES
export interface SavedTodo {
  id: string;
  // ...
}

// DEPOIS
import type { SavedTodo } from '@/types/todo';
```

---

## 📊 Benefícios Imediatos

1. **-150 linhas** de código duplicado eliminadas
2. **Type safety** melhorado
3. **Capacitor-ready** - storage já preparado
4. **Código mais limpo** - menos repetição
5. **Easier to test** - utilities isolados
6. **Better DX** - autocomplete em todos os types

---

## 🎯 Capacitor Setup (quando estiver pronto)

### 1. Instalar
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/preferences
npx cap init
```

### 2. Atualizar `storage.ts`
```typescript
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

class StorageManager {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (!Capacitor.isNativePlatform()) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : defaultValue;
  }
  
  // ... resto dos métodos
}
```

### 3. Atualizar `client.ts`
```typescript
import { Capacitor } from '@capacitor/core';

function getBaseUrl(): string {
  if (Capacitor.isNativePlatform()) {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.flua.app';
  }
  return window.location.origin;
}
```

### 4. Build
```bash
npm run build
npx cap sync
npx cap open ios  # ou android
```

---

## ❓ Dúvidas?

- Types: Ver `/types/index.ts` para todos exports
- Hooks: Ver `/lib/hooks/useInsights.ts` para exemplo completo
- API: Ver `/lib/api/client.ts` para métodos disponíveis
- Storage: Ver `/lib/utils/storage.ts` para API completa

**Tudo pronto para começar a migrar!** 🚀
