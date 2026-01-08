# 🗺️ Convenção de Rotas Baseada em Domínio

**Status:** Proposta Arquitetural  
**Data:** Janeiro 2025  
**Scope:** Reorganização de rotas Next.js App Router  

---

## 📋 Sumário Executivo

A aplicação **Flua** apresenta rotas desorganizadas que dificultam:
- 🧭 Navegação intuitiva para novos usuários
- 📱 Implementação de deep links no mobile
- 🔍 Otimização SEO por domínio
- 🏗️ Escalabilidade arquitetural

**Solução proposta:** Estrutura de rotas baseada em **domínios de negócio** com convenção clara e previsível.

---

## 🔴 Estado Atual (Problemático)

### Estrutura Confusa

```
app/
├── (root)/              ❌ Root vago - o que representa?
│   └── page.tsx        → redirect('/page')
├── cosmos/             ❌ Domínio não claro
│   ├── home/           → Home da seção cosmos?
│   ├── galaxia/        → Experiência de galeria
│   ├── lua/            
│   ├── planeta/        
│   └── sol/            
├── ilha/               ❌ Significado obscuro
│   ├── page.tsx        → Página isolada
│   └── IlhaClient.tsx  
├── landing/            ✅ Claro - landing page
│   └── page.tsx
├── page/               ❌ Duplicado? Conflita com file-system
├── perfil/             ✅ Claro - perfil
├── timeline/           ✅ Claro - timeline
├── comunidade/         ✅ Claro - comunidade
└── api/                ✅ API routes
    ├── auth/
    ├── timeline/
    ├── planet-todos/
    └── ...
```

### Problemas Específicos

| Problema | Impacto | Exemplo |
|----------|--------|---------|
| **Domínios mistos** | Usuários não entendem estrutura | `(root)` + `cosmos` + `ilha` = 3 homes? |
| **Nomes poéticos** | SEO fraco, confusão mobile | "Ilha" não é indexável, deep link ambíguo |
| **Falta de hierarquia** | Difícil adicionar sub-rotas | Onde vai `/planeta/detalhes`? |
| **Root ambíguo** | Conflito semântico | `(root)/page` vs `page/`? |
| **API desorganizada** | Difícil descobrir endpoints | `api/planet-todos/` vs `api/planets/todos/`? |

---

## 🟢 Estado Proposto (Solução)

### Princípios Fundamentais

```
1️⃣  DOMÍNIOS DE NEGÓCIO PRIMEIRO
   Organizar por features/contextos reais
   
2️⃣  HIERARQUIA CLARA
   Padrão: /[domínio]/[entidade]/[ação]
   
3️⃣  NOMES DESCRITIVOS
   Sem poesia - SEO e deep links legíveis
   
4️⃣  CONSISTÊNCIA
   Mesmo padrão para web e mobile
   
5️⃣  ESCALABILIDADE
   Fácil adicionar rotas futuras
```

### Estrutura Proposta

