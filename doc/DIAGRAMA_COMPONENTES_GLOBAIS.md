# 🎨 Diagrama Visual - Arquitetura de Componentes Globais

## Hierarquia de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     app/layout.tsx                           │
│              (Layout Raiz - RootLayout)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼────────────┐    ┌────────▼─────────┐
    │  SfxProvider    │    │  Global Sync     │
    │  (Contexto)     │    │  Components      │
    │                 │    │                  │
    │  ├─ enabled     │    │ ├─ AutoSyncLunar │
    │  └─ toggle()    │    │ ├─ LunationSync  │
    │                 │    │ └─ GalaxySunsSync│
    └────┬────────────┘    └────────┬─────────┘
         │                          │
         │         ┌────────────────┼────────────────┐
         │         │                │                │
    ┌────▼─────┐ ┌─▼──────────┐ ┌──▼──────────┐ ┌──▼──────────┐
    │  NavMenu │ │ {children} │ │ RadioPlayer │ │   (rotas)   │
    │(Navigation)│ (Páginas)   │ │   (Audio)   │ │             │
    └──────────┘ └──┬────────┬─┘ └─────────────┘ └─────────────┘
                    │        │
        ┌───────────┴──┬─────┴───────────┐
        │              │                 │
    ┌───▼──────┐  ┌───▼──────┐  ┌───────▼──┐
    │ AuthGate │  │SpacePageL│  │ Content  │
    │(Auth)    │  │(Layouts) │  │ (Page)   │
    └──────────┘  └──────────┘  └──────────┘
```

---

## Estrutura de Pastas

```
components/
│
├─── 🔐 auth/
│    ├── AuthGate.tsx         → Proteção de rotas
│    └── index.ts
│
├─── 🎨 providers/
│    ├── SfxProvider.tsx      → Contexto de efeitos sonoros
│    ├── useSfxContext()      → Hook para acessar contexto
│    └── index.ts
│
├─── 🎭 layouts/
│    ├── SpacePageLayout.tsx  → Layout com SpaceBackground
│    └── index.ts
│
├─── 🔄 sync/
│    ├── AutoSyncLunar.tsx    → Sincroniza fase lunar automaticamente
│    ├── LunationSync.tsx     → Sincroniza lunações do banco
│    ├── useSyncLunations()   → Hook para sincronização manual
│    ├── GalaxySunsSync.tsx   → Placeholder (futuro)
│    └── index.ts
│
├─── 🧭 navigation/
│    ├── NavMenu.tsx          → Menu principal
│    └── index.ts
│
├─── 🎵 audio/
│    ├── RadioPlayer.tsx      → Player de rádio/YouTube
│    └── index.ts
│
├─── 🏡 home/
│    ├── EmailSignupForm.tsx
│    └── EmailSubscribeLanding.tsx
│
├─── 📅 timeline/
│    ├── TimelineFilters.tsx
│    ├── TimelineItemCard.tsx
│    └── TimelinePagination.tsx
│
├─── 🎯 shared/ (futuro)
│    ├── Button.tsx
│    ├── Card.tsx
│    ├── Modal.tsx
│    └── Input.tsx
│
└─── index.ts (Exports centralizados)
     ├── export { AuthGate }
     ├── export { SfxProvider }
     ├── export { SpacePageLayout }
     ├── export { AutoSyncLunar, LunationSync }
     ├── export { NavMenu }
     └── export { RadioPlayer }
```

---

## Fluxo de Dados - Sincronizações

```
┌─────────────────────────────────────────────────────────┐
│                   app/layout.tsx                         │
│                 (Componentes de Sync)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼──────────────┐
         │             │              │
    ┌────▼─────────┐ ┌─▼────────┐ ┌──▼────────────┐
    │ AutoSyncLunar│ │Lunations │ │ GalaxySunsSync│
    │              │ │  Sync    │ │               │
    │ - Fase lunar │ │          │ │ [TODO]        │
    │ - Signo      │ │ - Dados  │ │               │
    └──────┬───────┘ │   DB     │ └───────────────┘
           │         └────┬─────┘
           │              │
      ┌────▼──────────────▼───────┐
      │                           │
      │   Banco de Dados API      │
      │   (/api/...)              │
      │                           │
      └──────────────────────────┘
```

---

## Fluxo de Autenticação & Proteção

```
┌──────────────────┐
│  Página Protegida│
└────────┬─────────┘
         │
    ┌────▼──────────┐
    │   AuthGate    │
    │               │
    │ ├─ loading?   │
    │ │ ├─ → Spinner│
    │ │             │
    │ ├─ authenticated?
    │ │ ├─ → Mostrar children
    │ │             │
    │ └─ NOT auth?  │
    │   ├─ → LoginForm
    │   │   ├─ Email
    │   │   ├─ Senha
    │   │   ├─ [Login|Signup]
    │   │   └─ Redirect on success
    └────┬─────────┘
         │
    ┌────▼─────────┐
    │ useAuth()    │
    │ Hook         │
    │              │
    │ - Verifica   │
    │   auth       │
    │ - Gerencia   │
    │   login      │
    │ - Gerencia   │
    │   signup     │
    └──────────────┘
