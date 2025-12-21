import { NextRequest, NextResponse } from "next/server";
import { validateToken, getTokenPayload } from "@/lib/auth";
import { getTimelineEntries } from "@/lib/timeline";
import type { TimelineItemType, TimelinePeriod } from "@/types/timeline";

export const dynamic = "force-dynamic";

const allowedPeriods: TimelinePeriod[] = ["30d", "90d", "1y"];
const allowedTypes: TimelineItemType[] = [
  "mensal",
  "trimestral",
  "anual",
  "energia",
];

const periodDays: Record<TimelinePeriod, number> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

const parsePeriod = (value: string | null): TimelinePeriod => {
  if (!value) return "90d";
  return allowedPeriods.includes(value as TimelinePeriod)
    ? (value as TimelinePeriod)
    : "90d";
};

const parseTypes = (value: string | null): TimelineItemType[] | null => {
  if (!value) return allowedTypes;
  const items = value
    .split(",")
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

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const tokenPayload = getTokenPayload(token);
    const userId = tokenPayload?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Usuario nao identificado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get("period");
    const typesParam = searchParams.get("types");
    const moonPhase = searchParams.get("moonPhase");
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");

    const period = parsePeriod(periodParam);
    const types = parseTypes(typesParam);

    if (typesParam && types && types.length === 0) {
      return NextResponse.json(
        { error: "Tipos invalidos. Use mensal,trimestral,anual,energia." },
        { status: 400 }
      );
    }

    const page = parsePageNumber(pageParam, 1);
    const pageSize = clampPageSize(pageSizeParam);

    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - periodDays[period]);

    const { items, total } = await getTimelineEntries({
      userId,
      start,
      end,
      types: types ?? allowedTypes,
      moonPhase: moonPhase && moonPhase.trim() ? moonPhase.trim() : null,
      page,
      pageSize,
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      items,
      page,
      pageSize,
      totalItems: total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar timeline:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
