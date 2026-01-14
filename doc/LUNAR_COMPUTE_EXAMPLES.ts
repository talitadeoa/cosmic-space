/**
 * Exemplos de Integração - Lunar Compute Service
 * Mostra como usar o serviço em diferentes contextos
 */

// ============================================================================
// Exemplo 1: Hook React para Fase Lunar em Tempo Real
// ============================================================================

import { useEffect, useState } from 'react';
import { lunarComputeClient, type LunarPhaseResponse } from '@/lib/lunar-compute-client';

export function useLunarPhaseNow() {
  const [phase, setPhase] = useState<LunarPhaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPhase = async () => {
      try {
        const result = await lunarComputeClient.getLunarPhase(new Date(), {
          includeZodiac: true,
        });
        setPhase(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchPhase();

    // Refetch a cada hora
    const interval = setInterval(fetchPhase, 3600000);
    return () => clearInterval(interval);
  }, []);

  return { phase, loading, error };
}

// Uso:
export function MoonPhaseWidget() {
  const { phase, loading } = useLunarPhaseNow();

  if (loading) return <div>Carregando...</div>;
  if (!phase) return null;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{phase.zodiac_emoji}</h3>
      <p className="text-sm">{phase.phase}</p>
      <div className="h-2 w-full bg-gray-200 rounded">
        <div
          className="h-full bg-blue-500 rounded"
          style={{ width: `${phase.illumination * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">
        {Math.round(phase.illumination * 100)}% iluminada
      </p>
    </div>
  );
}

// ============================================================================
// Exemplo 2: Componente de Calendário com Fases Lunares
// ============================================================================

export async function LunarCalendarPrecomputed({ year, month }: { year: number; month: number }) {
  // Gerar todas as datas do mês
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) =>
    new Date(year, month - 1, i + 1)
  );

  // Calcular fases em batch (muito mais rápido)
  const phases = await lunarComputeClient.getLunarBatch(dates, { includeZodiac: true });

  return (
    <div className="grid grid-cols-7 gap-2">
      {phases.map((phase, i) => (
        <div key={i} className="border rounded p-2">
          <div className="text-sm font-semibold">{i + 1}</div>
          <div className="text-2xl">{getPhaseEmoji(phase.phase)}</div>
          <div className="text-xs">{Math.round(phase.illumination * 100)}%</div>
        </div>
      ))}
    </div>
  );
}

function getPhaseEmoji(phase: string): string {
  const emojis: Record<string, string> = {
    new: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
  };
  return emojis[phase] || '🌙';
}

// ============================================================================
// Exemplo 3: Service Worker para Cache de Cálculos
// ============================================================================

// lib/lunar-cache-service.ts
import { LunarPhaseResponse } from '@/lib/lunar-compute-client';

class LunarCacheService {
  private cache: Map<string, LunarPhaseResponse> = new Map();
  private cacheMaxAge = 3600000; // 1 hora

  async getPhaseWithCache(date: Date, includeZodiac = false): Promise<LunarPhaseResponse> {
    const key = `${date.toDateString()}-${includeZodiac}`;

    // Verificar cache
    const cached = this.cache.get(key);
    if (cached) {
      console.log('Cache hit for', key);
      return cached;
    }

    // Buscar do serviço
    const result = await lunarComputeClient.getLunarPhase(date, { includeZodiac });

    // Guardar no cache
    this.cache.set(key, result);

    // Limpar cache após expiração
    setTimeout(() => this.cache.delete(key), this.cacheMaxAge);

    return result;
  }

  async getBatchWithCache(dates: Date[], includeZodiac = false): Promise<LunarPhaseResponse[]> {
    const cached: LunarPhaseResponse[] = [];
    const toFetch: { index: number; date: Date }[] = [];

    // Separar dados em cache vs a buscar
    dates.forEach((date, index) => {
      const key = `${date.toDateString()}-${includeZodiac}`;
      const cached_result = this.cache.get(key);

      if (cached_result) {
        cached.push({ ...cached_result, date: date.toISOString() });
      } else {
        toFetch.push({ index, date });
      }
    });

    // Buscar dados faltantes
    if (toFetch.length > 0) {
      const fetched = await lunarComputeClient.getLunarBatch(
        toFetch.map(x => x.date),
        { includeZodiac }
      );

      fetched.forEach((result, i) => {
        const key = `${toFetch[i].date.toDateString()}-${includeZodiac}`;
        this.cache.set(key, result);
        cached.push(result);
      });
    }

    return cached.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export const lunarCache = new LunarCacheService();

// Uso:
const phase = await lunarCache.getPhaseWithCache(new Date()); // Cache automático

// ============================================================================
// Exemplo 4: Geração de Arquivo Estático (Build Time)
// ============================================================================

// scripts/generate-lunar-static.ts
import { lunarComputeClient } from '@/lib/lunar-compute-client';
import fs from 'fs';
import path from 'path';

async function generateLunarStatic() {
  console.log('🌙 Gerando dados lunares estáticos...');

  const year = new Date().getFullYear();

  // Gerar lunações do ano
  const lunations = await lunarComputeClient.getLunationsYear(year);

  // Salvar como JSON
  const outputPath = path.join(process.cwd(), 'public', 'lunar-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(lunations, null, 2));

  console.log(`✅ Dados salvos em ${outputPath}`);

  // Gerar próximos 2 anos também
  for (let y = year; y <= year + 2; y++) {
    const data = await lunarComputeClient.getLunationsYear(y);
    const filePath = path.join(process.cwd(), 'public', `lunar-${y}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  console.log('✅ Dados de 3 anos gerados com sucesso!');
}

generateLunarStatic().catch(console.error);

// Adicionar ao package.json:
// "scripts": {
//   "generate:lunar": "tsx scripts/generate-lunar-static.ts",
//   "build": "npm run generate:lunar && next build"
// }

// ============================================================================
// Exemplo 5: Integração com Streaming de Fases (SSE)
// ============================================================================

// app/api/compute/lunar-stream/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { lunarComputeClient } from '@/lib/lunar-compute-client';

export async function GET(request: NextRequest) {
  const startDateStr = request.nextUrl.searchParams.get('start');
  const endDateStr = request.nextUrl.searchParams.get('end');

  if (!startDateStr || !endDateStr) {
    return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Criar stream de eventos
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Gerar datas diárias
        const dates: Date[] = [];
        let current = new Date(startDate);
        while (current <= endDate) {
          dates.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }

        // Processar em chunks
        const chunkSize = 30; // 30 dias por chunk
        for (let i = 0; i < dates.length; i += chunkSize) {
          const chunk = dates.slice(i, i + chunkSize);
          const phases = await lunarComputeClient.getLunarBatch(chunk, {
            includeZodiac: true,
          });

          // Enviar chunk
          const data = `data: ${JSON.stringify(phases)}\n\n`;
          controller.enqueue(encoder.encode(data));

          // Delay entre chunks
          await new Promise(r => setTimeout(r, 100));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Uso no frontend:
const eventSource = new EventSource(
  `/api/compute/lunar-stream?start=2025-01-01&end=2025-12-31`
);

eventSource.onmessage = (event) => {
  const phases = JSON.parse(event.data);
  console.log('Received batch:', phases);
  // Atualizar UI
};

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};

// ============================================================================
// Exemplo 6: Performance Comparison (JavaScript vs Python)
// ============================================================================

async function benchmarkComparison() {
  const testDate = new Date('2025-06-21');
  const dates = Array.from({ length: 365 }, (_, i) => {
    const d = new Date(testDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  console.log('📊 Performance Benchmark: 365 datas');
  console.log('=====================================');

  // Benchmark Python
  const pyStart = performance.now();
  await lunarComputeClient.getLunarBatch(dates, { includeZodiac: true });
  const pyEnd = performance.now();

  console.log(`✅ Python Service: ${(pyEnd - pyStart).toFixed(2)}ms`);
  console.log(`   (~${((pyEnd - pyStart) / 365).toFixed(2)}ms por data)`);

  // Nota: JavaScript original seria muito mais lento
  // Esperado: Python ~30-50% mais rápido
}

export { benchmarkComparison };
