import type { TimelineItemType, TimelinePeriod } from '@/types/timeline';

export const allowedPeriods: TimelinePeriod[] = ['30d', '90d', '1y'];
export const allowedTypes: TimelineItemType[] = ['mensal', 'trimestral', 'anual', 'energia'];

export const periodDays: Record<TimelinePeriod, number> = {
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

const parsePeriod = (value: string | null): TimelinePeriod => {
  if (!value) return '90d';
  return allowedPeriods.includes(value as TimelinePeriod) ? (value as TimelinePeriod) : '90d';
};

const parseTypes = (value: string | null): TimelineItemType[] => {
  if (!value) return allowedTypes;
  const items = value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const filtered = items.filter((item): item is TimelineItemType =>
    (allowedTypes as string[]).includes(item)
  );
  return filtered.length ? filtered : [];
};

const parsePageNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
};

const clampPageSize = (value: string | null) => {
  const fallback = 12;
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 50);
};

export type TimelineQueryParams = {
  period: TimelinePeriod;
  types: TimelineItemType[];
  moonPhase: string | null;
  page: number;
  pageSize: number;
  typesParam: string | null;
};

export const parseTimelineQuery = (params: URLSearchParams): TimelineQueryParams => {
  const periodParam = params.get('period');
  const typesParam = params.get('types');
  const moonPhase = params.get('moonPhase');
  const pageParam = params.get('page');
  const pageSizeParam = params.get('pageSize');

  const period = parsePeriod(periodParam);
  const types = parseTypes(typesParam);
  const page = parsePageNumber(pageParam, 1);
  const pageSize = clampPageSize(pageSizeParam);

  return {
    period,
    types,
    moonPhase: moonPhase && moonPhase.trim() ? moonPhase.trim() : null,
    page,
    pageSize,
    typesParam,
  };
};