```

---

## Padrão de Imports

### ❌ Antes (Antigos)

```
components/
├── AuthGate.tsx ──────────────────→ import AuthGate from '@/components/AuthGate'
├── SfxProvider.tsx ───────────────→ import SfxProvider from '@/components/SfxProvider'
├── SpacePageLayout.tsx ───────────→ import { SpacePageLayout } from '@/components/SpacePageLayout'
├── LunationSync.tsx ──────────────→ import { LunationSync } from '@/components/LunationSync'
├── NavMenu.tsx ───────────────────→ import NavMenu from '@/components/NavMenu'
└── RadioPlayer.tsx ───────────────→ import RadioPlayer from '@/components/RadioPlayer'
```

### ✅ Depois (Novos - Organizados)

```
components/
├── auth/AuthGate.tsx ─────────────→ import { AuthGate } from '@/components/auth'
├── providers/SfxProvider.tsx ─────→ import { SfxProvider } from '@/components/providers'
├── layouts/SpacePageLayout.tsx ───→ import { SpacePageLayout } from '@/components/layouts'
├── sync/LunationSync.tsx ─────────→ import { LunationSync } from '@/components/sync'
├── navigation/NavMenu.tsx ────────→ import { NavMenu } from '@/components/navigation'
└── audio/RadioPlayer.tsx ─────────→ import { RadioPlayer } from '@/components/audio'

OU usando exports centralizados:
components/index.ts ──────────────→ import { AuthGate, SfxProvider, ... } from '@/components'
```

---

## Composição de Rotas

```
┌────────────────────────────────────────┐
│        Rota Exemplo: /planeta          │
└────────────┬─────────────────────────┬─┘
             │                         │
        ┌────▼────────────┐    ┌───────▼──────┐
        │  AuthGate       │    │  SpacePageL  │
        │  (Opcional)     │    │  Layout      │
        │                 │    │  (Opcional)  │
        │ ├─ loading      │    │              │
        │ ├─ authenticated│    │ ├─ children  │
        │ └─ form         │    │ └─ nav       │
        │                 │    │              │
        └────┬────────────┘    └────┬─────────┘
             │                      │
        ┌────▼──────────────────────▼────┐
        │      Conteúdo da Página        │
        │      (PlanetScreen, etc)       │
        │                                │
        │ - State global                 │
        │ - Hooks customizados           │
        │ - Componentes específicos      │
        └────────────────────────────────┘
```

---

## Ciclo de Vida - Sincronizações

```
App Carrega
    │
    ├─→ RootLayout renderiza
    │
    ├─→ SfxProvider inicia
    │
    ├─→ NavMenu renderiza
    │
    ├─→ AutoSyncLunar efeito
    │   ├─→ Espera autenticação
    │   ├─→ Calcula fase lunar
    │   └─→ POST /api/form/lunar-phase
    │
    ├─→ LunationSync efeito
    │   ├─→ Se autoSync=true
    │   ├─→ Verifica banco (DB)
    │   ├─→ Se não tiver dados
    │   │   ├─→ Gera localmente
    │   │   └─→ Salva em DB
    │   └─→ Cache em syncedYears
    │
    ├─→ GalaxySunsSync efeito
    │   └─→ [TODO: Implementar]
    │
    ├─→ {children} renderiza
    │   └─→ Rotas com AuthGate/SpacePageLayout
    │
    └─→ RadioPlayer renderiza
```

---

## Matriz de Responsabilidades

| Componente      | Auth | Layout | Sync | Nav | Audio | Global |
| --------------- | ---- | ------ | ---- | --- | ----- | ------ |
| AuthGate        | ✅   | -      | -    | -   | -     | ✅     |
| SfxProvider     | -    | -      | -    | -   | -     | ✅     |
| SpacePageLayout | -    | ✅     | -    | -   | -     | ✅     |
| AutoSyncLunar   | -    | -      | ✅   | -   | -     | ✅     |
| LunationSync    | -    | -      | ✅   | -   | -     | ✅     |
| GalaxySunsSync  | -    | -      | 🔄   | -   | -     | 🔄     |
| NavMenu         | -    | -      | -    | ✅  | -     | ✅     |
| RadioPlayer     | -    | -      | -    | -   | ✅    | ✅     |

**Legenda:** ✅ = Implementado | 🔄 = Em progresso/Placeholder | - = Não aplicável

---

**Diagrama criado em:** 28 de dezembro de 2025
**Versão:** 1.0 - Consolidação Completa
**Status:** ✅ Pronto para Produção
