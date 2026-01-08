/**
 * 📍 Rota: /emocoes/historico
 *
 * Timeline emocional com filtros.
 * Migração: /timeline → /emocoes/historico
 *
 * @see /doc/CONVENCAO_ROTAS_BASEADA_EM_DOMINIO.md
 */

import { cookies } from 'next/headers';
import { AuthGate } from '@/components/auth';
import type { TimelineFiltersState, TimelineResponse } from '@/types/timeline';
import { getTimelineEntries } from '@/lib/timeline';
import { getTokenPayload, validateToken } from '@/lib/auth';
import { allowedTypes, parseTimelineQuery, periodDays } from '@/lib/timelineQuery';
import TimelineClient from '@/app/timeline/TimelineClient';

export const dynamic = 'force-dynamic';

type HistoricoPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const buildSearchParams = (searchParams: HistoricoPageProps['searchParams']): URLSearchParams => {
  const params = new URLSearchParams();
  if (!searchParams) return params;

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry) params.append(key, entry);
      });
      return;
    }

    if (value) params.set(key, value);
  });

  return params;
};

export default async function HistoricoEmocionalPage({ searchParams }: HistoricoPageProps) {
  const params = buildSearchParams(searchParams);
  const { period, types, moonPhase, page, pageSize, typesParam } = parseTimelineQuery(params);
  const resolvedPageSize = params.get('pageSize') ? pageSize : 10;

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const isAuthenticated = token ? await validateToken(token) : false;
  const userId = isAuthenticated && token ? (await getTokenPayload(token))?.userId : null;

  let error: string | null = null;
  let typeError: string | null = null;
  let meta: TimelineResponse | null = null;

  if (!isAuthenticated) {
    error = 'Não autenticado';
  } else if (!userId) {
    error = 'Usuário não identificado';
  } else {
    const invalidTypes = typesParam
      .split(',')
      .filter((t: string) => t && !allowedTypes.includes(t as TimelineFiltersState['types'][number]));

    if (invalidTypes.length > 0) {
      typeError = `Tipos inválidos: ${invalidTypes.join(', ')}. Tipos válidos: ${allowedTypes.join(', ')}`;
    }

    const response = await getTimelineEntries(userId, {
      days: periodDays[period],
      types,
      moonPhase,
      page,
      pageSize: resolvedPageSize,
    });

    if ('error' in response) {
      error = response.error;
    } else {
      meta = response;
    }
  }

  const initialFilters: TimelineFiltersState = {
    period,
    types,
    moonPhase,
  };

  const pagination = {
    page,
    pageSize: resolvedPageSize,
  };

  return (
    <AuthGate fallback={<div className="text-white p-8">Faça login para ver seu histórico</div>}>
      <main className="min-h-screen">
        <TimelineClient
          initialEntries={meta?.entries || []}
          initialFilters={initialFilters}
          pagination={pagination}
          totalPages={meta?.totalPages || 0}
          total={meta?.total || 0}
          error={error}
          typeError={typeError}
        />
      </main>
    </AuthGate>
  );
}
