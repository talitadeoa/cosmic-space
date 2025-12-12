export type NormalizedMoonPhase =
  | "luaNova"
  | "luaCrescente"
  | "luaCheia"
  | "luaMinguante"
  | "desconhecida";

export type MoonEvent = {
  title: string;
  description?: string;
  kind?: string;
};

export type MoonCalendarDay = {
  date: string; // ISO 8601 (YYYY-MM-DD)
  moonPhase: string; // raw from backend (kept for traceability)
  sign?: string;
  timezone?: string;
  events?: MoonEvent[];
  meta?: Record<string, unknown>;
  normalizedPhase?: NormalizedMoonPhase;
};

export type MoonCalendarResponse = {
  days: MoonCalendarDay[];
  generatedAt?: string;
  source?: string;
};

const REMOTE_ENDPOINT = "/v1/moons";
const FALLBACK_ENDPOINT = "/api/moons";
const BASE_URL = (process.env.NEXT_PUBLIC_MOON_API_URL || process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");

const buildEndpoint = () => (BASE_URL ? `${BASE_URL}${REMOTE_ENDPOINT}` : FALLBACK_ENDPOINT);

const toIso = (value: string | undefined) => (value ? value.slice(0, 10) : "");

const coerceDay = (input: any): MoonCalendarDay | null => {
  if (!input) return null;

  const date = toIso(input.date || input.data || input.day);
  const moonPhase = (input.moonPhase || input.phase || input.fase || input.faseLua || "").toString();
  const sign = (input.sign || input.signo || input.zodiac || "").toString();

  if (!date || !moonPhase) return null;

  return {
    date,
    moonPhase,
    sign: sign || undefined,
    timezone: input.timezone || input.tz || undefined,
    events: Array.isArray(input.events || input.eventos) ? input.events || input.eventos : undefined,
    meta: input.meta || undefined,
  };
};

export const normalizeMoonPhase = (phase?: string | null): NormalizedMoonPhase => {
  if (!phase) return "desconhecida";
  const value = phase.toLowerCase();

  if (value.includes("new") || value.includes("nova")) return "luaNova";
  if (value.includes("full") || value.includes("cheia")) return "luaCheia";
  if (value.includes("wax") || value.includes("cresc")) return "luaCrescente";
  if (value.includes("wan") || value.includes("ming")) return "luaMinguante";

  return "desconhecida";
};

const parseBackendError = async (response: Response) => {
  try {
    const data = await response.json();
    return typeof data?.error === "string"
      ? data.error
      : typeof data?.message === "string"
        ? data.message
        : `Código ${response.status}`;
  } catch (error) {
    return `Código ${response.status}`;
  }
};

export async function fetchMoonCalendar(params: {
  start: string;
  end: string;
  tz?: string;
  signal?: AbortSignal;
}): Promise<MoonCalendarResponse> {
  const endpoint = buildEndpoint();
  const searchParams = new URLSearchParams({ start: params.start, end: params.end });
  if (params.tz) searchParams.set("tz", params.tz);

  const url = `${endpoint}?${searchParams.toString()}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: params.signal,
  });

  if (!response.ok) {
    const reason = await parseBackendError(response);
    throw new Error(`Erro ao consultar fases da lua: ${reason}`);
  }

  const payload = await response.json();
  const rawDays = Array.isArray(payload?.days)
    ? payload.days
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  const days: MoonCalendarDay[] = rawDays
    .map((item: any) => coerceDay(item))
    .filter(Boolean) as MoonCalendarDay[];

  return {
    days: days.map((day) => ({
      ...day,
      normalizedPhase: normalizeMoonPhase(day.moonPhase),
    })),
    generatedAt: payload?.generatedAt || payload?.generated_at || payload?.meta?.generatedAt,
    source: payload?.source || payload?.meta?.source,
  };
}
