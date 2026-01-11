# 📱 Guia de Compatibilidade WebView & Hybrid Apps

Este documento detalha a estratégia para tornar o Cosmic Space compatível com WebView (Capacitor) e ambientes web, eliminando URLs hardcoded.

## 📋 Índice

1. [Problema](#problema)
2. [Estratégia de Environment Variables](#estratégia-de-environment-variables)
3. [Detecção de Plataforma](#detecção-de-plataforma)
4. [Exemplos de Código](#exemplos-de-código)
5. [Erros Comuns](#erros-comuns)
6. [Checklist de Migração](#checklist-de-migração)

---

## 🚨 Problema

URLs hardcoded como `https://flua.vercel.app` causam problemas em apps híbridos:

| Ambiente | Problema com Hardcoding |
|----------|------------------------|
| **WebView (Capacitor)** | App carrega de `capacitor://localhost` ou `file://`, não tem "mesma origem" |
| **Staging/Preview** | Cada deploy Vercel gera URL diferente |
| **Desenvolvimento Local** | `localhost:3000` vs IP da máquina para testar no celular |
| **Multi-tenant** | Impossível ter múltiplos domínios |

---

## 🔧 Estratégia de Environment Variables

### Variáveis Principais

```env
# .env.local / .env.production

# 🌐 URL BASE DO APP (OBRIGATÓRIA para mobile)
# Local: http://localhost:3000 ou http://192.168.1.X:3000
# Prod:  https://flua.app
NEXT_PUBLIC_APP_URL=https://flua.app

# 🔌 URL DA API (opcional, se diferente do app)
# Útil se a API está em outro servidor/subdomínio
NEXT_PUBLIC_API_URL=

# 📱 DEEP LINKS
NEXT_PUBLIC_APP_SCHEME=flua://
NEXT_PUBLIC_APP_DOMAIN=flua.app

# 📊 REDES SOCIAIS (opcional)
NEXT_PUBLIC_SOCIAL_INSTAGRAM=https://instagram.com/fluaapp
```

### Hierarquia de Prioridade

O módulo `@/lib/platform` usa esta ordem:

1. `NEXT_PUBLIC_APP_URL` (explícita)
2. `NEXT_PUBLIC_VERCEL_URL` (auto-injetada pela Vercel)
3. `window.location.origin` (runtime no browser)
4. String vazia (URLs relativas)

### Configuração por Ambiente

```env
# .env.local (desenvolvimento)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env.staging (preview)
# Deixe vazio - Vercel auto-injeta NEXT_PUBLIC_VERCEL_URL

# .env.production
NEXT_PUBLIC_APP_URL=https://flua.app
```

---

## 📱 Detecção de Plataforma

### Uso Básico

```typescript
import { platform, env } from '@/lib/platform';

// Verificar plataforma
console.log(platform.current);  // 'web' | 'ios' | 'android' | 'server'
console.log(platform.isNative); // true se iOS ou Android
console.log(platform.isWeb);    // true se browser
console.log(platform.isServer); // true se SSR

// Acessar URLs
console.log(env.appUrl);        // 'https://flua.app'
console.log(env.apiBaseUrl);    // '' (web) ou 'https://flua.app' (native)
```

### Renderização Condicional

```tsx
import { platform } from '@/lib/platform';

export function NavigationBar() {
  return (
    <nav>
      {/* Botão voltar só aparece em mobile */}
      {platform.isNative && <BackButton />}
      
      {/* Download app só aparece na web */}
      {platform.isWeb && <DownloadAppBanner />}
    </nav>
  );
}
```

### Hook React (opcional)

```typescript
// hooks/usePlatform.ts
import { useState, useEffect } from 'react';
import { platform, PlatformType } from '@/lib/platform';

export function usePlatform() {
  const [current, setCurrent] = useState<PlatformType>('server');

  useEffect(() => {
    setCurrent(platform.current);
  }, []);

  return {
    current,
    isNative: current === 'ios' || current === 'android',
    isWeb: current === 'web',
    isIOS: current === 'ios',
    isAndroid: current === 'android',
    isHydrated: current !== 'server',
  };
}
```

---

## 💻 Exemplos de Código

### ❌ Antes (Hardcoded)

```typescript
// 🚫 Ruim - URL hardcoded
const response = await fetch('https://flua.vercel.app/api/moons');

// 🚫 Ruim - URL relativa em WebView não funciona
const response = await fetch('/api/moons');

// 🚫 Ruim - Verificação manual do Capacitor
const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
```

### ✅ Depois (Dinâmico)

```typescript
import { env, platform } from '@/lib/platform';

// ✅ Bom - URL dinâmica baseada no ambiente
const response = await fetch(env.apiUrl('/api/moons'));

// ✅ Bom - Detecção de plataforma tipada
if (platform.isNative) {
  // Lógica específica para mobile
}
```

### Exemplo: Fetch de API

```typescript
// lib/api/moons.ts
import { env } from '@/lib/platform';

export async function fetchLunations(year: number) {
  const url = env.apiUrl(`/api/moons/lunations?year=${year}`);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch lunations: ${response.status}`);
  }
  
  return response.json();
}
```

### Exemplo: Deep Links

```typescript
import { deepLinks, platform } from '@/lib/platform';

export function shareContent(path: string) {
  if (platform.isNative) {
    // No app, usa deep link
    const url = deepLinks.build(path);
    // flua://cosmos/planeta
    navigator.share({ url });
  } else {
    // Na web, usa URL completa
    const url = env.pageUrl(path);
    // https://flua.app/cosmos/planeta
    navigator.share({ url });
  }
}
```

### Exemplo: Assets em Capacitor

```typescript
import { env, platform } from '@/lib/platform';

export function ImageWithFallback({ src, alt }: { src: string; alt: string }) {
  // Capacitor precisa converter paths locais
  const imageSrc = env.assetUrl(src);
  
  return <img src={imageSrc} alt={alt} />;
}
```

### Exemplo: Metadados SEO

```typescript
// app/layout.tsx
import { env } from '@/lib/platform';

export async function generateMetadata() {
  const baseUrl = env.appUrl;
  
  return {
    metadataBase: new URL(baseUrl || 'https://flua.app'),
    openGraph: {
      url: baseUrl,
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}
```

---

## ⚠️ Erros Comuns

### 1. URLs Relativas em WebView

**Problema:** WebView carrega de `capacitor://localhost`, não do seu servidor.

```typescript
// 🚫 Não funciona em Capacitor
fetch('/api/moons')

// ✅ Funciona em todos os ambientes
fetch(env.apiUrl('/api/moons'))
```

### 2. CORS em Desenvolvimento

**Problema:** Testar no celular físico com `localhost` não funciona.

**Solução:** Use IP da máquina local:

```env
# .env.local para teste mobile
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000
```

```typescript
// capacitor.config.ts - apenas desenvolvimento
const config: CapacitorConfig = {
  server: {
    url: 'http://192.168.1.100:3000',
    cleartext: true, // Permite HTTP em Android
  },
};
```

### 3. Mixed Content (HTTPS/HTTP)

**Problema:** App em HTTPS tentando carregar recursos HTTP.

**Solução Android:**

```typescript
// capacitor.config.ts
android: {
  allowMixedContent: true, // Apenas dev!
}
```

**Solução iOS:** Adicione exceção no `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

### 4. Variáveis de Ambiente Não Carregam

**Problema:** `process.env.NEXT_PUBLIC_*` retorna `undefined` em runtime.

**Causa:** Next.js "inlineia" variáveis `NEXT_PUBLIC_*` no build time.

**Solução:**
- Variáveis precisam existir durante `next build`
- Em Vercel, configure nas Environment Variables do projeto
- Rebuild após alterar variáveis

### 5. SSR vs Client Mismatch

**Problema:** Hydration error por diferença entre server e client.

```typescript
// 🚫 Causa hydration mismatch
export function Component() {
  // No server, platform.isNative é sempre false
  return platform.isNative ? <MobileNav /> : <WebNav />;
}
```

**Solução:** Use `useEffect` ou Suspense:

```typescript
// ✅ Espera hydration
export function Component() {
  const [isNative, setIsNative] = useState(false);
  
  useEffect(() => {
    setIsNative(platform.isNative);
  }, []);
  
  return isNative ? <MobileNav /> : <WebNav />;
}
```

### 6. Esquecer de Configurar em Produção

**Problema:** Funciona local mas quebra em produção.

**Checklist Vercel:**
1. Settings → Environment Variables
2. Adicione `NEXT_PUBLIC_APP_URL` = `https://seudominio.com`
3. Adicione para Production, Preview e Development
4. Redeploy para aplicar

---

## ✅ Checklist de Migração

### Código

- [ ] Buscar todos os `flua.vercel.app` no código
- [ ] Substituir por `env.appUrl` ou `env.apiUrl()`
- [ ] Substituir `getBaseUrl()` por `env.apiBaseUrl`
- [ ] Substituir `isCapacitor()` por `platform.isNative`
- [ ] Verificar metadados SEO usam URLs dinâmicas
- [ ] Testar deep links

### Configuração

- [ ] Atualizar `.env.example` com novas variáveis
- [ ] Configurar Vercel com `NEXT_PUBLIC_APP_URL`
- [ ] Configurar domínio para Universal Links (iOS)
- [ ] Configurar domínio para App Links (Android)

### Testes

- [ ] Testar em browser local
- [ ] Testar em celular via IP local
- [ ] Testar build de produção local (`next build && next start`)
- [ ] Testar em simulador iOS
- [ ] Testar em emulador Android
- [ ] Testar deploy de preview Vercel
- [ ] Testar deploy de produção

---

## 📚 Referências

- [Capacitor Configuration](https://capacitorjs.com/docs/config)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [iOS Universal Links](https://developer.apple.com/ios/universal-links/)
- [Android App Links](https://developer.android.com/training/app-links)