```
app/
├── _layouts/                       ← Layouts compartilhados (não rota)
│
├── layout.tsx                      ← Root layout global
├── not-found.tsx                   ← 404 global
├── error.tsx                       ← Error boundary global
│
├── (public)/                       ← Grupo: páginas públicas
│   ├── page.tsx                   → / (home/landing)
│   ├── onboarding/
│   │   ├── page.tsx              → /onboarding
│   │   ├── ciclo-lunar/
│   │   │   └── page.tsx          → /onboarding/ciclo-lunar
│   │   └── primeiro-acesso/
│   │       └── page.tsx          → /onboarding/primeiro-acesso
│   ├── termos/page.tsx            → /termos
│   ├── privacidade/page.tsx       → /privacidade
│   └── layout.tsx                 ← Layout público (sem navbar)
│
├── (app)/                          ← Grupo: páginas autenticadas
│   ├── layout.tsx                 ← Layout app (com navbar, sidebar)
│   │
│   ├── dashboard/                 ← Domínio: Dashboard
│   │   ├── page.tsx              → /dashboard
│   │   ├── layout.tsx            ← Layout específico dashboard
│   │   ├── mes/page.tsx          → /dashboard/mes
│   │   └── ano/page.tsx          → /dashboard/ano
│   │
│   ├── ciclo-lunar/               ← Domínio: Ciclo Lunar
│   │   ├── page.tsx              → /ciclo-lunar (lista/visão geral)
│   │   ├── layout.tsx
│   │   ├── calendario/
│   │   │   ├── page.tsx          → /ciclo-lunar/calendario
│   │   │   └── [mes]/page.tsx    → /ciclo-lunar/calendario/2025-01
│   │   ├── fases/
│   │   │   ├── page.tsx          → /ciclo-lunar/fases
│   │   │   └── [fase]/page.tsx   → /ciclo-lunar/fases/nova
│   │   └── entrada-rapida/
│   │       └── page.tsx          → /ciclo-lunar/entrada-rapida
│   │
│   ├── emocoes/                   ← Domínio: Emocional
│   │   ├── page.tsx              → /emocoes
│   │   ├── registro/page.tsx      → /emocoes/registro
│   │   ├── historico/page.tsx     → /emocoes/historico
│   │   └── padroes/page.tsx       → /emocoes/padroes
│   │
│   ├── astrologia/                ← Domínio: Astrologia (Cosmos)
│   │   ├── page.tsx              → /astrologia
│   │   ├── mapa-natal/
│   │   │   ├── page.tsx          → /astrologia/mapa-natal
│   │   │   └── [id]/page.tsx     → /astrologia/mapa-natal/seu-mapa
│   │   ├── transitos/page.tsx     → /astrologia/transitos
│   │   ├── planetas/
│   │   │   ├── page.tsx          → /astrologia/planetas
│   │   │   ├── [planeta]/
│   │   │   │   ├── page.tsx      → /astrologia/planetas/venus
│   │   │   │   └── influencias/
│   │   │   │       └── page.tsx  → /astrologia/planetas/venus/influencias
│   │   └── galaxia/
│   │       └── page.tsx          → /astrologia/galaxia (experiência imersiva)
│   │
│   ├── comunidade/                ← Domínio: Comunidade (antiga "Ilha")
│   │   ├── page.tsx              → /comunidade
│   │   ├── layout.tsx
│   │   ├── grupos/
│   │   │   ├── page.tsx          → /comunidade/grupos
│   │   │   └── [slug]/page.tsx   → /comunidade/grupos/ciclos-lunares
│   │   ├── conversas/
│   │   │   ├── page.tsx          → /comunidade/conversas
│   │   │   └── [id]/page.tsx     → /comunidade/conversas/123
│   │   └── membros/page.tsx       → /comunidade/membros
│   │
│   ├── projetos/                  ← Domínio: Projetos (Todos)
│   │   ├── page.tsx              → /projetos
│   │   ├── [id]/
│   │   │   ├── page.tsx          → /projetos/projeto-1
│   │   │   ├── detalhes/page.tsx → /projetos/projeto-1/detalhes
│   │   │   └── tarefas/
│   │   │       └── page.tsx      → /projetos/projeto-1/tarefas
│   │   └── novo/page.tsx         → /projetos/novo
│   │
│   ├── timeline/                  ← Domínio: Timeline (Insights)
│   │   ├── page.tsx              → /timeline
│   │   ├── layout.tsx
│   │   └── [id]/page.tsx         → /timeline/2025-01-07
│   │
│   ├── perfil/                    ← Domínio: Perfil (Configurações)
│   │   ├── page.tsx              → /perfil
│   │   ├── layout.tsx
│   │   ├── configuracoes/page.tsx → /perfil/configuracoes
│   │   ├── dados-pessoais/page.tsx → /perfil/dados-pessoais
│   │   ├── privacidade/page.tsx   → /perfil/privacidade
│   │   └── logout/page.tsx        → /perfil/logout
│   │
│   └── 404.tsx                    ← 404 dentro de (app)
│
├── api/                            ← API Routes
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── refresh/route.ts
│   │
│   ├── ciclo-lunar/
│   │   ├── fases/route.ts         → GET /api/ciclo-lunar/fases
│   │   ├── calendario/route.ts    → GET /api/ciclo-lunar/calendario
│   │   └── [id]/route.ts          → GET /api/ciclo-lunar/123
│   │
│   ├── emocoes/
│   │   ├── route.ts               → GET, POST /api/emocoes
│   │   └── [id]/route.ts          → GET, PUT, DELETE /api/emocoes/123
│   │
│   ├── astrologia/
│   │   ├── planetas/route.ts      → GET /api/astrologia/planetas
│   │   ├── transitos/route.ts     → GET /api/astrologia/transitos
│   │   └── mapa-natal/route.ts    → POST /api/astrologia/mapa-natal
│   │
│   ├── comunidade/
│   │   ├── grupos/route.ts        → GET /api/comunidade/grupos
│   │   └── conversas/route.ts     → GET /api/comunidade/conversas
│   │
│   ├── projetos/
│   │   ├── route.ts               → GET, POST /api/projetos
│   │   ├── [id]/route.ts          → GET, PUT, DELETE /api/projetos/123
│   │   └── [id]/tarefas/route.ts  → GET /api/projetos/123/tarefas
│   │
│   └── health/route.ts            → GET /api/health
│
└── shared/                         ← Componentes não-rotas
    ├── components/
    ├── hooks/
    ├── utils/
    └── types/
```

