import { getDb } from "./db";

export type MoonPhase = "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante";
export type PhaseInputType = "energia" | "tarefa" | "insight_trimestral";

export interface PhaseInputRecord {
  id: number;
  userId: number;
  moonPhase: MoonPhase;
  inputType: PhaseInputType;
  sourceId: string | null;
  content: string;
  vibe: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface PhaseInputSave {
  moonPhase: MoonPhase;
  inputType: PhaseInputType;
  sourceId?: string | null;
  content: string;
  vibe?: string | null;
  metadata?: Record<string, any> | null;
}

export interface PhaseInputListParams {
  moonPhase?: MoonPhase | null;
  inputType?: PhaseInputType | null;
  limit?: number;
}

export async function savePhaseInput(
  userId: string | number,
  data: PhaseInputSave,
): Promise<PhaseInputRecord> {
  try {
    const db = getDb();
    const rows = (await db`
      INSERT INTO phase_inputs (
        user_id,
        moon_phase,
        input_type,
        source_id,
        content,
        vibe,
        metadata
      )
      VALUES (
        ${userId},
        ${data.moonPhase},
        ${data.inputType},
        ${data.sourceId ?? null},
        ${data.content},
        ${data.vibe ?? null},
        ${data.metadata ?? {}}
      )
      ON CONFLICT (user_id, input_type, source_id)
      DO UPDATE SET
        moon_phase = EXCLUDED.moon_phase,
        content = EXCLUDED.content,
        vibe = EXCLUDED.vibe,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING
        id,
        user_id,
        moon_phase,
        input_type,
        source_id,
        content,
        vibe,
        metadata,
        created_at,
        updated_at
    `) as any[];

    const row = rows[0];
    return {
      id: Number(row.id),
      userId: Number(row.user_id),
      moonPhase: row.moon_phase as MoonPhase,
      inputType: row.input_type as PhaseInputType,
      sourceId: row.source_id ?? null,
      content: row.content ?? "",
      vibe: row.vibe ?? null,
      metadata: row.metadata ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? null,
    };
  } catch (error) {
    console.error("Erro ao salvar phase input no banco", error);
    throw error;
  }
}

export async function listPhaseInputs(
  userId: string | number,
  params: PhaseInputListParams = {},
): Promise<PhaseInputRecord[]> {
  try {
    const db = getDb();
    const limit = params.limit ?? 120;
    const rows = (await db`
      SELECT
        id,
        user_id,
        moon_phase,
        input_type,
        source_id,
        content,
        vibe,
        metadata,
        created_at,
        updated_at
      FROM phase_inputs
      WHERE user_id = ${userId}
        AND (${params.moonPhase ?? null}::TEXT IS NULL OR moon_phase = ${params.moonPhase})
        AND (${params.inputType ?? null}::TEXT IS NULL OR input_type = ${params.inputType})
      ORDER BY created_at DESC
      LIMIT ${limit}
    `) as any[];

    return rows.map((row) => ({
      id: Number(row.id),
      userId: Number(row.user_id),
      moonPhase: row.moon_phase as MoonPhase,
      inputType: row.input_type as PhaseInputType,
      sourceId: row.source_id ?? null,
      content: row.content ?? "",
      vibe: row.vibe ?? null,
      metadata: row.metadata ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at ?? null,
    }));
  } catch (error) {
    console.error("Erro ao listar phase inputs no banco", error);
    throw error;
  }
}
