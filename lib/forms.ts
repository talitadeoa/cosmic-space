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
      ON CONFLICT (user_id, moon_phase, month_number)
      DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW()
      RETURNING id, user_id, moon_phase, month_number, insight, created_at, updated_at
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
  quarterNumber: number,
  insight: string
) {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO quarterly_insights (user_id, moon_phase, quarter_number, insight)
      VALUES (${userId}, ${moonPhase}, ${quarterNumber}, ${insight})
      ON CONFLICT (user_id, moon_phase, quarter_number)
      DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW()
      RETURNING id, user_id, moon_phase, quarter_number, insight, created_at, updated_at
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
  insight: string,
  year?: number
) {
  try {
    const db = getDb();
    const y = year ?? new Date().getFullYear();
    const rows = (await db`
      INSERT INTO annual_insights (user_id, year, insight)
      VALUES (${userId}, ${y}, ${insight})
      ON CONFLICT (user_id, year)
      DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW()
      RETURNING id, user_id, year, insight, created_at, updated_at
    `) as any[];

    return rows[0];
  } catch (error) {
    console.error("Erro ao salvar annual insight no banco", error);
    throw error;
  }
}

// ========== LEITURA DE INSIGHTS ==========

// Obter Insights Mensais
export async function getMonthlyInsights(
  userId: string | number,
  monthNumber?: number
) {
  try {
    const db = getDb();
    const month = monthNumber ?? new Date().getMonth() + 1;
    
    const rows = (await db`
      SELECT id, user_id, moon_phase, month_number, insight, created_at, updated_at
      FROM monthly_insights
      WHERE user_id = ${userId} AND month_number = ${month}
      ORDER BY 
        CASE 
          WHEN moon_phase = 'luaNova' THEN 1
          WHEN moon_phase = 'luaCrescente' THEN 2
          WHEN moon_phase = 'luaCheia' THEN 3
          WHEN moon_phase = 'luaMinguante' THEN 4
        END
    `) as any[];

    return rows;
  } catch (error) {
    console.error("Erro ao obter monthly insights", error);
    throw error;
  }
}

// Obter um Insight Mensal específico
export async function getMonthlyInsight(
  userId: string | number,
  moonPhase: string,
  monthNumber: number
) {
  try {
    const db = getDb();
    
    const rows = (await db`
      SELECT id, user_id, moon_phase, month_number, insight, created_at, updated_at
      FROM monthly_insights
      WHERE user_id = ${userId} AND moon_phase = ${moonPhase} AND month_number = ${monthNumber}
    `) as any[];

    return rows[0] ?? null;
  } catch (error) {
    console.error("Erro ao obter monthly insight", error);
    throw error;
  }
}

// Obter Insights Trimestrais
export async function getQuarterlyInsights(
  userId: string | number,
  quarterNumber?: number
) {
  try {
    const db = getDb();
    const month = new Date().getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    const q = quarterNumber ?? quarter;
    
    const rows = (await db`
      SELECT id, user_id, moon_phase, quarter_number, insight, created_at, updated_at
      FROM quarterly_insights
      WHERE user_id = ${userId} AND quarter_number = ${q}
      ORDER BY 
        CASE 
          WHEN moon_phase = 'luaNova' THEN 1
          WHEN moon_phase = 'luaCrescente' THEN 2
          WHEN moon_phase = 'luaCheia' THEN 3
          WHEN moon_phase = 'luaMinguante' THEN 4
        END
    `) as any[];

    return rows;
  } catch (error) {
    console.error("Erro ao obter quarterly insights", error);
    throw error;
  }
}

// Obter um Insight Trimestral específico
export async function getQuarterlyInsight(
  userId: string | number,
  moonPhase: string,
  quarterNumber: number
) {
  try {
    const db = getDb();
    
    const rows = (await db`
      SELECT id, user_id, moon_phase, quarter_number, insight, created_at, updated_at
      FROM quarterly_insights
      WHERE user_id = ${userId} AND moon_phase = ${moonPhase} AND quarter_number = ${quarterNumber}
    `) as any[];

    return rows[0] ?? null;
  } catch (error) {
    console.error("Erro ao obter quarterly insight", error);
    throw error;
  }
}