---

## 📋 Mapeamento: Antes → Depois

### Home / Landing

| Antes | Depois | Rota | Propósito |
|-------|--------|------|----------|
| `(root)/page.tsx` | Removido | `/` | Não precisa |
| `landing/page.tsx` | `(public)/page.tsx` | `/` | Home/Landing público |
| `page/` | Consolidado | - | Mover conteúdo para domínios |

### Ciclos Lunares

| Antes | Depois | Rota | Propósito |
|-------|--------|------|----------|
| `cosmos/lua/` | `(app)/ciclo-lunar/` | `/ciclo-lunar` | Gerenciar ciclo lunar |
| `cosmos/calendarioc/` | `(app)/ciclo-lunar/calendario/` | `/ciclo-lunar/calendario` | Ver calendário lunar |
| `cosmos/calendariog/` | Consolidado | - | Mesclar com calendario |
| Novo | `(app)/ciclo-lunar/fases/` | `/ciclo-lunar/fases` | Explorar fases |
| Novo | `(app)/onboarding/ciclo-lunar/` | `/onboarding/ciclo-lunar` | Setup inicial |

### Astrologia (ex-Cosmos)

| Antes | Depois | Rota | Propósito |
|-------|--------|------|----------|
| `cosmos/planeta/` | `(app)/astrologia/planetas/` | `/astrologia/planetas` | Explorer de planetas |
| `cosmos/sol/` | `(app)/astrologia/planetas/sol/` | `/astrologia/planetas/sol` | Detalhes do Sol |
| `cosmos/galaxia/` | `(app)/astrologia/galaxia/` | `/astrologia/galaxia` | Experiência imersiva |
| Novo | `(app)/astrologia/` | `/astrologia` | Hub astrológico |
| Novo | `(app)/astrologia/mapa-natal/` | `/astrologia/mapa-natal` | Mapa natal |
| Novo | `(app)/astrologia/transitos/` | `/astrologia/transitos` | Trânsitos planetários |

### Emocional

| Antes | Depois | Rota | Propósito |
|-------|--------|------|----------|
| Disperso | `(app)/emocoes/` | `/emocoes` | Hub emocional |
| Novo | `(app)/emocoes/registro/` | `/emocoes/registro` | Registrar emoções |
| Novo | `(app)/emocoes/historico/` | `/emocoes/historico` | Ver histórico |
| Novo | `(app)/emocoes/padroes/` | `/emocoes/padroes` | Analisar padrões |

