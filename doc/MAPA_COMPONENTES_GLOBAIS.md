# 📦 Mapa de Componentes Globais - Cosmic Space

## 🗂️ Estrutura Atual

### 📍 Localização Física
```
components/
├── AuthGate.tsx              (Proteção de autenticação)
├── AutoSyncLunar.tsx         (Sincronização automática lunar)
├── EmotionalInput.tsx        (Input de emoções)
├── GalaxySunsSync.tsx        (Sincronização galaxia/sol)
├── LunationSync.tsx          (Sincronização de lunações)
├── MenstrualTracker.tsx      (Rastreador menstrual)
├── MoonCycleExample.tsx      (Exemplo de ciclo lunar)
├── NavMenu.tsx               (Menu de navegação)
├── RadioPlayer.tsx           (Player de rádio)
├── SfxProvider.tsx           (Provider de efeitos sonoros)
├── SpacePageLayout.tsx       (Layout padrão das páginas)
├── home/
│   ├── EmailSignupForm.tsx
│   └── EmailSubscribeLanding.tsx
└── timeline/
    ├── TimelineFilters.tsx
    ├── TimelineItemCard.tsx
    └── TimelinePagination.tsx
```

---

## 📊 Classificação e Análise

### 🔐 Componentes de Proteção & Autenticação

| Arquivo | Tipo | Props | Estado | Context | Descrição |
|---------|------|-------|--------|---------|-----------|
| **AuthGate** | Client | `children` | Login/Signup forms | `useAuth` | Porta de entrada para autenticação, protege conteúdo autenticado |

---

### 🎯 Providers & Context Globais

| Arquivo | Tipo | Props | Estado | Provider | Descrição |
|---------|------|-------|--------|----------|-----------|
| **SfxProvider** | Client | `children` | `enabled: boolean` | `SfxContext` | Gerencia efeitos sonoros globais |

**Uso no layout raiz:**
```tsx
<SfxProvider>
  {children}
</SfxProvider>
```

---

### 🎨 Layouts Compartilhados

| Arquivo | Tipo | Props | Estado | Descrição |
|---------|------|-------|--------|-----------|
| **SpacePageLayout** | Client | `children, className, allowBackNavigation` | `onBackgroundClick` | Wrapper para páginas com SpaceBackground |

**Características:**
- Renderiza `SpaceBackground` automático
- Suporta navegação para trás ao clicar no fundo
- Memo para performance

---

### 🔄 Sincronizações Automáticas

| Arquivo | Tipo | Requisitos | Função | Status |
|---------|------|-----------|--------|--------|
| **AutoSyncLunar** | Client | `useAuth`, `getLunarPhaseAndSign` | Sincroniza fase lunar ao autenticar | ✅ Funcional |
| **LunationSync** | Client | Aceita `autoSync` e `verbose` | Sincroniza lunações do banco | ✅ Funcional |
| **GalaxySunsSync** | Client | `autoSync?` prop | Placeholder - sem implementação | ⚠️ Stub |

**Uso no layout raiz:**
```tsx
<AutoSyncLunar />
<LunationSync autoSync={true} verbose={false} />
<GalaxySunsSync autoSync={true} />
```

---

### 🎵 Componentes de Interação

| Arquivo | Tipo | Estado | Descrição |
|---------|------|--------|-----------|
| **NavMenu** | Client | Menu de navegação | Menu principal da aplicação |
| **RadioPlayer** | Client | Player de áudio | Player de rádio persistente |

**Uso no layout raiz:**
```tsx
<NavMenu />
{children}
<RadioPlayer />
```

---

### 📋 Componentes de Domínio Específico

#### Home
| Arquivo | Tipo | Responsabilidade |
|---------|------|-----------------|
| **EmailSignupForm** | Form | Signup por email |
| **EmailSubscribeLanding** | Landing | Page de inscrição |

#### Timeline
| Arquivo | Tipo | Responsabilidade |
|---------|------|-----------------|
| **TimelineFilters** | Component | Filtros da timeline |
| **TimelineItemCard** | Component | Card individual |
| **TimelinePagination** | Component | Paginação |

