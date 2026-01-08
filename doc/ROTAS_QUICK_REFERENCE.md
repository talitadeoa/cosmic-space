# 🎨 Quick Reference: Convenção de Rotas

**Documento:** Referência rápida para consultas durante desenvolvimento

---

## 📍 Estrutura de Rotas (Visual)

```
🌐 FLUA ROUTING STRUCTURE
│
├─ 🔓 PÚBLICO (sem autenticação)
│  ├─ /                              Landing/Home
│  ├─ /onboarding                    Primeiro acesso
│  │  ├─ /onboarding/ciclo-lunar    Setup lunar
│  │  └─ /onboarding/primeiro-acesso Setup básico
│  ├─ /termos                        Termos de serviço
│  └─ /privacidade                   Política privacidade
│
├─ 🔐 PRIVADO (requer autenticação)
│  │
│  ├─ 📊 DASHBOARD
│  │  ├─ /dashboard                  Visão geral
│  │  ├─ /dashboard/mes              Mês atual
│  │  └─ /dashboard/ano              Ano atual
│  │
│  ├─ 🌙 CICLO LUNAR
│  │  ├─ /ciclo-lunar                Hub
│  │  ├─ /ciclo-lunar/calendario     Calendário lunar
│  │  │  └─ /ciclo-lunar/calendario/2025-01  Mês específico
│  │  ├─ /ciclo-lunar/fases          Explorar fases
│  │  │  └─ /ciclo-lunar/fases/nova  Fase específica
│  │  └─ /ciclo-lunar/entrada-rapida Quick entry
│  │
│  ├─ ✨ ASTROLOGIA
│  │  ├─ /astrologia                 Hub
│  │  ├─ /astrologia/mapa-natal      Seu mapa
│  │  │  └─ /astrologia/mapa-natal/[id]  Mapa específico
│  │  ├─ /astrologia/transitos       Trânsitos
│  │  ├─ /astrologia/planetas        Explorer
│  │  │  └─ /astrologia/planetas/venus
│  │  │     └─ /astrologia/planetas/venus/influencias
│  │  └─ /astrologia/galaxia         Experiência imersiva
│  │
│  ├─ 💝 EMOCIONAL
│  │  ├─ /emocoes                    Hub
│  │  ├─ /emocoes/registro           Registrar
│  │  ├─ /emocoes/historico          Histórico
│  │  └─ /emocoes/padroes            Análise
│  │
│  ├─ 👥 COMUNIDADE
│  │  ├─ /comunidade                 Hub
│  │  ├─ /comunidade/grupos          Explorar
│  │  │  └─ /comunidade/grupos/[slug]  Grupo específico
│  │  ├─ /comunidade/conversas       Chat
│  │  │  └─ /comunidade/conversas/[id]  Conversa
│  │  └─ /comunidade/membros         Explorar membros
│  │
│  ├─ 📋 PROJETOS
│  │  ├─ /projetos                   Todos
│  │  ├─ /projetos/novo              Criar novo
│  │  ├─ /projetos/[id]              Projeto
│  │  ├─ /projetos/[id]/detalhes    Detalhes
│  │  ├─ /projetos/[id]/tarefas     Tarefas
│  │  └─ /projetos/[id]/editar      Editar
│  │
│  ├─ 📈 TIMELINE
│  │  ├─ /timeline                   Insights
│  │  └─ /timeline/[data]           Dia específico (YYYY-MM-DD)
│  │
│  └─ 👤 PERFIL
│     ├─ /perfil                     Perfil
│     ├─ /perfil/configuracoes       Prefs
│     ├─ /perfil/dados-pessoais     Dados
│     ├─ /perfil/privacidade         Privacidade
│     └─ /perfil/logout              Logout
│
└─ 📡 API (paralelo web)
   ├─ /api/auth/*                    Autenticação
   ├─ /api/ciclo-lunar/*             Ciclos lunares
   ├─ /api/astrologia/*              Astrologia
   ├─ /api/emocoes/*                 Emoções
   ├─ /api/comunidade/*              Comunidade
   ├─ /api/projetos/*                Projetos
   ├─ /api/timeline/*                Timeline
   └─ /api/health                    Health check
```

---

## 🔀 Mapeamento Antes → Depois

### Rápido (copie se precisar atualizar links)

```typescript
// OLD → NEW
'/cosmos/home'                    → '/dashboard'
'/cosmos/galaxia'                 → '/astrologia/galaxia'
'/cosmos/lua'                     → '/ciclo-lunar'
'/cosmos/lua/calendarioc'         → '/ciclo-lunar/calendario'
'/cosmos/lua/calendariog'         → '/ciclo-lunar/calendario'
'/cosmos/planeta'                 → '/astrologia/planetas'
'/cosmos/planeta/[planet]'        → '/astrologia/planetas/[planeta]'
'/cosmos/sol'                     → '/astrologia/planetas/sol'
'/isla'                          → '/comunidade'
'/page'                          → '/dashboard'
'/(root)'                        → '/'
'/landing'                       → '/'
```

