import 'server-only';
import { getDb } from './db';
import { logger } from './logger';
import type { LunationData } from '@/types/lunation';

export type FormEntryType =
  | 'subscribe'
  | 'contact'
  | 'insight_anual'
  | 'insight_mensal'
  | 'insight_lunar'
  | 'insight_trimestral'
  | 'checklist';

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
    logger.error('Erro ao salvar formulário no banco', error);
    throw error;
  }
}

export async function listFormEntries(
  types?: FormEntryType[],
  limit = 200
): Promise<FormEntryRow[]> {
  try {
    const db = getDb();

    const rows = (await db`
      SELECT id, type, name, email, message, source, payload, created_at
      FROM form_entries
      ${types?.length ? db`WHERE type = ANY(${types})` : db``}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as any[];

    return rows as FormEntryRow[];
  } catch (error) {
    logger.error('Erro ao listar formulários no banco', error);
    throw error;
  }
}

// ========== INSIGHTS GENÉRICOS ==========

type InsightType = 'monthly' | 'quarterly' | 'annual';

interface InsightParams {
  userId: string | number;
  moonPhase?: string;
  period?: number | string; // monthNumber, quarterNumber, year
  insight: string;
  year?: number;
}

/**
 * Salvar insight genérico (mensal, trimestral, anual)
 */
export async function saveInsight(type: InsightType, params: InsightParams) {
  try {
    const db = getDb();

    const periodType =
      type === 'monthly' ? 'monthly' : type === 'quarterly' ? 'quarterly' : 'annual';

    const year = params.year ?? new Date().getFullYear();

    const rows = (await db`
      INSERT INTO insights (user_id, period_type, period_value, year, moon_phase, content)
      VALUES (
        ${params.userId},
        ${periodType},
        ${params.period ?? null},
        ${year},
        ${params.moonPhase ?? null},
        ${params.insight}
      )
      ON CONFLICT (user_id, period_type, period_value, year, COALESCE(moon_phase, 'none'))
      DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
      RETURNING id, user_id, period_type, period_value, year, moon_phase, content, created_at, updated_at
    `) as any[];

    return rows[0];
  } catch (error) {
    logger.error(`Erro ao salvar ${type} insight no banco`, error);
    throw error;
  }
}

// Compatibilidade com código existente
export async function saveMonthlyInsight(
  userId: string | number,
  moonPhase: string,
  year: number,
  monthNumber: number,
  insight: string
) {
  return saveInsight('monthly', { userId, moonPhase, period: monthNumber, insight, year });
}

export async function saveQuarterlyInsight(
  userId: string | number,
  moonPhase: string,
  quarterNumber: number,
  insight: string
) {
  return saveInsight('quarterly', { userId, moonPhase, period: quarterNumber, insight });
}

export async function saveAnnualInsight(userId: string | number, insight: string, year?: number) {
  return saveInsight('annual', { userId, insight, year });
}

// ========== LEITURA DE INSIGHTS ==========

/**
 * Obter insights de um usuário e período
 */
export async function getInsights(
  type: InsightType,
  userId: string | number,
  period?: number | string
) {
  try {
    const db = getDb();

    const periodType =
      type === 'monthly' ? 'monthly' : type === 'quarterly' ? 'quarterly' : 'annual';

    if (periodType === 'annual') {
      const year = period ?? new Date().getFullYear();
      return await db`
        SELECT id, user_id, period_type, period_value, year, moon_phase, content, created_at, updated_at
        FROM insights
        WHERE user_id = ${userId} AND period_type = 'annual' AND year = ${year}
      `;
    }

    const periodValue =
      period ??
      (periodType === 'monthly'
        ? new Date().getMonth() + 1
        : Math.ceil((new Date().getMonth() + 1) / 3));

    return await db`
      SELECT id, user_id, period_type, period_value, year, moon_phase, content, created_at, updated_at
      FROM insights
      WHERE user_id = ${userId} AND period_type = ${periodType} AND period_value = ${periodValue}
      ORDER BY CASE 
        WHEN moon_phase = 'luaNova' THEN 1
        WHEN moon_phase = 'luaCrescente' THEN 2
        WHEN moon_phase = 'luaCheia' THEN 3
        WHEN moon_phase = 'luaMinguante' THEN 4
      END
    `;
  } catch (error) {
    logger.error(`Erro ao obter ${type} insights`, error);
    throw error;
  }
}

/**
 * Obter insight específico de um usuário, fase e período
 */
export async function getInsightByPhase(
  type: 'monthly' | 'quarterly',
  userId: string | number,
  moonPhase: string,
  period: number,
  year?: number
) {
  try {
    const db = getDb();
    const periodType = type === 'monthly' ? 'monthly' : 'quarterly';
    const queryYear = year ?? new Date().getFullYear();

    const rows = (await db`
      SELECT * FROM insights 
      WHERE user_id = ${userId} AND period_type = ${periodType} AND moon_phase = ${moonPhase} AND period_value = ${period} AND year = ${queryYear}
    `) as any[];

    return rows[0] ?? null;
  } catch (error) {
    logger.error(`Erro ao obter ${type} insight específico`, error);
    throw error;
  }
}

// Compatibilidade com código existente
export async function getMonthlyInsights(userId: string | number, monthNumber?: number) {
  return getInsights('monthly', userId, monthNumber);
}

export async function getMonthlyInsight(
  userId: string | number,
  moonPhase: string,
  year: number,
  monthNumber: number
) {
  return getInsightByPhase('monthly', userId, moonPhase, monthNumber, year);
}

export async function getQuarterlyInsights(userId: string | number, quarterNumber?: number) {
  return getInsights('quarterly', userId, quarterNumber);
}

export async function getQuarterlyInsight(
  userId: string | number,
  moonPhase: string,
  quarterNumber: number
) {
  return getInsightByPhase('quarterly', userId, moonPhase, quarterNumber);
}

export async function getAnnualInsight(userId: string | number, year?: number) {
  try {
    const db = getDb();
    const y = year ?? new Date().getFullYear();
    const rows = (await db`
      SELECT id, user_id, period_type, period_value, year, moon_phase, content, created_at, updated_at
      FROM insights
      WHERE user_id = ${userId} AND period_type = 'annual' AND year = ${y}
    `) as any[];
    return rows[0] ?? null;
  } catch (error) {
    logger.error('Erro ao obter annual insight', error);
    throw error;
  }
}

export async function getAnnualInsights(userId: string | number) {
  try {
    const db = getDb();
    return (await db`
      SELECT id, user_id, period_type, period_value, year, moon_phase, content, created_at, updated_at
      FROM insights
      WHERE user_id = ${userId} AND period_type = 'annual'
      ORDER BY year DESC
    `) as any[];
  } catch (error) {
    logger.error('Erro ao obter annual insights', error);
    throw error;
  }
}

// Listar todos os insights de um usuário (combinado)
export async function getAllInsights(userId: string | number) {
  try {
    const db = getDb();

    return (await db`
      SELECT 
        CASE 
          WHEN period_type = 'monthly' THEN 'mensal'::TEXT
          WHEN period_type = 'quarterly' THEN 'trimestral'::TEXT
          WHEN period_type = 'annual' THEN 'anual'::TEXT
        END as type,
        moon_phase, 
        COALESCE(period_value::TEXT, year::TEXT) as period_text,
        content as insight, 
        created_at 
      FROM insights 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `) as any[];
  } catch (error) {
    logger.error('Erro ao obter todos os insights', error);
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
    logger.error('Erro ao salvar lunar phase no banco', error);
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
    logger.error('Erro ao salvar island no banco', error);
    throw error;
  }
}

export interface IslandRow {
  island_key: string;
  title: string | null;
}

export async function listIslands(userId: string | number): Promise<IslandRow[]> {
  try {
    const db = getDb();
    const rows = (await db`
      SELECT island_key, title
      FROM islands
      WHERE user_id = ${userId}
      ORDER BY island_key ASC
    `) as any[];

    return rows as IslandRow[];
  } catch (error) {
    logger.error('Erro ao listar ilhas no banco', error);
    throw error;
  }
}

// Lunações
export async function saveLunations(lunations: LunationData[]): Promise<any[]> {
  try {
    if (!lunations.length) return [];

    const db = getDb();
    const results: any[] = [];

    // Inserir em pequenos batches para melhor performance
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

      if (rows.length) results.push(rows[0]);
    }

    return results;
  } catch (error) {
    logger.error('Erro ao salvar lunações no banco', error);
    throw error;
  }
}

export async function getLunations(startDate: string, endDate: string): Promise<LunationData[]> {
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
    logger.error('Erro ao buscar lunações no banco', error);
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
    logger.error('Erro ao deletar lunações no banco', error);
    throw error;
  }
}
