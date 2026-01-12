# 🔧 Guia Prático: Migração de Rotas

**Complemento:** Implementação passo-a-passo da convenção de rotas proposta.

---

## 1️⃣ Arquivo de Constantes de Rotas

Criar `lib/constants/routes.ts`:

```typescript
/**
 * 🗺️ Constantes centralizadas de todas as rotas da aplicação
 * 
 * Benefícios:
 * - Single source of truth
 * - Refatoração automática (IDE)
 * - Type-safety em navigação
 * - Facilita deep links
 */

// ==========================================
// 🔓 ROTAS PÚBLICAS
// ==========================================

export const PUBLIC_ROUTES = {
  HOME: '/',
  ONBOARDING: '/onboarding',
  ONBOARDING_LUNAR: '/onboarding/ciclo-lunar',
  ONBOARDING_FIRST_ACCESS: '/onboarding/primeiro-acesso',
  TERMS: '/termos',
  PRIVACY: '/privacidade',
} as const;

// ==========================================
// 🔐 ROTAS PRIVADAS - DASHBOARD
// ==========================================

export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  MONTHLY: '/dashboard/mes',
  YEARLY: '/dashboard/ano',
} as const;

// ==========================================
// 🔐 ROTAS PRIVADAS - CICLO LUNAR
// ==========================================

export const LUNAR_CYCLE_ROUTES = {
  HOME: '/ciclo-lunar',
  CALENDAR: '/ciclo-lunar/calendario',
  CALENDAR_MONTH: (month: string) => `/ciclo-lunar/calendario/${month}`, // 2025-01
  PHASES: '/ciclo-lunar/fases',
  PHASE_DETAIL: (phase: string) => `/ciclo-lunar/fases/${phase}`, // nova, crescente, cheia, minguante
  QUICK_INPUT: '/ciclo-lunar/entrada-rapida',
} as const;

// ==========================================
// 🔐 ROTAS PRIVADAS - ASTROLOGIA
// ==========================================

export const ASTROLOGY_ROUTES = {
  HOME: '/astrologia',
  NATAL_MAP: '/astrologia/mapa-natal',
  NATAL_MAP_DETAIL: (id?: string) => id ? `/astrologia/mapa-natal/${id}` : '/astrologia/mapa-natal',
  TRANSITS: '/astrologia/transitos',
  PLANETS: '/astrologia/planetas',
  PLANET_DETAIL: (planet: string) => `/astrologia/planetas/${planet}`, // venus, marte, mercurio
  PLANET_INFLUENCES: (planet: string) => `/astrologia/planetas/${planet}/influencias`,
  GALAXY: '/astrologia/galaxia',
} as const;

// ==========================================
// 🔐 ROTAS PRIVADAS - EMOCIONAL
// ==========================================

export const EMOTIONAL_ROUTES = {
  HOME: '/emocoes',
  RECORD: '/emocoes/registro',
  HISTORY: '/emocoes/historico',
  PATTERNS: '/emocoes/padroes',
} as const;

// ==========================================
// 🔐 ROTAS PRIVADAS - COMUNIDADE
// ==========================================

export const COMMUNITY_ROUTES = {
  HOME: '/comunidade',
  GROUPS: '/comunidade/grupos',
  GROUP_DETAIL: (slug: string) => `/comunidade/grupos/${slug}`, // ciclos-lunares
  CONVERSATIONS: '/comunidade/conversas',
  CONVERSATION_DETAIL: (id: string) => `/comunidade/conversas/${id}`,
  MEMBERS: '/comunidade/membros',
} as const;

// ==========================================
// 🔐 ROTAS PRIVADAS - PROJETOS
// ==========================================

export const PROJECT_ROUTES = {
  HOME: '/projetos',
  NEW: '/projetos/novo',
  DETAIL: (id: string) => `/projetos/${id}`,
  DETAIL_INFO: (id: string) => `/projetos/${id}/detalhes`,
  DETAIL_TASKS: (id: string) => `/projetos/${id}/tarefas`,
  EDIT: (id: string) => `/projetos/${id}/editar`,
} as const;

// ==========================================
// 🔐 ROTAS PRIVADAS - TIMELINE
// ==========================================

export const TIMELINE_ROUTES = {
  HOME: '/timeline',
  DAY: (date: string) => `/timeline/${date}`, // YYYY-MM-DD
} as const;

// ==========================================
// 🔐 ROTAS PRIVADAS - PERFIL
// ==========================================

export const PROFILE_ROUTES = {
  HOME: '/perfil',
  SETTINGS: '/perfil/configuracoes',
  PERSONAL_DATA: '/perfil/dados-pessoais',
  PRIVACY: '/perfil/privacidade',
  LOGOUT: '/perfil/logout',
} as const;

// ==========================================
// 📡 API ROUTES
// ==========================================

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  LUNAR_CYCLE: {
    PHASES: '/api/ciclo-lunar/fases',
    CALENDAR: '/api/ciclo-lunar/calendario',
    ENTRIES: '/api/ciclo-lunar/entradas',
    ENTRY_DETAIL: (id: string) => `/api/ciclo-lunar/entradas/${id}`,
  },
  ASTROLOGY: {
    PLANETS: '/api/astrologia/planetas',
    PLANET_DETAIL: (planet: string) => `/api/astrologia/planetas/${planet}`,
    TRANSITS: '/api/astrologia/transitos',
    NATAL_MAP: '/api/astrologia/mapa-natal',
  },
  EMOTIONAL: {
    HOME: '/api/emocoes',
    DETAIL: (id: string) => `/api/emocoes/${id}`,
  },
  COMMUNITY: {
    GROUPS: '/api/comunidade/grupos',
    CONVERSATIONS: '/api/comunidade/conversas',
  },
  PROJECTS: {
    HOME: '/api/projetos',
    DETAIL: (id: string) => `/api/projetos/${id}`,
    TASKS: (id: string) => `/api/projetos/${id}/tarefas`,
  },
  TIMELINE: {
    HOME: '/api/timeline',
    DAY: (date: string) => `/api/timeline/${date}`,
  },
  HEALTH: '/api/health',
} as const;

// ==========================================
// 🚀 DEEP LINKS (Mobile)
// ==========================================

export const DEEP_LINK_SCHEME = 'flua://';

export const DEEP_LINKS = {
  ...PUBLIC_ROUTES,
  ...DASHBOARD_ROUTES,
  ...LUNAR_CYCLE_ROUTES,
  ...ASTROLOGY_ROUTES,
  ...EMOTIONAL_ROUTES,
  ...COMMUNITY_ROUTES,
  ...PROJECT_ROUTES,
  ...TIMELINE_ROUTES,
  ...PROFILE_ROUTES,
} as const;

// ==========================================
// 🔗 TIPOS E HELPERS
// ==========================================

export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES];
export type PrivateRoute = 
  | typeof DASHBOARD_ROUTES[keyof typeof DASHBOARD_ROUTES]
  | typeof LUNAR_CYCLE_ROUTES[keyof typeof LUNAR_CYCLE_ROUTES]
  | typeof ASTROLOGY_ROUTES[keyof typeof ASTROLOGY_ROUTES]
  | typeof EMOTIONAL_ROUTES[keyof typeof EMOTIONAL_ROUTES]
  | typeof COMMUNITY_ROUTES[keyof typeof COMMUNITY_ROUTES]
  | typeof PROJECT_ROUTES[keyof typeof PROJECT_ROUTES]
  | typeof TIMELINE_ROUTES[keyof typeof TIMELINE_ROUTES]
  | typeof PROFILE_ROUTES[keyof typeof PROFILE_ROUTES];

export type AppRoute = PublicRoute | PrivateRoute;

/**
 * Gera deep link para mobile
 * @param path Caminho da rota
 * @returns URL de deep link
 */
export const generateDeepLink = (path: AppRoute): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${DEEP_LINK_SCHEME}${normalizedPath.slice(1)}`;
};

