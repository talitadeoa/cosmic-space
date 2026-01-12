# Core Web Vitals Monitoring - Plano de Implementação

## 📊 O que são Core Web Vitals?

Os Core Web Vitals são métricas essenciais de experiência do usuário definidas pelo Google:

| Métrica | Threshold | Bom | Ruim |
|---------|-----------|-----|------|
| **LCP** (Largest Contentful Paint) | Tempo de carregamento do maior elemento | < 2.5s | > 4s |
| **FID** (First Input Delay) | Resposta a primeira interação | < 100ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | Estabilidade visual | < 0.1 | > 0.25 |
| **INP** (Interaction to Next Paint) | Velocidade de resposta a interações | < 200ms | > 500ms |

## 🎯 Estratégia de Monitoramento

### 1. Implementação de Web Vitals Lib

**Arquivo**: `lib/monitoring/webVitals.ts`

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';

export interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
}

export function setupWebVitalsMonitoring() {
  // LCP - Largest Contentful Paint
  getLCP((metric) => {
    logVital({
      name: 'LCP',
      value: metric.value,
      rating: metric.rating as any,
      id: metric.id,
    });
  });

  // FID - First Input Delay
  getFID((metric) => {
    logVital({
      name: 'FID',
      value: metric.value,
      rating: metric.rating as any,
      id: metric.id,
    });
  });

  // CLS - Cumulative Layout Shift
  getCLS((metric) => {
    logVital({
      name: 'CLS',
      value: metric.value,
      rating: metric.rating as any,
      id: metric.id,
    });
  });

  // INP - Interaction to Next Paint
  getINP((metric) => {
    logVital({
      name: 'INP',
      value: metric.value,
      rating: metric.rating as any,
      id: metric.id,
    });
  });

  // FCP - First Contentful Paint
  getFCP((metric) => {
    logVital({
      name: 'FCP',
      value: metric.value,
      rating: metric.rating as any,
      id: metric.id,
    });
  });

  // TTFB - Time to First Byte
  getTTFB((metric) => {
    logVital({
      name: 'TTFB',
      value: metric.value,
      rating: metric.rating as any,
      id: metric.id,
    });
  });
}

function logVital(metric: VitalMetric) {
  // 1. Logar no console (dev)
  console.log('📊 Web Vital:', {
    name: metric.name,
    value: `${metric.value.toFixed(2)}ms`,
    rating: metric.rating,
  });

  // 2. Enviar para analytics (Vercel, Google Analytics)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'web_vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // 3. Enviar para API de monitoramento customizado
  sendToMonitoringService(metric);
}

async function sendToMonitoringService(metric: VitalMetric) {
  try {
    await fetch('/api/monitoring/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    console.error('Erro ao enviar Web Vital:', error);
  }
}
```

### 2. Integração no Layout Root

**Arquivo**: `app/layout.tsx`

```typescript
'use client';

import { setupWebVitalsMonitoring } from '@/lib/monitoring/webVitals';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Iniciar monitoramento de Web Vitals
    setupWebVitalsMonitoring();

    // Monitorar erros
    setupErrorMonitoring();

    // Monitorar performance de navegação
    setupNavigationMonitoring();
  }, []);

  return (
    <html lang="pt-BR">
      <head>
        {/* ... */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Dashboard de Monitoramento

**Arquivo**: `app/api/monitoring/vitals.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Salvar no banco de dados ou serviço de analytics
    const vitalRecord = {
      ...data,
      timestamp: new Date(),
      sessionId: request.headers.get('x-session-id'),
    };

    // Exemplo com Supabase/PostgreSQL
    // await db.insert('web_vitals').values(vitalRecord);

    // Log para observabilidade
    console.log('📊 Web Vital Recorded:', vitalRecord);

    // Alertar se métrica está ruim
    if (data.rating === 'poor') {
      await notifyOnSlackOrEmail(data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar Web Vital:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function notifyOnSlackOrEmail(metric: any) {
  // Implementar notificação para alertar time
  // quando performance cai
}
```

### 4. Otimizações Recomendadas

#### Para LCP (Largest Contentful Paint)

```typescript
// 1. Lazy load imagens
<Image
  src="/image.jpg"
  alt="..."
  loading="lazy"
  placeholder="blur"
/>

// 2. Usar Next.js Image Optimization
import Image from 'next/image';

// 3. Otimizar recursos críticos
<link rel="preload" as="image" href="hero-image.jpg" />
<link rel="preconnect" href="https://cdn.example.com" />

// 4. Minificar CSS/JS em produção
```

#### Para FID/INP (Input Delay)

```typescript
// 1. Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Carregando...</div>,
});

// 2. Web Workers para processamento pesado
const worker = new Worker('/workers/processing.js');

// 3. Usar requestIdleCallback para tarefas não-críticas
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Tarefa de baixa prioridade
  });
}

// 4. Debounce/throttle de eventos
function debounce(fn: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

#### Para CLS (Cumulative Layout Shift)

```typescript
// 1. Definir dimensões de imagens
<img width="100" height="100" src="..." />

// 2. Evitar inserção de elementos dinâmicos acima do fold
// Usar containers com altura fixa

// 3. Usar transform/opacity ao invés de width/height
// ❌ Ruim
element.style.width = newWidth;

// ✅ Bom
element.style.transform = 'scaleX(...)';
element.style.opacity = newOpacity;

// 4. Evitar fontes que causam FOIT/FOUT
@font-face {
  font-display: swap; // Usar fallback imediatamente
}
```

## 📈 Dashboard de Visualização

### Usando Vercel Analytics (recomendado para Next.js)

```typescript
// pages/_app.tsx ou layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Usando Google Looker Studio

1. Conectar Google Analytics ao Looker Studio
2. Criar dashboard com:
   - Gráfico de tendência de LCP
   - Gráfico de tendência de FID
   - Gráfico de tendência de CLS
   - Distribuição de ratings (Good/NeedsImprovement/Poor)

## 🚀 Checklist de Implementação

- [ ] Instalar `web-vitals` lib: `npm install web-vitals`
- [ ] Criar `lib/monitoring/webVitals.ts`
- [ ] Integrar no layout root
- [ ] Criar rota API para receber métricas
- [ ] Configurar Google Analytics/Vercel Analytics
- [ ] Criar dashboard de visualização
- [ ] Implementar otimizações de LCP
- [ ] Implementar otimizações de FID/INP
- [ ] Implementar otimizações de CLS
- [ ] Configurar alertas para quando métricas deteriorarem
- [ ] Testar em diferentes dispositivos/conexões
- [ ] Documentar baselines de desempenho

## 📊 Metas de Performance

| Métrica | Atual | Alvo (6 meses) |
|---------|-------|----------------|
| LCP | ? | < 2.5s |
| FID | ? | < 100ms |
| CLS | ? | < 0.1 |
| INP | ? | < 200ms |
| Lighthouse Score | ? | 90+ |

## 🔗 Recursos

- [Web Vitals by Google](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/learn/seo/web-performance)
- [Vercel Analytics](https://vercel.com/analytics)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## 💡 Tips

1. **Monitorar em produção** - As métricas em dev não representam usuários reais
2. **Comparar com competidores** - Use ferramentas como Speedcurve
3. **Testar em dispositivos reais** - Use Chrome DevTools Remote Debugging
4. **Usar Web Vitals em Lab (DevTools)** e Field (Real Users)**
5. **Automatizar testes** com Lighthouse CI no CI/CD