---

## 🎯 Naming Rules (Memorize)

```
DOMÍNIOS (Singular, Lowercase, Kebab-case)
✅ /ciclo-lunar       (não: lunar-cycle, ciclos-lunares)
✅ /astrologia        (não: astrology, astro)
✅ /emocoes           (não: emotional, emoção)

COLEÇÕES (Plural, Lowercase, Kebab-case)
✅ /planetas          (não: planeta, planets)
✅ /grupos            (não: grupo, group)
✅ /conversas         (não: conversa, conversation)

CONCEITOS (Singular, Lowercase, Kebab-case)
✅ /mapa-natal        (não: natal-map, mapas)
✅ /entrada-rapida    (não: quick-input, quick-entry)
✅ /dados-pessoais    (não: personal-data, pessoal)

DINÂMICOS (Colchetes)
✅ /planetas/[planeta]
✅ /projetos/[id]
✅ /grupos/[slug]

AÇÕES (Singular, Lowercase, Kebab-case)
✅ /novo              (não: create, add, new-form)
✅ /editar            (não: edit-form, modification)
✅ /detalhes          (não: detail, view)
✅ /historico         (não: history, log)
✅ /configuracoes     (não: settings, config)
```

---

## 🔗 Usar em Componentes

### ❌ NÃO FAÇA (Hardcoded)

```tsx
<Link href="/cosmos/galaxia">Galáxia</Link>
<button onClick={() => router.push('/ilha')}>
  Comunidade
</button>
```

### ✅ FAÇA (Com constantes)

```tsx
import { ASTROLOGY_ROUTES, COMMUNITY_ROUTES } from '@/lib/constants/routes';
import { useAppRouter } from '@/hooks/useAppRouter';

<Link href={ASTROLOGY_ROUTES.GALAXY}>Galáxia</Link>
<NavLink href={COMMUNITY_ROUTES.HOME}>Comunidade</NavLink>

const { navigate } = useAppRouter();
<button onClick={() => navigate(COMMUNITY_ROUTES.HOME)}>
  Comunidade
</button>
```

---

## 📡 API Routes (Espelham Estrutura)

```
GET /api/ciclo-lunar/fases
GET /api/ciclo-lunar/calendario
GET /api/ciclo-lunar/calendario?mes=2025-01
POST /api/ciclo-lunar/entradas
GET /api/ciclo-lunar/entradas/[id]

GET /api/astrologia/planetas
GET /api/astrologia/planetas/[planeta]
POST /api/astrologia/mapa-natal
GET /api/astrologia/transitos

GET /api/emocoes
POST /api/emocoes
GET /api/emocoes/[id]
PUT /api/emocoes/[id]
DELETE /api/emocoes/[id]

GET /api/comunidade/grupos
GET /api/comunidade/grupos/[slug]
GET /api/comunidade/conversas
GET /api/comunidade/conversas/[id]

GET /api/projetos
POST /api/projetos
GET /api/projetos/[id]
PUT /api/projetos/[id]
DELETE /api/projetos/[id]
GET /api/projetos/[id]/tarefas

GET /api/timeline
POST /api/timeline
GET /api/timeline/[data]

POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh

GET /api/health
```

---

## 🚀 Deep Links (Mobile)

```
PADRÃO: flua://[dominio]/[recurso]/[detalhes]

Exemplos:
flua://dashboard
flua://astrologia/planetas
flua://astrologia/planetas/venus
flua://astrologia/galaxia
flua://ciclo-lunar/calendario
flua://ciclo-lunar/fases/nova
flua://comunidade/grupos
flua://comunidade/grupos/ciclos-lunares
flua://projetos/123
flua://projetos/123/tarefas
flua://perfil/configuracoes
flua://emocoes/historico

IMPLEMENTAÇÃO:
import { generateDeepLink, ASTROLOGY_ROUTES } from '@/lib/constants/routes';

const deepLink = generateDeepLink(ASTROLOGY_ROUTES.PLANET_DETAIL('venus'));
// → flua://astrologia/planetas/venus
```

---

## 📋 File Structure (Criar Assim)