/**
 * Exemplo de uso
 */
// generateDeepLink(ASTROLOGY_ROUTES.PLANET_DETAIL('venus'))
// → 'flua://astrologia/planetas/venus'

// generateDeepLink(PROJECT_ROUTES.DETAIL('uuid-123'))
// → 'flua://projetos/uuid-123'
```

---

## 2️⃣ Hook de Navegação Typesafe

Criar `hooks/useAppRouter.ts`:

```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { AppRoute, PrivateRoute, PublicRoute } from '@/lib/constants/routes';

interface NavigationConfig {
  replace?: boolean;
  skipValidation?: boolean;
}

/**
 * Hook para navegação com type-safety
 * 
 * Benefícios:
 * - Autocomplete em IDEs
 * - Erros de digitação detectados
 * - Refatoração automática
 */
export const useAppRouter = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (route: AppRoute, config?: NavigationConfig) => {
    const { replace = false } = config || {};
    
    if (replace) {
      router.replace(route);
    } else {
      router.push(route);
    }
  };

  const navigateToPrivate = (route: PrivateRoute, config?: NavigationConfig) => {
    navigate(route, config);
  };

  const navigateToPublic = (route: PublicRoute, config?: NavigationConfig) => {
    navigate(route, config);
  };

  const isOnRoute = (route: AppRoute): boolean => {
    return pathname === route || pathname.startsWith(route);
  };

  const isOnDomain = (domain: keyof typeof DOMAIN_ROUTES): boolean => {
    const domainPath = DOMAIN_ROUTES[domain];
    return pathname.startsWith(domainPath);
  };

  return {
    navigate,
    navigateToPrivate,
    navigateToPublic,
    isOnRoute,
    isOnDomain,
    back: () => router.back(),
  };
};