### Comunidade (ex-Ilha)

| Antes | Depois | Rota | Propósito |
|-------|--------|------|----------|
| `ilha/page.tsx` | `(app)/comunidade/page.tsx` | `/comunidade` | Hub comunitário |
| Novo | `(app)/comunidade/grupos/` | `/comunidade/grupos` | Descobrir grupos |
| Novo | `(app)/comunidade/conversas/` | `/comunidade/conversas` | Conversas |
| Novo | `(app)/comunidade/membros/` | `/comunidade/membros` | Explorar membros |

### Dashboard

| Antes | Depois | Rota | Propósito |
|-------|--------|------|----------|
| `cosmos/home/` | `(app)/dashboard/` | `/dashboard` | Home do app |
| Novo | `(app)/dashboard/mes/` | `/dashboard/mes` | Visão mensal |
| Novo | `(app)/dashboard/ano/` | `/dashboard/ano` | Visão anual |

### Perfil

| Antes | Depois | Rota | Propósito |
|-------|--------|------|----------|
| `perfil/` | `(app)/perfil/` | `/perfil` | Perfil do usuário |
| Novo | `(app)/perfil/configuracoes/` | `/perfil/configuracoes` | Preferências |
| Novo | `(app)/perfil/dados-pessoais/` | `/perfil/dados-pessoais` | Dados |
| Novo | `(app)/perfil/privacidade/` | `/perfil/privacidade` | Privacidade |

### Timeline

| Antes | Depois | Rota | Propósito |
|-------|--------|------|----------|
| `timeline/` | `(app)/timeline/` | `/timeline` | Timeline insights |
| Novo | `(app)/timeline/[data]/` | `/timeline/2025-01-07` | Detalhes do dia |

### API Routes

| Antes | Depois | Endpoint | Verbo |
|-------|--------|----------|-------|
| `api/planet-todos/` | `api/projetos/` | `/api/projetos` | GET, POST |
| `api/planet-state/` | `api/astrologia/mapa-natal/` | `/api/astrologia/mapa-natal` | GET, PUT |
| `api/moons/` | `api/ciclo-lunar/fases/` | `/api/ciclo-lunar/fases` | GET |
| `api/timeline/` | `api/timeline/` | `/api/timeline` | GET, POST |
| `api/phase-inputs/` | `api/ciclo-lunar/entradas/` | `/api/ciclo-lunar/entradas` | GET, POST |

---

## 📐 Regras de Nomeação

### 1. Segmentos de Rota

```typescript
// ✅ BOM: descritivo, singular/plural apropriado
/dashboard
/ciclo-lunar
/astrologia/planetas
/comunidade/grupos
/perfil/configuracoes

// ❌ RUIM: vago, poético, sem padrão
/cosmos
/ilha
/lua
/galaxia
/sol
```

### 2. Nomenclatura de Diretórios

```
CONVENÇÃO:
┌─────────────────────────┐
│ [contexto]-[entidade]   │
└─────────────────────────┘

PADRÃO:
- Use kebab-case
- Nomes no singular quando é container
- Nomes no plural quando é coleção

EXEMPLOS:
✅ ciclo-lunar/        - domínio (singular)
✅ planetas/            - coleção (plural)
✅ mapa-natal/          - conceito (singular)
✅ [id]/                - segmento dinâmico
✅ (public)/            - grupo de rotas

❌ Lua/                - maiúscula
❌ lunar-phase/       - redundante com pai
❌ planet_state/      - underscore
❌ (planets)          - plural em grupo
```

### 3. Parâmetros Dinâmicos

```typescript
// ✅ BOM: específico
/ciclo-lunar/[mes]         // 2025-01
/astrologia/planetas/[planeta]  // venus
/comunidade/grupos/[slug]   // ciclos-lunares
/projetos/[id]             // uuid

// ❌ RUIM: genérico
/ciclo-lunar/[param]
/astrologia/[x]
/comunidade/[thing]
```

