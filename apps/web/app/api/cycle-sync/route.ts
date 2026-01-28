import { NextRequest, NextResponse } from 'next/server';
import { validateToken, getTokenPayload } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface CycleRow {
  id: string;
  user_id: string;
  date: string;
  flow_intensity: 'light' | 'moderate' | 'heavy';
  symptoms: string[];
  notes: string | null;
  moon_phase: string | null;
  recorded_at: string;
  updated_at: string;
}

interface SyncCycleRequest {
  date: string;
  flow_intensity: 'light' | 'moderate' | 'heavy';
  symptoms: string[];
  notes?: string;
  moon_phase?: string;
}

// GET - Buscar registros de ciclo do usuário
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token || !(await validateToken(token))) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const payload = await getTokenPayload(token);
    const userId = payload?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const sql = getDb();

    // Parâmetros de query opcionais
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let cycles: CycleRow[];

    if (startDate && endDate) {
      cycles = await sql`
        SELECT id, user_id, date, flow_intensity, symptoms, notes, moon_phase, recorded_at, updated_at
        FROM user_cycles
        WHERE user_id = ${userId} AND date >= ${startDate} AND date <= ${endDate}
        ORDER BY date DESC
        LIMIT ${limit}
      ` as CycleRow[];
    } else if (startDate) {
      cycles = await sql`
        SELECT id, user_id, date, flow_intensity, symptoms, notes, moon_phase, recorded_at, updated_at
        FROM user_cycles
        WHERE user_id = ${userId} AND date >= ${startDate}
        ORDER BY date DESC
        LIMIT ${limit}
      ` as CycleRow[];
    } else if (endDate) {
      cycles = await sql`
        SELECT id, user_id, date, flow_intensity, symptoms, notes, moon_phase, recorded_at, updated_at
        FROM user_cycles
        WHERE user_id = ${userId} AND date <= ${endDate}
        ORDER BY date DESC
        LIMIT ${limit}
      ` as CycleRow[];
    } else {
      cycles = await sql`
        SELECT id, user_id, date, flow_intensity, symptoms, notes, moon_phase, recorded_at, updated_at
        FROM user_cycles
        WHERE user_id = ${userId}
        ORDER BY date DESC
        LIMIT ${limit}
      ` as CycleRow[];
    }

    return NextResponse.json({
      success: true,
      cycles: cycles.map(c => ({
        id: c.id,
        date: c.date,
        flowIntensity: c.flow_intensity,
        symptoms: c.symptoms || [],
        notes: c.notes,
        moonPhase: c.moon_phase,
        recordedAt: c.recorded_at,
        updatedAt: c.updated_at
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar ciclos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar registro de ciclo
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token || !(await validateToken(token))) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const payload = await getTokenPayload(token);
    const userId = payload?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const sql = getDb();
    const body: SyncCycleRequest = await request.json();

    // Validação
    if (!body.date || !body.flow_intensity) {
      return NextResponse.json(
        { error: 'Data e intensidade do fluxo são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['light', 'moderate', 'heavy'].includes(body.flow_intensity)) {
      return NextResponse.json(
        { error: 'Intensidade do fluxo inválida' },
        { status: 400 }
      );
    }

    // Upsert - atualiza se já existe, insere se não
    const result = await sql`
      INSERT INTO user_cycles (user_id, date, flow_intensity, symptoms, notes, moon_phase)
      VALUES (
        ${userId}, 
        ${body.date}, 
        ${body.flow_intensity}, 
        ${body.symptoms || []}, 
        ${body.notes || null}, 
        ${body.moon_phase || null}
      )
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        flow_intensity = EXCLUDED.flow_intensity,
        symptoms = EXCLUDED.symptoms,
        notes = EXCLUDED.notes,
        moon_phase = EXCLUDED.moon_phase,
        updated_at = NOW()
      RETURNING id, date, flow_intensity, symptoms, notes, moon_phase, recorded_at, updated_at
    ` as CycleRow[];

    const cycle = result[0];

    return NextResponse.json({
      success: true,
      message: 'Ciclo registrado com sucesso',
      cycle: {
        id: cycle.id,
        date: cycle.date,
        flowIntensity: cycle.flow_intensity,
        symptoms: cycle.symptoms || [],
        notes: cycle.notes,
        moonPhase: cycle.moon_phase,
        recordedAt: cycle.recorded_at,
        updatedAt: cycle.updated_at
      }
    });

  } catch (error) {
    console.error('Erro ao salvar ciclo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover registro de ciclo
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token || !(await validateToken(token))) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const payload = await getTokenPayload(token);
    const userId = payload?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const id = searchParams.get('id');

    if (!date && !id) {
      return NextResponse.json(
        { error: 'Data ou ID do registro é obrigatório' },
        { status: 400 }
      );
    }

    let deleted;
    if (id) {
      deleted = await sql`
        DELETE FROM user_cycles 
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id
      `;
    } else {
      deleted = await sql`
        DELETE FROM user_cycles 
        WHERE date = ${date} AND user_id = ${userId}
        RETURNING id
      `;
    }

    const deletedRows = deleted as { id: string }[];
    if (!deletedRows || deletedRows.length === 0) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registro removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar ciclo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
