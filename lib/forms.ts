import { getDb } from "./db";

export type FormEntryType =
  | "subscribe"
  | "contact"
  | "insight_anual"
  | "insight_mensal"
  | "insight_lunar"
  | "insight_trimestral"
  | "checklist";

export interface FormEntryInput {
  type: FormEntryType;
  name?: string | null;
  email?: string | null;
  message?: string | null;
  source?: string | null;
  payload?: Record<string, any> | null;
}

export interface FormEntryRow extends FormEntryInput {
  id: number;
  created_at: string;
}

export async function saveFormEntry(entry: FormEntryInput): Promise<FormEntryRow> {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO form_entries (type, name, email, message, source, payload)
      VALUES (
        ${entry.type},
        ${entry.name ?? null},
        ${entry.email ?? null},
        ${entry.message ?? null},
        ${entry.source ?? null},
        ${entry.payload ?? {}}
      )
      RETURNING id, type, name, email, message, source, payload, created_at
    `) as any[];

    const [row] = rows;

    return row as FormEntryRow;
  } catch (error) {
    console.error("Erro ao salvar formulário no banco", error);
    throw error;
  }
}

export async function listFormEntries(
  types?: FormEntryType[],
  limit = 200
): Promise<FormEntryRow[]> {
  try {
    const db = getDb();

    const rows = (types?.length
      ? await db`
          SELECT id, type, name, email, message, source, payload, created_at
          FROM form_entries
          WHERE type = ANY(${types})
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : await db`
          SELECT id, type, name, email, message, source, payload, created_at
          FROM form_entries
          ORDER BY created_at DESC
          LIMIT ${limit}
        `) as any[];

    return rows as FormEntryRow[];
  } catch (error) {
    console.error("Erro ao listar formulários no banco", error);
    throw error;
  }
}

// Insights Mensais
export async function saveMonthlyInsight(
  userId: string | number,
  moonPhase: string,
  monthNumber: number,
  insight: string
) {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
      VALUES (${userId}, ${moonPhase}, ${monthNumber}, ${insight})
      RETURNING id, user_id, moon_phase, month_number, insight, created_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error("Erro ao salvar monthly insight no banco", error);
    throw error;
  }
}

// Insights Trimestrais
export async function saveQuarterlyInsight(
  userId: string | number,
  moonPhase: string,
  insight: string
) {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO quarterly_insights (user_id, moon_phase, insight)
      VALUES (${userId}, ${moonPhase}, ${insight})
      RETURNING id, user_id, moon_phase, insight, created_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error("Erro ao salvar quarterly insight no banco", error);
    throw error;
  }
}

// Insights Anuais
export async function saveAnnualInsight(
  userId: string | number,
  insight: string
) {
  try {
    const db = getDb();
    const year = new Date().getFullYear();
    const rows = (await db`
      INSERT INTO annual_insights (user_id, year, insight)
      VALUES (${userId}, ${year}, ${insight})
      RETURNING id, user_id, year, insight, created_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error("Erro ao salvar annual insight no banco", error);
    throw error;
  }
}

// Fases Lunares
export async function saveLunarPhase(
  userId: string | number,
  data: {
    data: string;
    faseLua: string;
    signo: string;
    energia?: number | null;
    checks?: string;
    observacoes?: string;
    energiaDaFase?: string;
    intencoesLua?: string;
    intencoesSemana?: string;
    intencoesAno?: string;
  }
) {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO lunar_phases (
        user_id, phase_date, moon_phase, zodiac_sign, energy_level,
        checks, observations, phase_energy, moon_intentions,
        week_intentions, year_intentions
      )
      VALUES (
        ${userId}, ${data.data}, ${data.faseLua}, ${data.signo},
        ${data.energia ?? null}, ${data.checks ?? null}, 
        ${data.observacoes ?? null}, ${data.energiaDaFase ?? null},
        ${data.intencoesLua ?? null}, ${data.intencoesSemana ?? null},
        ${data.intencoesAno ?? null}
      )
      RETURNING id, user_id, phase_date, moon_phase, zodiac_sign, energy_level, created_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error("Erro ao salvar lunar phase no banco", error);
    throw error;
  }
}

// Ilhas
export async function saveIsland(
  userId: string | number,
  islandKey: string,
  data: {
    titulo?: string;
    tag?: string;
    descricao?: string;
    energia?: number | null;
    prioridade?: number | null;
  }
) {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO islands (user_id, island_key, title, tag, description, energy_level, priority)
      VALUES (${userId}, ${islandKey}, ${data.titulo ?? null}, ${data.tag ?? null}, 
              ${data.descricao ?? null}, ${data.energia ?? null}, ${data.prioridade ?? null})
      ON CONFLICT (user_id, island_key) DO UPDATE SET
        title = EXCLUDED.title,
        tag = EXCLUDED.tag,
        description = EXCLUDED.description,
        energy_level = EXCLUDED.energy_level,
        priority = EXCLUDED.priority,
        updated_at = NOW()
      RETURNING id, user_id, island_key, title, tag, description, energy_level, priority, created_at, updated_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error("Erro ao salvar island no banco", error);
    throw error;
  }
}