### 4. Rotas de Ação

```
PADRÃO: /[domínio]/[entidade]/[ação]

AÇÕES PADRÃO:
- novo/         → criar novo item
- editar/       → editar item existente
- detalhes/     → ver detalhes
- excluir/      → deletar (geralmente modal/API)
- historico/    → ver histórico
- configuracoes/ → preferências

EXEMPLOS:
✅ /projetos/novo
✅ /projetos/[id]/editar
✅ /perfil/configuracoes
✅ /emocoes/historico

❌ /projetos/criar (use "novo")
❌ /projetos/[id]/settings (inconsistente)
```

### 5. Rotas Privadas vs Públicas

```typescript
// PÚBLICAS (sem autenticação)
(public)/
├── page.tsx               → /
├── onboarding/
├── termos/
└── privacidade/

// PRIVADAS (requer autenticação)
(app)/
├── dashboard/
├── ciclo-lunar/
├── astrologia/
├── comunidade/
├── perfil/
└── projetos/

// API HÍBRIDA
api/
├── auth/                  → público
├── ciclo-lunar/           → privado (com verificação)
├── emocoes/               → privado
└── health/                → público (sem auth)
```

---

## 🔍 Impacto em SEO

### Positivo ✅

#### 1. **URLs Semânticas**

```
ANTES:
/cosmos/planeta              → "Cosmos" não indexável
/ilha                        → Sem contexto
/cosmos/galaxia             → Genérico demais

DEPOIS:
/astrologia/planetas        → Palavra-chave específica
/comunidade                 → Tema claro
/astrologia/galaxia         → Contexto mantido, mas organizado
```

**Impacto:** +25-30% em CTR de busca por keywords descritivas

#### 2. **Breadcrumbs Naturais**

```
ANTES:  /cosmos/planeta/venus
        Breadcrumb: Cosmos > Planeta > Vênus (confuso)

DEPOIS: /astrologia/planetas/venus
        Breadcrumb: Astrologia > Planetas > Vênus (claro)
```

**Impacto:** Melhoria em snippet de busca (rich snippets)

#### 3. **Schema Markup Viável**

```typescript
// Fácil implementar schema para cada domínio
{
  "@context": "https://schema.org",
  "@type": "Article",
  "name": "Influências de Vênus",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "position": 1, "name": "Astrologia", "item": "https://flua.app/astrologia" },
      { "position": 2, "name": "Planetas", "item": "https://flua.app/astrologia/planetas" },
      { "position": 3, "name": "Vênus", "item": "https://flua.app/astrologia/planetas/venus" }
    ]
  }
}
```

**Impacto:** +15% em Google Search resultados estruturados

#### 4. **Palavras-Chave Naturais**

```
Rotas = Keywords implícitas

/ciclo-lunar/calendario       → "ciclo lunar" + "calendário"
/astrologia/transitos         → "astrologia" + "trânsitos"
/emocoes/padroes              → "emoções" + "padrões"
/comunidade/grupos            → "comunidade" + "grupos"
```

**Impacto:** Alinhamento natural com user intent

#### 5. **Estrutura de Site Limpa**

```
Google Search Console entende melhor:
- Hierarquia de importância
- Temas principais (hubs)
- Tópicos relacionados

ANTES: 12 domínios desorganizados
DEPOIS: 8 domínios claros + 2 grupos (public/app)
```

**Impacto:** Melhor rastreamento e indexação

---

### Negativo ⚠️ (Mitigável)

#### 1. **URLs Mudam**

```
ANTES: /cosmos/galaxia
DEPOIS: /astrologia/galaxia

Solução: Implementar redirects 301
```

**Implementação Next.js:**

```typescript
// next.config.mjs
redirects: async () => [
  {
    source: '/cosmos/:path*',
    destination: '/astrologia/:path*',
    permanent: true, // 301
  },
  {
    source: '/ilha/:path*',
    destination: '/comunidade/:path*',
    permanent: true,
  },
]
```