// Domínios disponíveis
const DOMAIN_ROUTES = {
  dashboard: '/dashboard',
  lunar: '/ciclo-lunar',
  astrology: '/astrologia',
  emotional: '/emocoes',
  community: '/comunidade',
  projects: '/projetos',
  timeline: '/timeline',
  profile: '/perfil',
} as const;
```

**Exemplo de Uso:**

```tsx
'use client';

import { useAppRouter } from '@/hooks/useAppRouter';
import { ASTROLOGY_ROUTES } from '@/lib/constants/routes';

export default function PlanetCard({ planet }: { planet: string }) {
  const { navigate } = useAppRouter();

  return (
    <button
      onClick={() => navigate(ASTROLOGY_ROUTES.PLANET_DETAIL(planet))}
    >
      Ver detalhes de {planet}
    </button>
  );
}
```

---

## 3️⃣ Componente Link Seguro

Criar `components/shared/NavLink.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AppRoute } from '@/lib/constants/routes';
import { ReactNode } from 'react';

interface NavLinkProps {
  href: AppRoute;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  [key: string]: any;
}

/**
 * Link seguro com type-checking de rotas
 */
export const NavLink = ({
  href,
  children,
  className = '',
  activeClassName = 'text-blue-600',
  ...props
}: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`${className} ${isActive ? activeClassName : ''}`}
      {...props}
    >
      {children}
    </Link>
  );
};
```

---

## 4️⃣ Breadcrumb Dinâmico

Criar `components/shared/Breadcrumb.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AppRoute } from '@/lib/constants/routes';

interface BreadcrumbItem {
  label: string;
  href?: AppRoute;
}

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'ciclo-lunar': 'Ciclo Lunar',
  calendario: 'Calendário',
  astrologia: 'Astrologia',
  planetas: 'Planetas',
  emocoes: 'Emoções',
  comunidade: 'Comunidade',
  grupos: 'Grupos',
  conversas: 'Conversas',
  projetos: 'Projetos',
  timeline: 'Timeline',
  perfil: 'Perfil',
  configuracoes: 'Configurações',
};

/**
 * Breadcrumb automático baseado na URL
 * 
 * /astrologia/planetas/venus → Astrologia > Planetas > Vênus
 */
