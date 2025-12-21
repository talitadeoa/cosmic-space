import { cookies } from "next/headers";
import AuthGate from "@/components/AuthGate";
import type { TimelineFiltersState, TimelineResponse } from "@/types/timeline";
import { getTimelineEntries } from "@/lib/timeline";
import { getTokenPayload, validateToken } from "@/lib/auth";
import { allowedTypes, parseTimelineQuery, periodDays } from "@/lib/timelineQuery";
import TimelineClient from "./TimelineClient";

export const dynamic = "force-dynamic";

type TimelinePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const buildSearchParams = (
  searchParams: TimelinePageProps["searchParams"]
): URLSearchParams => {
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

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const params = buildSearchParams(searchParams);
  const { period, types, moonPhase, page, pageSize, typesParam } =
    parseTimelineQuery(params);
  const resolvedPageSize = params.get("pageSize") ? pageSize : 10;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const isAuthenticated = token ? validateToken(token) : false;
  const userId = isAuthenticated && token ? getTokenPayload(token)?.userId : null;

  let error: string | null = null;
  let typeError: string | null = null;
  let meta: TimelineResponse | null = null;

  if (!isAuthenticated) {
    error = "Nao autenticado";
  } else if (!userId) {
    error = "Usuario nao identificado";
  }

  if (typesParam && types.length === 0) {
    typeError = "Selecione ao menos um tipo.";
  }

  if (!error && !typeError && userId) {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - periodDays[period]);

    const { items, total } = await getTimelineEntries({
      userId,
      start,
      end,
      types: types.length ? types : allowedTypes,
      moonPhase,
      page,
      pageSize: resolvedPageSize,
    });

    const totalPages = Math.max(1, Math.ceil(total / resolvedPageSize));
    meta = {
      items,
      page,
      pageSize: resolvedPageSize,
      totalItems: total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };
  }

  const filters: TimelineFiltersState = {
    period,
    types,
    moonPhase,
  };

  return (
    <AuthGate>
      <TimelineClient
        filters={filters}
        meta={meta}
        page={page}
        pageSize={resolvedPageSize}
        error={error}
        typeError={typeError}
      />
    </AuthGate>
  );
}