```
app/
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── onboarding/
│   │   ├── page.tsx
│   │   ├── ciclo-lunar/page.tsx
│   │   └── primeiro-acesso/page.tsx
│   ├── termos/page.tsx
│   └── privacidade/page.tsx
│
└── (app)/
    ├── layout.tsx
    ├── dashboard/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── mes/page.tsx
    │   └── ano/page.tsx
    │
    ├── ciclo-lunar/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── calendario/
    │   │   ├── page.tsx
    │   │   └── [mes]/page.tsx
    │   ├── fases/
    │   │   ├── page.tsx
    │   │   └── [fase]/page.tsx
    │   └── entrada-rapida/page.tsx
    │
    ├── astrologia/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── mapa-natal/
    │   │   ├── page.tsx
    │   │   └── [id]/page.tsx
    │   ├── transitos/page.tsx
    │   ├── planetas/
    │   │   ├── page.tsx
    │   │   └── [planeta]/
    │   │       ├── page.tsx
    │   │       └── influencias/page.tsx
    │   └── galaxia/page.tsx
    │
    ├── emocoes/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── registro/page.tsx
    │   ├── historico/page.tsx
    │   └── padroes/page.tsx
    │
    ├── comunidade/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── grupos/
    │   │   ├── page.tsx
    │   │   └── [slug]/page.tsx
    │   ├── conversas/
    │   │   ├── page.tsx
    │   │   └── [id]/page.tsx
    │   └── membros/page.tsx
    │
    ├── projetos/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── novo/page.tsx
    │   └── [id]/
    │       ├── page.tsx
    │       ├── detalhes/page.tsx
    │       ├── tarefas/page.tsx
    │       └── editar/page.tsx
    │
    ├── timeline/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── [data]/page.tsx
    │
    ├── perfil/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── configuracoes/page.tsx
    │   ├── dados-pessoais/page.tsx
    │   ├── privacidade/page.tsx
    │   └── logout/page.tsx
    │
    └── 404.tsx
```

---

## 🔍 SEO Tags por Rota

```typescript
// Implementar em metadata/opengraph para cada página

PADRÃO:
const metadata = {
  title: '[Dominio] - [Página] | Flua',
  description: '[Descrição breve com keywords]',
  openGraph: {
    url: 'https://flua.app[rota]',
    title: '[Dominio] - [Página] | Flua',
    description: '[Descrição breve]',
  },
  canonical: 'https://flua.app[rota]',
};

EXEMPLOS:
/astrologia/planetas/venus
  title: "Vênus - Astrologia | Flua"
  desc: "Explore a influência de Vênus em seus relacionamentos e criatividade"

/ciclo-lunar/calendario
  title: "Calendário Lunar | Flua"
  desc: "Calendário interativo para rastreamento de ciclos lunares"

/comunidade
  title: "Comunidade | Flua"
  desc: "Conecte-se com outras pessoas e explore ciclos lunares juntas"
```

---

## 🧪 Testes Rápidos

```bash
# Verificar se todas as rotas estão mapeadas
npx tsx scripts/verify-routes.ts

# Validar deep links (manual)
# iOS: xed '://astrologia/planetas/venus' / Capacitor build & test
# Android: adb shell am start -W -a android.intent.action.VIEW -d "flua://astrologia/planetas/venus" app.flua.app

# SEO check com Google PageSpeed Insights
# https://pagespeed.web.dev/

# Schema markup validator
# https://validator.schema.org/
```

---

## 🆘 Troubleshooting

### Link quebrado: "Rota não existe"

```typescript
// ❌ Você digitou a rota
href="/cosmo/planeta"  // typo

// ✅ Use constante ao invés
import { ASTROLOGY_ROUTES } from '@/lib/constants/routes';
href={ASTROLOGY_ROUTES.PLANETS}
```

### Deep link não abre app

```
1. Verificar capacitor.config.ts
2. Verificar apple-app-site-association (iOS)
3. Verificar AndroidManifest.xml (Android)
4. Rebuildar app (npm run build)
5. Testar no device, não simulador
```

### Breadcrumb quebrado

```typescript
// Verificar se ID/slug está em BREADCRUMB_LABELS
const BREADCRUMB_LABELS = {
  // ... adicionar novo termo
  'novo-termino': 'Novo Termo',
};
```

### Rota antigo retorna 404

```
1. Verificar se redirect 301 existe em next.config.mjs
2. Se novo, adicionar redirect
3. Redeployar
4. Aguardar cache limpar (até 24h)
```

---

## 💾 Atalhos Úteis (Copiar)

```typescript
// Imports mais usados
import { 
  DASHBOARD_ROUTES,
  LUNAR_CYCLE_ROUTES,
  ASTROLOGY_ROUTES,
  COMMUNITY_ROUTES,
  PROJECT_ROUTES,
  PROFILE_ROUTES,
  API_ROUTES,
} from '@/lib/constants/routes';

// Link seguro
import { NavLink } from '@/components/shared/NavLink';

// Navegação typesafe
import { useAppRouter } from '@/hooks/useAppRouter';

// Breadcrumb automático
import { Breadcrumb } from '@/components/shared/Breadcrumb';
```

---

## 📚 Documentos Relacionados

- 📄 [CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md](CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md) - Completo
- 💻 [ROTAS_GUIA_PRATICO_IMPLEMENTACAO.md](ROTAS_GUIA_PRATICO_IMPLEMENTACAO.md) - Código
- 📊 [IMPACTOS_DETALHADOS_ROTAS.md](IMPACTOS_DETALHADOS_ROTAS.md) - Análise
- 🎯 [RESUMO_EXECUTIVO_ROTAS.md](RESUMO_EXECUTIVO_ROTAS.md) - Resumo

---

**Última atualização:** 7 de janeiro de 2025  
**Status:** ✅ Pronto para usar  
**Mantém:** Atualizar conforme novas rotas são adicionadas

**Tip:** Bookmark este documento para referência rápida durante o desenvolvimento!