#### Outros
| Arquivo | Tipo | Responsabilidade |
|---------|------|-----------------|
| **EmotionalInput** | Form | Input de emoções |
| **MenstrualTracker** | Component | Rastreador menstrual |
| **MoonCycleExample** | Example | Exemplo de ciclo lunar |

---

## 🏗️ Estrutura do Layout Raiz

### Arquivo: [app/layout.tsx](app/layout.tsx)

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SfxProvider>                         {/* Provider de sons */}
          <NavMenu />                          {/* Menu sempre visível */}
          <AutoSyncLunar />                    {/* Sincroniza fase lunar */}
          <LunationSync autoSync={true} />     {/* Sincroniza lunações */}
          <GalaxySunsSync autoSync={true} />   {/* Placeholder */}
          {children}                           {/* Rotas */}
          <RadioPlayer />                      {/* Player de rádio */}
        </SfxProvider>
      </body>
    </html>
  );
}
```

---

## 🔍 Dependências Entre Componentes

```
SfxProvider
  └── useSfxContext() → SfxContext

AuthGate
  └── useAuth() → Autenticação

AutoSyncLunar
  ├── useAuth() → Verifica autenticação
  └── getLunarPhaseAndSign() → Calcula fase lunar

SpacePageLayout
  └── SpaceBackground (importado de app/cosmos/components)
```

---

## 🎯 Recomendações de Consolidação

### 1. **Separar componentes por categoria**
```
components/
├── providers/              (NEW)
│   └── SfxProvider.tsx
├── layouts/                (NEW)
│   ├── SpacePageLayout.tsx
│   └── RootLayout.tsx
├── auth/                   (NEW)
│   └── AuthGate.tsx
├── sync/                   (NEW)
│   ├── AutoSyncLunar.tsx
│   ├── LunationSync.tsx
│   └── GalaxySunsSync.tsx
├── navigation/             (NEW)
│   └── NavMenu.tsx
├── audio/                  (NEW)
│   └── RadioPlayer.tsx
├── home/                   (EXISTING)
├── timeline/               (EXISTING)
└── shared/                 (NEW - UI primitives)
```

### 2. **Consolidar sincronizações em um único hook**
```tsx
// hooks/useGlobalSync.ts
export function useGlobalSync() {
  return {
    lunar: useAutoSyncLunar(),
    lunations: useLunationSync(),
    galaxySuns: useGalaxySunsSync(),
  };
}

// Uso em layout:
const sync = useGlobalSync();
```

### 3. **Componente SyncManager unificado**
```tsx
<SyncManager autoSync={{ lunar: true, lunations: true, galaxySuns: true }} />
```

### 4. **Documentar padrão de providers**
- Quais providers são obrigatórios?
- Qual é a ordem de composição correta?
- Quais são as dependências?

### 5. **Implementar GalaxySunsSync**
Atualmente é um stub vazio. Definir sua responsabilidade ou remover.

---

## ✅ Checklist de Consolidação

- [ ] Criar estrutura de pastas `components/{providers,layouts,auth,sync,navigation,audio}`
- [ ] Mover componentes para novas pastas
- [ ] Atualizar imports em `app/layout.tsx`
- [ ] Criar `hooks/useGlobalSync.ts`
- [ ] Consolidar providers em `components/RootLayout.tsx`
- [ ] Atualizar imports em outras rotas
- [ ] Documentar padrão de composição
- [ ] Remover ou implementar `GalaxySunsSync`
- [ ] Adicionar testes para componentes críticos

---

## 📝 Notas

- **AutoSyncLunar**: Sincroniza manualmente uma única vez. Considerar nomear como `LunarPhaseSync`
- **LunationSync**: Parece ser mais completo. Documentar diferença com AutoSyncLunar
- **GalaxySunsSync**: Verificar se é necessário ou pode ser removido
- **SpacePageLayout**: Verificar se é usado em todas as rotas ou se pode ser aplicado via layout.tsx

