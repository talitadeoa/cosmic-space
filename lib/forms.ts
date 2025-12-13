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