export const Breadcrumb = () => {
  const pathname = usePathname();
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter(s => !s.match(/^\d+$|^[a-f0-9-]{36}$/)); // Remove IDs e UUIDs

  const breadcrumbs: BreadcrumbItem[] = [];
  let currentPath = '';

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = BREADCRUMB_LABELS[segment] || capitalizeWords(segment);
    
    // Última breadcrumb não tem href
    const isLast = segment === segments[segments.length - 1];
    breadcrumbs.push({
      label,
      href: isLast ? undefined : (currentPath as AppRoute),
    });
  }

  return (
    <nav className="flex gap-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.label} className="flex items-center gap-2">
          {crumb.href ? (
            <>
              <Link href={crumb.href} className="hover:text-blue-600">
                {crumb.label}
              </Link>
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </>
          ) : (
            <span className="text-gray-900">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

function capitalizeWords(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

---

## 5️⃣ Navegação Principal Refatorada

Criar `components/navigation/NavigationMenu.tsx`:

```tsx
'use client';

import { NavLink } from '@/components/shared/NavLink';
import {
  DASHBOARD_ROUTES,
  LUNAR_CYCLE_ROUTES,
  ASTROLOGY_ROUTES,
  COMMUNITY_ROUTES,
  PROFILE_ROUTES,
} from '@/lib/constants/routes';

/**
 * Menu de navegação principal
 * 
 * Antes: hardcoded com /cosmos, /ilha
 * Depois: usa constantes centralizadas
 */
export const NavigationMenu = () => {
  return (
    <nav className="flex flex-col gap-4 p-4">
      {/* Dashboard */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
          Navegação
        </h3>
        <ul className="flex flex-col gap-2">
          <li>
            <NavLink
              href={DASHBOARD_ROUTES.HOME}
              activeClassName="text-blue-600 font-bold"
            >
              📊 Dashboard
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Exploração */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
          Exploração
        </h3>
        <ul className="flex flex-col gap-2">
          <li>
            <NavLink
              href={LUNAR_CYCLE_ROUTES.HOME}
              activeClassName="text-green-600 font-bold"
            >
              🌙 Ciclo Lunar
            </NavLink>
          </li>
          <li>
            <NavLink
              href={ASTROLOGY_ROUTES.HOME}
              activeClassName="text-purple-600 font-bold"
            >
              ✨ Astrologia
            </NavLink>
          </li>
          <li>
            <NavLink
              href={COMMUNITY_ROUTES.HOME}
              activeClassName="text-pink-600 font-bold"
            >
              👥 Comunidade
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Conta */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
          Conta
        </h3>
        <ul className="flex flex-col gap-2">
          <li>
            <NavLink
              href={PROFILE_ROUTES.HOME}
              activeClassName="text-blue-600 font-bold"
            >
              👤 Perfil
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};
```

---

## 6️⃣ Redirects no next.config.mjs

Criar backward compatibility:

```javascript
// next.config.mjs

export default {
  // ... outras configs

  async redirects() {
    return [
      // ===== COSMOS → ASTROLOGIA =====
      {
        source: '/cosmos',
        destination: '/astrologia',
        permanent: true, // 301
      },
      {
        source: '/cosmos/home',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/cosmos/galaxia/:path*',
        destination: '/astrologia/galaxia/:path*',
        permanent: true,
      },
      {
        source: '/cosmos/planeta/:path*',
        destination: '/astrologia/planetas/:path*',
        permanent: true,
      },
      {
        source: '/cosmos/sol/:path*',
        destination: '/astrologia/planetas/sol/:path*',
        permanent: true,
      },
      {
        source: '/cosmos/lua/:path*',
        destination: '/ciclo-lunar/:path*',
        permanent: true,
      },
      {
        source: '/cosmos/calendarioc/:path*',
        destination: '/ciclo-lunar/calendario/:path*',
        permanent: true,
      },
      {
        source: '/cosmos/calendariog/:path*',
        destination: '/ciclo-lunar/calendario/:path*',
        permanent: true,
      },

      // ===== ILHA → COMUNIDADE =====
      {
        source: '/ilha',
        destination: '/comunidade',
        permanent: true,
      },
      {
        source: '/ilha/:path*',
        destination: '/comunidade/:path*',
        permanent: true,
      },

      // ===== ROOT CONFUSO =====
      {
        source: '/(root)',
        destination: '/',
        permanent: true,
      },
      {
        source: '/page',
        destination: '/dashboard',
        permanent: true,
      },

      // ===== NOVOS ONBOARDING =====
      {
        source: '/onboarding-inicio',
        destination: '/onboarding/primeiro-acesso',
        permanent: true,
      },
    ];
  },
};
```

---

## 7️⃣ Verificação de Rotas

Script `scripts/verify-routes.ts`:

```typescript
/**
 * Script para verificar se todas as rotas estão mapeadas
 * Run: npx tsx scripts/verify-routes.ts
 */

import fs from 'fs';
import path from 'path';

const appDir = './app';
const routesFile = './lib/constants/routes.ts';

interface RouteFile {
  path: string;
  isApiRoute: boolean;
  isDynamic: boolean;
}

function findAllRoutes(dir: string, prefix = ''): RouteFile[] {
  const routes: RouteFile[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const routePath = prefix + '/' + entry.name;

    // Ignorar arquivos especiais e diretórios
    if (
      entry.name.startsWith('.') ||
      entry.name.startsWith('_') ||
      entry.name.includes('.')
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      const isRouteGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
      const prefix_ = isRouteGroup ? prefix : routePath;

      routes.push(...findAllRoutes(fullPath, prefix_));
    } else if (entry.name === 'page.tsx' || entry.name === 'route.ts') {
      const isDynamic = routePath.includes('[');
      const isApiRoute = routePath.includes('/api/');

      routes.push({
        path: routePath.replace(/^\//, ''),
        isDynamic,
        isApiRoute,
      });
    }
  }

  return routes;
}

const allRoutes = findAllRoutes(appDir);

console.log('\n🗺️  Rotas encontradas no projeto:\n');
allRoutes
  .filter(r => !r.isDynamic && !r.isApiRoute)
  .forEach(r => console.log(`  /${r.path}`));

console.log('\n\n📡 API Routes encontradas:\n');
allRoutes
  .filter(r => r.isApiRoute)
  .forEach(r => console.log(`  /${r.path}`));

console.log('\n\n✅ Total de rotas: ' + allRoutes.length);
console.log('📝 Verificar se todas estão mapeadas em lib/constants/routes.ts');
```

---

## 8️⃣ Arquivo de Exemplo Antes/Depois

### ❌ ANTES - Componente Desorganizado

```tsx
// components/CosmosNavigation.tsx
export const CosmosNavigation = () => {
  return (
    <nav>
      <a href="/cosmos/home">Home</a>
      <a href="/cosmos/galaxia">Galeria</a>
      <a href="/cosmos/planeta">Planetas</a>
      <a href="/cosmos/lua">Ciclo Lunar</a>
      <a href="/cosmos/calendarioc">Calendário</a>
      <a href="/ilha">Comunidade</a>
      <a href="/">Landing</a>
    </nav>
  );
};

// Como redirecionar?
// Hardcoded em componentes
// Duplicado em múltiplos arquivos
// Fácil quebrar ao renomear rotas
```

### ✅ DEPOIS - Centralizado e Type-safe

```tsx
// components/navigation/NavigationMenu.tsx
'use client';

import { NavLink } from '@/components/shared/NavLink';
import {
  DASHBOARD_ROUTES,
  ASTROLOGY_ROUTES,
  LUNAR_CYCLE_ROUTES,
  COMMUNITY_ROUTES,
} from '@/lib/constants/routes';

export const NavigationMenu = () => {
  return (
    <nav>
      <NavLink href={DASHBOARD_ROUTES.HOME}>
        📊 Dashboard
      </NavLink>
      <NavLink href={ASTROLOGY_ROUTES.GALAXY}>
        ✨ Galáxia
      </NavLink>
      <NavLink href={ASTROLOGY_ROUTES.PLANETS}>
        🪐 Planetas
      </NavLink>
      <NavLink href={LUNAR_CYCLE_ROUTES.HOME}>
        🌙 Ciclo Lunar
      </NavLink>
      <NavLink href={LUNAR_CYCLE_ROUTES.CALENDAR}>
        📅 Calendário
      </NavLink>
      <NavLink href={COMMUNITY_ROUTES.HOME}>
        👥 Comunidade
      </NavLink>
      <NavLink href={PUBLIC_ROUTES.HOME}>
        🌐 Home
      </NavLink>
    </nav>
  );
};

// Benefícios:
// ✅ Sem hardcoded paths
// ✅ Type-safe (IDE autocomplete)
// ✅ Centralizado (1 lugar pra atualizar)
// ✅ Fácil refatorar (F2 em VS Code)
// ✅ Legível e consistente
```

---

## 9️⃣ Teste de Deep Links

```typescript
// __tests__/routes/deep-links.test.ts

import { generateDeepLink } from '@/lib/constants/routes';
import {
  ASTROLOGY_ROUTES,
  LUNAR_CYCLE_ROUTES,
  PROJECT_ROUTES,
} from '@/lib/constants/routes';

describe('Deep Links', () => {
  it('should generate valid deep links', () => {
    expect(generateDeepLink(ASTROLOGY_ROUTES.PLANET_DETAIL('venus')))
      .toBe('flua://astrologia/planetas/venus');

    expect(generateDeepLink(LUNAR_CYCLE_ROUTES.CALENDAR))
      .toBe('flua://ciclo-lunar/calendario');

    expect(generateDeepLink(PROJECT_ROUTES.DETAIL('uuid-123')))
      .toBe('flua://projetos/uuid-123');
  });

  it('should handle dynamic routes', () => {
    const deepLink = generateDeepLink(ASTROLOGY_ROUTES.PLANET_INFLUENCES('venus'));
    expect(deepLink).toBe('flua://astrologia/planetas/venus/influencias');
  });
});
```

---

## 🔟 Checklist de Migração

```markdown
# Checklist de Migração de Rotas

## Fase 1: Setup
- [ ] Criar `lib/constants/routes.ts`
- [ ] Criar `hooks/useAppRouter.ts`
- [ ] Criar `components/shared/NavLink.tsx`
- [ ] Atualizar `next.config.mjs` com redirects
- [ ] Criar testes de deep links

## Fase 2: Público
- [ ] Reorganizar (public)/ group
- [ ] Atualizar landing page
- [ ] Criar /onboarding
- [ ] Atualizar links em layout público
- [ ] Testar navegação pública

## Fase 3: Privado - Domínios
- [ ] Dashboard (cosmos/home → dashboard)
- [ ] Ciclo Lunar (cosmos/lua → ciclo-lunar)
- [ ] Astrologia (cosmos/planeta + cosmos/sol → astrologia)
- [ ] Comunidade (ilha → comunidade)
- [ ] Emocional (novo domínio)
- [ ] Projetos (novo domínio)
- [ ] Timeline
- [ ] Perfil

## Fase 4: API Routes
- [ ] Reorganizar api/ por domínio
- [ ] Atualizar endpoints
- [ ] Testar cada endpoint
- [ ] Atualizar lib/constants/routes.ts APIs

## Fase 5: Componentes
- [ ] Atualizar NavigationMenu
- [ ] Atualizar Breadcrumb
- [ ] Atualizar todas as rotas hardcoded
- [ ] Buscar /cosmos, /ilha, /page em arquivos
- [ ] Atualizar links em emails/notificações

## Fase 6: Mobile
- [ ] Configurar capacitor.config.ts
- [ ] Criar apple-app-site-association
- [ ] Configurar AndroidManifest.xml
- [ ] Testar deep links iOS
- [ ] Testar deep links Android

## Fase 7: SEO & QA
- [ ] Atualizar robots.txt
- [ ] Gerar novo sitemap.xml
- [ ] Testar com Google Search Console
- [ ] Validar Rich Results
- [ ] Teste E2E de todas rotas
- [ ] Performance test
- [ ] Acessibilidade test

## Fase 8: Lançamento
- [ ] Deploy em staging
- [ ] Monitorar 404s
- [ ] Verificar analytics
- [ ] Deploy em produção
- [ ] Monitorar métricas
- [ ] Analisar impacto SEO (7 dias)
```

---

## 📚 Recursos Complementares

- [TypeScript Path Aliases](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [React Router Patterns](https://reactrouter.com/docs/guides/patterns)