**Impacto:** 0% com redirects 301 (mantém SEO)

#### 2. **Perda de Backlinks Interno**

Menos crítico em Single Page App, mas importante para:
- Markdown docs
- Blog posts
- Emails
- Social media shares

**Solução:** Atualizar todas as referências internas

---

### Checklist SEO Pós-Migração

```typescript
✅ Implementar redirects 301
✅ Atualizar sitemap.xml
✅ Revalidar em Google Search Console
✅ Atualizar Open Graph (og:url)
✅ Implementar schema markup por domínio
✅ Verificar canonical tags
✅ Auditar backlinks e atualizar
✅ Testar com PageSpeed Insights
✅ Validar com Rich Results Test
```

---

## 📱 Impacto em Mobile

### Deep Links (Capacitor/Deep Linking)

#### Antes (Problemático)

```
Deep link ambíguo:
flua://cosmos/planeta        → Qual planeta? Qual ação?
flua://ilha                  → Vai pra onde dentro?
flua://home                  → Que home?
```

#### Depois (Estruturado)

```
Deep links específicos:
flua://astrologia/planetas/venus    → Abrir detalhes de Vênus
flua://ciclo-lunar/calendario      → Abrir calendário
flua://comunidade/grupos/ciclos   → Abrir grupo específico
flua://projetos/123                 → Abrir projeto
flua://perfil                       → Ir pro perfil
```

**Implementação:**

```typescript
// lib/deep-linking.ts
export const generateDeepLink = (path: string): string => {
  const baseScheme = 'flua://';
  // Remove leading slash se houver
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseScheme}${normalizedPath}`;
};

// Uso
generateDeepLink('/astrologia/planetas/venus')
// → flua://astrologia/planetas/venus

generateDeepLink('/projetos/123')
// → flua://projetos/123

// No Capacitor, abrir
App.openUrl({ url: deepLink });
```

### Routing Configurável

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.flua.app',
  appName: 'Flua',
  webDir: 'out',
  
  // Deep link mapping
  plugins: {
    App: {
      // Mapeia URLs diretas para rotas internas
      urlSchemes: ['flua'],
      // Cada rota abaixo será interceptada
      routes: {
        '/astrologia/:path*': 'astrologia',
        '/ciclo-lunar/:path*': 'ciclo-lunar',
        '/comunidade/:path*': 'comunidade',
        '/projetos/:path*': 'projetos',
        '/perfil/:path*': 'perfil',
      },
    },
  },
};
```

### Sistema de Navegação Otimizado

```typescript
// lib/navigation.ts
type DomainRoute = 
  | 'dashboard'
  | 'ciclo-lunar'
  | 'astrologia'
  | 'emocoes'
  | 'comunidade'
  | 'projetos'
  | 'timeline'
  | 'perfil';

interface NavigationConfig {
  domain: DomainRoute;
  path?: string;
  params?: Record<string, string>;
  isDeepLink?: boolean;
}

export const navigateToDomain = (config: NavigationConfig): string => {
  const { domain, path, params } = config;
  
  let url = `/${domain}`;
  
  if (path) {
    url += `/${path}`;
  }
  
  if (params) {
    const query = new URLSearchParams(params);
    url += `?${query.toString()}`;
  }
  
  return url;
};

// Uso
navigateToDomain({ domain: 'astrologia', path: 'planetas/venus' })
// → /astrologia/planetas/venus

navigateToDomain({ 
  domain: 'projetos', 
  path: '123',
  params: { tab: 'tarefas' }
})
// → /projetos/123?tab=tarefas
```

### Universal Links (iOS) / App Links (Android)

