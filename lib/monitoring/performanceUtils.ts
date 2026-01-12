/**
 * Performance Monitoring Utilities
 * Funções auxiliares para monitoramento de performance
 */

import { VitalMetric } from './webVitals';

/**
 * Calcula estatísticas a partir de um array de métricas
 */
export function calculateVitalsStats(vitals: VitalMetric[]) {
  if (vitals.length === 0) {
    return null;
  }

  const grouped = vitals.reduce(
    (acc, vital) => {
      if (!acc[vital.name]) {
        acc[vital.name] = [];
      }
      acc[vital.name].push(vital.value);
      return acc;
    },
    {} as Record<string, number[]>
  );

  const stats = Object.entries(grouped).map(([name, values]) => ({
    name,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    median: getMedian(values),
    count: values.length,
  }));

  return stats;
}

/**
 * Calcula a mediana de um array
 */
function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Verifica se uma métrica está dentro do limite aceitável
 */
export function isVitalHealthy(name: string, value: number): boolean {
  const thresholds: Record<string, { good: number; needsImprovement: number }> = {
    LCP: { good: 2500, needsImprovement: 4000 },
    FID: { good: 100, needsImprovement: 300 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    INP: { good: 200, needsImprovement: 500 },
    TTFB: { good: 600, needsImprovement: 1800 },
    FCP: { good: 1800, needsImprovement: 3000 },
  };

  const threshold = thresholds[name];
  if (!threshold) return true;

  return value <= threshold.good;
}

/**
 * Formata valor de métrica com unidade apropriada
 */
export function formatMetricValue(name: string, value: number): string {
  if (name === 'CLS') {
    return value.toFixed(3);
  }

  return `${Math.round(value)}ms`;
}

/**
 * Cria alertas baseados em thresholds
 */
export function createVitalAlert(vital: VitalMetric): string | null {
  if (vital.rating === 'good') return null;

  const threshold =
    vital.rating === 'needs-improvement'
      ? 'precisa de melhoria'
      : 'crítico';

  return `${vital.name} está ${threshold}: ${formatMetricValue(vital.name, vital.value)}`;
}

/**
 * Amostra de dados para reduzir envio (1 a cada N requisições)
 */
export function shouldSampleMetric(sampleRate: number = 0.1): boolean {
  return Math.random() < sampleRate;
}

/**
 * Aguarda até que uma métrica específica esteja disponível
 */
export function waitForVital(
  name: string,
  vitals: VitalMetric[],
  maxWait: number = 30000
): Promise<VitalMetric | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkVital = () => {
      const vital = vitals.find((v) => v.name === name);

      if (vital) {
        resolve(vital);
        return;
      }

      if (Date.now() - startTime > maxWait) {
        resolve(null);
        return;
      }

      // Verificar novamente em 100ms
      setTimeout(checkVital, 100);
    };

    checkVital();
  });
}

/**
 * Compara métricas para detectar regressão de performance
 */
export function detectPerformanceRegression(
  previous: VitalMetric[],
  current: VitalMetric[],
  threshold: number = 0.1 // 10% de piora
): string[] {
  const alerts: string[] = [];

  current.forEach((currentVital) => {
    const prevVital = previous.find((v) => v.name === currentVital.name);

    if (prevVital) {
      const increase = (currentVital.value - prevVital.value) / prevVital.value;

      if (increase > threshold) {
        alerts.push(
          `⚠️ Regressão detectada em ${currentVital.name}: +${(increase * 100).toFixed(1)}%`
        );
      }
    }
  });

  return alerts;
}
