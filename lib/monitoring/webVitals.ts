/**
 * Web Vitals Monitoring
 * Coleta e envia métricas de Web Vitals para análise
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';

export interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  timestamp?: string;
  page?: string;
}

const vitals: VitalMetric[] = [];

export function setupWebVitalsMonitoring() {
  if (typeof window === 'undefined') return;

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
  const fullMetric: VitalMetric = {
    ...metric,
    timestamp: new Date().toISOString(),
    page: typeof window !== 'undefined' ? window.location.pathname : undefined,
  };

  vitals.push(fullMetric);

  // Log no console
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vital:', {
      name: metric.name,
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
    });
  }

  // Enviar para Google Analytics
  sendToAnalytics(fullMetric);

  // Enviar para API de monitoramento
  sendToMonitoringService(fullMetric);
}

function sendToAnalytics(metric: VitalMetric) {
  if (typeof window === 'undefined') return;

  const gtag = (window as any).gtag;
  if (!gtag) return;

  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'web_vitals',
    event_label: metric.id,
    rating: metric.rating,
    non_interaction: true,
  });
}

async function sendToMonitoringService(metric: VitalMetric) {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/monitoring/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true, // Garante que a requisição seja enviada mesmo ao navegar
    });
  } catch (error) {
    console.error('Erro ao enviar Web Vital:', error);
  }
}

export function getVitals(): VitalMetric[] {
  return [...vitals];
}

export function getVitalByName(name: string): VitalMetric | undefined {
  return vitals.find((v) => v.name === name);
}

export function clearVitals() {
  vitals.length = 0;
}