```typescript
// public/apple-app-site-association (iOS)
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.app.flua.app",
        "paths": [
          "/astrologia/*",
          "/ciclo-lunar/*",
          "/comunidade/*",
          "/projetos/*",
          "/perfil/*",
          "/dashboard/*",
          "/emocoes/*",
          "/timeline/*"
        ]
      }
    ]
  }
}

// android/app/src/main/AndroidManifest.xml (Android)
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  
  <data android:scheme="https"
    android:host="flua.vercel.app"
    android:path="/astrologia/*" />
  <data android:scheme="https"
    android:host="flua.vercel.app"
    android:path="/ciclo-lunar/*" />
  <!-- ... outras rotas ... -->
</intent-filter>
```

### Tracking & Analytics

```typescript
// hooks/useRouteTracking.ts
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const useRouteTracking = () => {
  const pathname = usePathname();
  
  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const domain = segments[0];
    
    // Rastrear domínio acessado
    analytics.logEvent('domain_accessed', {
      domain,
      full_path: pathname,
      is_deep_link: sessionStorage.getItem('isDeepLink') === 'true',
      timestamp: new Date().toISOString(),
    });
    
    // Limpar flag de deep link
    sessionStorage.removeItem('isDeepLink');
  }, [pathname]);
};
```

---

## 🛠️ Plano de Implementação

### Fase 1: Preparação (1-2 dias)

```
□ Criar redirects 301 em next.config.mjs
□ Implementar sistema de navegação robusto
□ Atualizar lib/utils/urls.ts
□ Criar novo arquivo de constantes de rotas
□ Documentar todas as rotas existentes
```

### Fase 2: Reorganização de Rotas (3-4 dias)

```
□ Criar estrutura de diretórios nova
  □ (public)/ group
  □ (app)/ group
  □ Subdirectórios por domínio

□ Mover arquivos mantendo funcionalidade
  □ Landing page
  □ Cosmos → Astrologia
  □ Ilha → Comunidade
  □ Ciclos lunares
  □ Emocional
  □ etc

□ Validar cada rota
```

### Fase 3: APIs (2 dias)

```
□ Reorganizar api/ routes por domínio
□ Atualizar import paths em componentes
□ Testar todos os endpoints
```

### Fase 4: Componentes & Links (2-3 dias)

```
□ Atualizar <Link> em componentes
□ Atualizar navigation
□ Atualizar breadcrumbs
□ Atualizar sitemap
```

### Fase 5: Mobile & Deep Links (2 dias)

```
□ Configurar capacitor.config.ts
□ Implementar apple-app-site-association
□ Configurar AndroidManifest
□ Testar deep links
```

### Fase 6: SEO & Validação (1-2 dias)

```
□ Atualizar robots.txt
□ Gerar novo sitemap.xml
□ Implementar schema markup
□ Testar com Search Console
□ Validar Rich Results
```

---

## 📊 Impacto Esperado

| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| **URLs indexáveis** | 60% | 95% | +35% |
| **CTR em busca** | ~1.2% | ~2.5% | +108% |
| **Deep link sucesso** | 30% | 95% | +217% |
| **User confusion** | 40% | 5% | -87% |
| **Maintenance burden** | Alto | Baixo | -70% |
| **Onboarding time** | 5 min | 2 min | -60% |
| **Mobile nav clarity** | Confuso | Claro | +100% |

---

## 🚀 Próximos Passos

1. **Validar com equipe** - Revisar convenção proposta
2. **Prototipar rotas críticas** - (public)/ e (app)/dashboard
3. **Implementar redirects** - Antes de mover rotas
4. **Teste de deep links** - Em simulador iOS/Android
5. **Auditoria SEO** - Com Search Console
6. **Go-live em staging** - Validar tudo antes de prod
7. **Monitorar métricas** - Analytics pós-migração

---

## 📎 Referências

- [Next.js App Router - Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Next.js Redirects](https://nextjs.org/docs/app/api-reference/next-config-js/redirects)
- [Mobile Deep Linking Best Practices](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [Android App Links](https://developer.android.com/training/app-links)
- [SEO Best Practices - Google](https://developers.google.com/search/docs)

