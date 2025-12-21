import { getDb } from "./db";
import type { TimelineItem, TimelineItemType } from "@/types/timeline";

const normalizeIso = (value: Date | string | null): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const normalizeIsoDate = (value: Date | string | null): string | null => {
  const iso = normalizeIso(value);
  if (!iso) return null;
  return iso.slice(0, 10);
};

export type TimelineQuery = {
  userId: string | number;
  start: Date;
  end: Date;
  types: TimelineItemType[];
  moonPhase: string | null;
  page: number;
  pageSize: number;
};

export async function getTimelineEntries(query: TimelineQuery) {
  const { userId, start, end, types, moonPhase, page, pageSize } = query;
  const offset = (page - 1) * pageSize;
  const db = getDb();

  const rows = (await db`
    WITH base AS (
      SELECT
        id::TEXT,
        'mensal'::TEXT as type,
        created_at as recorded_at,
        moon_phase,
        month_number::TEXT as period,
        insight,
        NULL::INT as energy_level,
        NULL::DATE as phase_date
      FROM monthly_insights
      WHERE user_id = ${userId}
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND (${moonPhase}::TEXT IS NULL OR moon_phase = ${moonPhase})
        AND 'mensal' = ANY(${types})

      UNION ALL

      SELECT
        id::TEXT,
        'trimestral'::TEXT,
        created_at,
        moon_phase,
        quarter_number::TEXT,
        insight,
        NULL::INT,
        NULL::DATE
      FROM quarterly_insights
      WHERE user_id = ${userId}
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND (${moonPhase}::TEXT IS NULL OR moon_phase = ${moonPhase})
        AND 'trimestral' = ANY(${types})

      UNION ALL

      SELECT
        id::TEXT,
        'anual'::TEXT,
        created_at,
        NULL::TEXT as moon_phase,
        year::TEXT,
        insight,
        NULL::INT,
        NULL::DATE
      FROM annual_insights
      WHERE user_id = ${userId}
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND (${moonPhase}::TEXT IS NULL)
        AND 'anual' = ANY(${types})

      UNION ALL

      SELECT
        id::TEXT,
        'energia'::TEXT,
        created_at,
        moon_phase,
        NULL::TEXT as period,
        NULL::TEXT as insight,
        energy_level,
        phase_date
      FROM lunar_phases
      WHERE user_id = ${userId}
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND (${moonPhase}::TEXT IS NULL OR moon_phase = ${moonPhase})
        AND 'energia' = ANY(${types})
    )
    SELECT
      id,
      type,
      recorded_at,
      moon_phase,
      period,
      insight,
      energy_level,
      phase_date
    FROM base
    ORDER BY recorded_at DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `) as any[];

  const countRows = (await db`
    WITH base AS (
      SELECT id FROM monthly_insights
      WHERE user_id = ${userId}
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND (${moonPhase}::TEXT IS NULL OR moon_phase = ${moonPhase})
        AND 'mensal' = ANY(${types})

      UNION ALL

      SELECT id FROM quarterly_insights
      WHERE user_id = ${userId}
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND (${moonPhase}::TEXT IS NULL OR moon_phase = ${moonPhase})
        AND 'trimestral' = ANY(${types})

      UNION ALL

      SELECT id FROM annual_insights
      WHERE user_id = ${userId}
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND (${moonPhase}::TEXT IS NULL)
        AND 'anual' = ANY(${types})

      UNION ALL

      SELECT id FROM lunar_phases
      WHERE user_id = ${userId}
        AND created_at >= ${start}
        AND created_at <= ${end}
        AND (${moonPhase}::TEXT IS NULL OR moon_phase = ${moonPhase})
        AND 'energia' = ANY(${types})
    )
    SELECT COUNT(*)::INT as total
    FROM base
  `) as { total: number }[];

  const total = countRows[0]?.total ?? 0;

  const items: TimelineItem[] = rows.map((row) => {
    const energyLevel =
      row.energy_level === null || row.energy_level === undefined
        ? null
        : Number(row.energy_level);

    return {
      id: String(row.id),
      type: row.type as TimelineItemType,
      recordedAt: normalizeIso(row.recorded_at) ?? new Date().toISOString(),
      moonPhase: row.moon_phase ?? null,
      period: row.period ?? null,
      insight: row.insight ?? null,
      energyLevel: Number.isNaN(energyLevel) ? null : energyLevel,
      phaseDate: normalizeIsoDate(row.phase_date),
    };
  });

  return { items, total };
}