// Obter Insight Anual
export async function getAnnualInsight(
  userId: string | number,
  year?: number
) {
  try {
    const db = getDb();
    const y = year ?? new Date().getFullYear();
    
    const rows = (await db`
      SELECT id, user_id, year, insight, created_at, updated_at
      FROM annual_insights
      WHERE user_id = ${userId} AND year = ${y}
    `) as any[];

    return rows[0] ?? null;
  } catch (error) {
    console.error("Erro ao obter annual insight", error);
    throw error;
  }
}

// Obter todos os Insights Anuais de um usuário
export async function getAnnualInsights(userId: string | number) {
  try {
    const db = getDb();
    
    const rows = (await db`
      SELECT id, user_id, year, insight, created_at, updated_at
      FROM annual_insights
      WHERE user_id = ${userId}
      ORDER BY year DESC
    `) as any[];

    return rows;
  } catch (error) {
    console.error("Erro ao obter annual insights", error);
    throw error;
  }
}

// Listar todos os insights de um usuário (combinado)
export async function getAllInsights(userId: string | number) {
  try {
    const db = getDb();
    
    const rows = (await db`
      SELECT 
        'mensal'::TEXT as tipo,
        moon_phase,
        month_number::TEXT as periodo,
        insight,
        created_at
      FROM monthly_insights
      WHERE user_id = ${userId}
      
      UNION ALL
      
      SELECT 
        'trimestral'::TEXT,
        moon_phase,
        quarter_number::TEXT,
        insight,
        created_at
      FROM quarterly_insights
      WHERE user_id = ${userId}
      
      UNION ALL
      
      SELECT 
        'anual'::TEXT,
        NULL as moon_phase,
        year::TEXT,
        insight,
        created_at
      FROM annual_insights
      WHERE user_id = ${userId}
      
      ORDER BY created_at DESC
    `) as any[];

    return rows;
  } catch (error) {
    console.error("Erro ao obter todos os insights", error);
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

// Lunações
export interface LunationData {
  lunation_date: string; // ISO YYYY-MM-DD
  moon_phase: string;
  zodiac_sign: string;
  illumination?: number;
  age_days?: number;
  description?: string;
  source?: string;
}

export async function saveLunations(lunations: LunationData[]): Promise<any[]> {
  try {
    const db = getDb();
    
    // Inserir um por um para garantir consistência
    const results: any[] = [];
    
    for (const l of lunations) {
      const rows = (await db`
        INSERT INTO lunations (lunation_date, moon_phase, zodiac_sign, illumination, age_days, description, source)
        VALUES (${l.lunation_date}, ${l.moon_phase}, ${l.zodiac_sign}, ${l.illumination ?? null}, ${l.age_days ?? null}, ${l.description ?? null}, ${l.source ?? 'generated'})
        ON CONFLICT (lunation_date) DO UPDATE SET
          moon_phase = EXCLUDED.moon_phase,
          zodiac_sign = EXCLUDED.zodiac_sign,
          illumination = EXCLUDED.illumination,
          age_days = EXCLUDED.age_days,
          description = EXCLUDED.description,
          updated_at = NOW()
        RETURNING id, lunation_date, moon_phase, zodiac_sign, illumination, age_days, description, created_at, updated_at
      `) as any[];
      
      if (rows.length > 0) {
        results.push(rows[0]);
      }
    }

    return results;
  } catch (error) {
    console.error("Erro ao salvar lunações no banco", error);
    throw error;
  }
}

export async function getLunations(
  startDate: string,
  endDate: string
): Promise<LunationData[]> {
  try {
    const db = getDb();
    const rows = (await db`
      SELECT 
        lunation_date, 
        moon_phase, 
        zodiac_sign, 
        illumination, 
        age_days, 
        description,
        source,
        created_at
      FROM lunations
      WHERE lunation_date >= ${startDate} AND lunation_date <= ${endDate}
      ORDER BY lunation_date ASC
    `) as any[];

    return rows;
  } catch (error) {
    console.error("Erro ao buscar lunações no banco", error);
    throw error;
  }
}

export async function deleteLunations(startDate: string, endDate: string): Promise<number> {
  try {
    const db = getDb();
    const result = (await db`
      DELETE FROM lunations
      WHERE lunation_date >= ${startDate} AND lunation_date <= ${endDate}
      RETURNING id
    `) as any[];
    return result.length;
  } catch (error) {
    console.error("Erro ao deletar lunações no banco", error);
    throw error;
  }
}

